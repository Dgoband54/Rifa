const CONFIG = {
  maxTickets: 1000,
  ticketPrice: 2,
  transactionsSheet: 'Transacciones',
  ticketsSheet: 'Boletos',
  statuses: ['pendiente', 'aprobado', 'rechazado'],
  formFields: {
    nombre: 'Nombre',
    apellido: 'Apellido',
    whatsapp: 'numero de WhatsApp',
    cantidad: 'Numero de Boletos',
    voucher: 'Adjunta una captura de tu voucher'
  }
};

function setupRifaSheets() {
  const ss = SpreadsheetApp.getActive();
  const transactions = getOrCreateSheet_(ss, CONFIG.transactionsSheet);
  const tickets = getOrCreateSheet_(ss, CONFIG.ticketsSheet);

  transactions.clear();
  transactions.appendRow([
    'transaction_id',
    'fecha',
    'nombre',
    'apellido',
    'whatsapp',
    'cantidad_boletos',
    'total_pagado',
    'url_voucher',
    'estado',
    'numeros_boletos'
  ]);

  tickets.clear();
  tickets.appendRow(['numero_boleto', 'transaction_id', 'estado', 'updated_at']);

  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(CONFIG.statuses, true)
    .setAllowInvalid(false)
    .build();

  transactions.getRange('I2:I1001').setDataValidation(statusRule);
  tickets.getRange('C2:C1001').setDataValidation(statusRule);
  transactions.setFrozenRows(1);
  tickets.setFrozenRows(1);
}

function testRifaFlow() {
  setupRifaSheets();

  onFormSubmit({
    namedValues: {
      [CONFIG.formFields.nombre]: ['Diego'],
      [CONFIG.formFields.apellido]: ['Prueba Uno'],
      [CONFIG.formFields.whatsapp]: ['0999999999'],
      [CONFIG.formFields.cantidad]: ['3'],
      [CONFIG.formFields.voucher]: ['https://drive.google.com/voucher-uno']
    }
  });

  onFormSubmit({
    namedValues: {
      [CONFIG.formFields.nombre]: ['Andrea'],
      [CONFIG.formFields.apellido]: ['Prueba Dos'],
      [CONFIG.formFields.whatsapp]: ['0988888888'],
      [CONFIG.formFields.cantidad]: ['2'],
      [CONFIG.formFields.voucher]: ['https://drive.google.com/voucher-dos']
    }
  });

  const ss = SpreadsheetApp.getActive();
  const transactions = getOrCreateSheet_(ss, CONFIG.transactionsSheet);
  const firstTransactionId = transactions.getRange(2, 1).getValue();
  transactions.getRange(2, 9).setValue('rechazado');
  syncTicketStatus_(firstTransactionId, 'rechazado');

  onFormSubmit({
    namedValues: {
      [CONFIG.formFields.nombre]: ['Carlos'],
      [CONFIG.formFields.apellido]: ['Prueba Tres'],
      [CONFIG.formFields.whatsapp]: ['0977777777'],
      [CONFIG.formFields.cantidad]: ['2'],
      [CONFIG.formFields.voucher]: ['https://drive.google.com/voucher-tres']
    }
  });

  SpreadsheetApp.getUi().alert('Test listo: revisa Transacciones y Boletos. La tercera compra debe reciclar boletos rechazados.');
}

function onFormSubmit(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const values = e.namedValues || {};
    const nombre = getValue_(values, CONFIG.formFields.nombre);
    const apellido = getValue_(values, CONFIG.formFields.apellido);
    const whatsapp = getValue_(values, CONFIG.formFields.whatsapp);
    const cantidad = Number(getValue_(values, CONFIG.formFields.cantidad));
    const voucher = getValue_(values, CONFIG.formFields.voucher);

    if (!nombre || !apellido || !whatsapp) {
      throw new Error('Nombre, apellido y WhatsApp son obligatorios.');
    }
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      throw new Error('La cantidad de boletos debe ser un entero positivo.');
    }

    const ss = SpreadsheetApp.getActive();
    const transactions = getOrCreateSheet_(ss, CONFIG.transactionsSheet);
    const tickets = getOrCreateSheet_(ss, CONFIG.ticketsSheet);

    ensureHeaders_(transactions, [
      'transaction_id',
      'fecha',
      'nombre',
      'apellido',
      'whatsapp',
      'cantidad_boletos',
      'total_pagado',
      'url_voucher',
      'estado',
      'numeros_boletos'
    ]);
    ensureHeaders_(tickets, ['numero_boleto', 'transaction_id', 'estado', 'updated_at']);

    const activeTickets = countTicketsByStatuses_(tickets, ['pendiente', 'aprobado']);
    if (activeTickets + cantidad > CONFIG.maxTickets) {
      throw new Error('No hay suficientes boletos disponibles.');
    }

    const transactionId = Utilities.getUuid();
    const assignedTickets = assignTickets_(tickets, transactionId, cantidad);

    transactions.appendRow([
      transactionId,
      new Date(),
      nombre,
      apellido,
      whatsapp,
      cantidad,
      cantidad * CONFIG.ticketPrice,
      voucher,
      'pendiente',
      assignedTickets.join(', ')
    ]);
  } finally {
    lock.releaseLock();
  }
}

function onEdit(e) {
  const sheet = e.range.getSheet();
  if (sheet.getName() !== CONFIG.transactionsSheet) return;
  if (e.range.getRow() === 1 || e.range.getColumn() !== 9) return;

  const nextStatus = String(e.value || '').trim().toLowerCase();
  if (!CONFIG.statuses.includes(nextStatus)) return;

  const transactionId = sheet.getRange(e.range.getRow(), 1).getValue();
  if (!transactionId) return;

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    syncTicketStatus_(transactionId, nextStatus);
  } finally {
    lock.releaseLock();
  }
}

function getProgress() {
  const ss = SpreadsheetApp.getActive();
  const tickets = getOrCreateSheet_(ss, CONFIG.ticketsSheet);
  return {
    boletosActivos: countTicketsByStatuses_(tickets, ['pendiente', 'aprobado']),
    totalBoletos: CONFIG.maxTickets
  };
}

function doGet(e) {
  const whatsapp = e && e.parameter ? String(e.parameter.whatsapp || '').trim() : '';
  const payload = whatsapp ? getTicketsByWhatsapp_(whatsapp) : getProgress();

  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function getTicketsByWhatsapp_(whatsapp) {
  const ss = SpreadsheetApp.getActive();
  const transactions = getOrCreateSheet_(ss, CONFIG.transactionsSheet);
  const searchedPhone = normalizePhone_(whatsapp);

  if (!searchedPhone) {
    return {
      compras: []
    };
  }

  const lastRow = transactions.getLastRow();
  if (lastRow < 2) {
    return {
      compras: []
    };
  }

  const rows = transactions
    .getRange(2, 1, lastRow - 1, 10)
    .getValues();

  const compras = rows
    .filter((row) => phoneMatches_(row[4], searchedPhone))
    .map((row) => ({
      fecha: row[1],
      cantidad_boletos: Number(row[5]) || 0,
      estado: String(row[8] || '').trim().toLowerCase(),
      numeros_boletos: String(row[9] || '')
        .split(',')
        .map((ticket) => ticket.trim())
        .filter(Boolean)
    }));

  return {
    compras
  };
}

function assignTickets_(ticketsSheet, transactionId, requested) {
  const rows = readRows_(ticketsSheet);
  const assigned = [];
  const now = new Date();

  for (let i = 0; i < rows.length && assigned.length < requested; i += 1) {
    const row = rows[i];
    if (row.estado === 'rechazado') {
      const sheetRow = i + 2;
      ticketsSheet.getRange(sheetRow, 2, 1, 3).setValues([[transactionId, 'pendiente', now]]);
      assigned.push(row.numero_boleto);
    }
  }

  const missing = requested - assigned.length;
  if (missing <= 0) return assigned;

  const maxTicket = rows.reduce((max, row) => Math.max(max, Number(row.numero_boleto) || 0), 0);
  const newRows = [];

  for (let i = 1; i <= missing; i += 1) {
    const nextTicket = maxTicket + i;
    if (nextTicket > CONFIG.maxTickets) {
      throw new Error('No hay suficientes numeros nuevos disponibles.');
    }
    assigned.push(nextTicket);
    newRows.push([nextTicket, transactionId, 'pendiente', now]);
  }

  if (newRows.length > 0) {
    ticketsSheet
      .getRange(ticketsSheet.getLastRow() + 1, 1, newRows.length, 4)
      .setValues(newRows);
  }

  return assigned;
}

function syncTicketStatus_(transactionId, status) {
  const ss = SpreadsheetApp.getActive();
  const tickets = getOrCreateSheet_(ss, CONFIG.ticketsSheet);
  const data = tickets.getDataRange().getValues();
  const now = new Date();

  for (let i = 1; i < data.length; i += 1) {
    if (data[i][1] === transactionId) {
      tickets.getRange(i + 1, 3, 1, 2).setValues([[status, now]]);
    }
  }
}

function countTicketsByStatuses_(sheet, statuses) {
  return readRows_(sheet).filter((row) => statuses.includes(row.estado)).length;
}

function readRows_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  return sheet
    .getRange(2, 1, lastRow - 1, 4)
    .getValues()
    .filter((row) => row[0])
    .map((row) => ({
      numero_boleto: Number(row[0]),
      transaction_id: row[1],
      estado: String(row[2] || '').trim().toLowerCase(),
      updated_at: row[3]
    }));
}

function getValue_(namedValues, key) {
  const value = namedValues[key];
  if (Array.isArray(value)) return String(value[0] || '').trim();
  return String(value || '').trim();
}

function normalizePhone_(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function phoneMatches_(savedPhone, searchedPhone) {
  const saved = normalizePhone_(savedPhone);
  const searched = normalizePhone_(searchedPhone);

  if (!saved || !searched) return false;
  if (saved === searched) return true;

  const savedLocal = saved.slice(-9);
  const searchedLocal = searched.slice(-9);
  return savedLocal.length === 9 && savedLocal === searchedLocal;
}

function getOrCreateSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function ensureHeaders_(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }
}

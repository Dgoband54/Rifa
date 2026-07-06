const MAX_TICKETS = 1000;

function assignTickets(rows, transactionId, requested) {
  const assigned = [];
  const clonedRows = rows.map((row) => ({ ...row }));

  const activeTickets = clonedRows.filter((row) => ['pendiente', 'aprobado'].includes(row.estado)).length;
  if (activeTickets + requested > MAX_TICKETS) {
    throw new Error('No hay suficientes boletos disponibles.');
  }

  for (const row of clonedRows) {
    if (assigned.length >= requested) break;
    if (row.estado === 'rechazado') {
      row.transaction_id = transactionId;
      row.estado = 'pendiente';
      assigned.push(row.numero_boleto);
    }
  }

  const missing = requested - assigned.length;
  const maxTicket = clonedRows.reduce((max, row) => Math.max(max, row.numero_boleto || 0), 0);

  for (let i = 1; i <= missing; i += 1) {
    const nextTicket = maxTicket + i;
    if (nextTicket > MAX_TICKETS) {
      throw new Error('No hay suficientes numeros nuevos disponibles.');
    }
    clonedRows.push({ numero_boleto: nextTicket, transaction_id: transactionId, estado: 'pendiente' });
    assigned.push(nextTicket);
  }

  return { assigned, rows: clonedRows };
}

function assertDeepEqual(actual, expected, message) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new Error(`${message}\nExpected: ${expectedJson}\nActual:   ${actualJson}`);
  }
}

function assertThrows(fn, expectedMessage, message) {
  try {
    fn();
  } catch (error) {
    if (error.message === expectedMessage) return;
    throw new Error(`${message}\nExpected error: ${expectedMessage}\nActual error:   ${error.message}`);
  }
  throw new Error(`${message}\nExpected function to throw.`);
}

const scenarioOne = assignTickets(
  [
    { numero_boleto: 1, transaction_id: 'old-ok', estado: 'aprobado' },
    { numero_boleto: 2, transaction_id: 'old-bad', estado: 'rechazado' },
    { numero_boleto: 3, transaction_id: 'old-bad', estado: 'rechazado' },
    { numero_boleto: 4, transaction_id: 'old-pending', estado: 'pendiente' }
  ],
  'new-sale',
  4
);
assertDeepEqual(scenarioOne.assigned, [2, 3, 5, 6], 'Recicla rechazados antes de crear boletos nuevos.');

const scenarioTwo = assignTickets(
  [
    { numero_boleto: 998, transaction_id: 'ok', estado: 'aprobado' },
    { numero_boleto: 999, transaction_id: 'bad', estado: 'rechazado' }
  ],
  'new-sale-2',
  2
);
assertDeepEqual(scenarioTwo.assigned, [999, 1000], 'Puede reciclar y crear hasta el boleto 1000.');

assertThrows(
  () => assignTickets(
    Array.from({ length: 1000 }, (_, index) => ({
      numero_boleto: index + 1,
      transaction_id: 'sold-out',
      estado: 'aprobado'
    })),
    'too-late',
    1
  ),
  'No hay suficientes boletos disponibles.',
  'Bloquea sobreventa cuando ya hay 1000 boletos activos.'
);

console.log('OK: reciclaje de Google Forms probado localmente.');

# Backend con Google Forms + Google Sheets

Esta opcion reemplaza Cloudinary/PostgreSQL para una rifa pequena o mediana:

- Google Forms recibe nombre, apellido, WhatsApp, cantidad de boletos y comprobante.
- Google Drive guarda los comprobantes automaticamente.
- Google Sheets guarda transacciones, estados y boletos.
- Apps Script asigna numeros con bloqueo para evitar sobreventa.
- Los boletos rechazados se reciclan en compras futuras.

Formulario actual de la rifa:

```txt
https://forms.gle/gpiePg5RWz4Hmuuo8
```

Google Sheet conectado:

```txt
https://docs.google.com/spreadsheets/d/1tXeHrwaSY5C8Yvk35LmgWxpkRb1Ewp_Vd5K1QYQiCLE/edit?usp=sharing
```

## 1. Crear el Google Form

Crea o conserva el formulario con estos campos exactos:

1. `Nombre` - respuesta corta, obligatorio.
2. `Apellido` - respuesta corta, obligatorio.
3. `numero de WhatsApp` - respuesta corta, obligatorio.
4. `Numero de Boletos` - numero, obligatorio.
5. `Adjunta una captura de tu voucher` - subida de archivo, obligatorio.

Importante: Google Forms con subida de archivos normalmente exige que el comprador inicie sesion con Google.

## 2. Conectar el Form a Google Sheets

En el formulario:

1. Abre la pestana `Respuestas`.
2. Crea o selecciona una hoja de calculo.
3. En esa hoja, abre `Extensiones > Apps Script`.
4. Borra el `myFunction()` vacio.
5. Copia el contenido completo de `Code.gs`.
6. Guarda el proyecto.

## 3. Inicializar hojas

En Apps Script, ejecuta una vez:

```js
setupRifaSheets()
```

Eso crea:

- `Transacciones`: cada compra con estado `pendiente`, `aprobado` o `rechazado`.
- `Boletos`: inventario de numeros asignados.

Para probar sin enviar el formulario real, ejecuta:

```js
testRifaFlow()
```

Ese test limpia las hojas de rifa, crea compras falsas, rechaza la primera y confirma que una compra nueva recicla esos boletos.

## 4. Crear triggers

En Apps Script, entra a `Triggers` y crea:

- Funcion: `onFormSubmit`
- Evento: `From spreadsheet`
- Tipo: `On form submit`

Y otro trigger:

- Funcion: `onEdit`
- Evento: `From spreadsheet`
- Tipo: `On edit`

## 5. Flujo admin

Cuando alguien envia el formulario:

1. Apps Script cuenta boletos activos: `pendiente` + `aprobado`.
2. Si hay cupo, asigna numeros.
3. Primero toma boletos con estado `rechazado`.
4. Si faltan, crea numeros nuevos desde `MAX(numero_boleto) + 1`.
5. Guarda la transaccion como `pendiente`.

Para aprobar o rechazar:

1. En la hoja `Transacciones`, cambia la columna `estado`.
2. El trigger `onEdit` sincroniza la hoja `Boletos`.
3. Si queda `rechazado`, esos numeros vuelven a estar disponibles para la siguiente compra.

## 6. Usar progreso en la landing

Puedes publicar Apps Script como Web App y usar `doGet()` para consultar:

```json
{
  "boletosActivos": 128,
  "totalBoletos": 1000
}
```

Luego en React reemplazas `/api/progreso` por la URL publicada de Apps Script.

Tambien puedes consultar los numeros de una compra con el WhatsApp usado en el formulario:

```txt
https://script.google.com/macros/s/TU_DEPLOYMENT_ID/exec?whatsapp=0999999999
```

Respuesta:

```json
{
  "compras": [
    {
      "fecha": "2026-07-06T12:00:00.000Z",
      "cantidad_boletos": 2,
      "estado": "pendiente",
      "numeros_boletos": ["12", "13"]
    }
  ]
}
```

## Recomendacion practica

Para evitar problemas con subida de archivo desde React hacia Google Forms, deja el formulario como link externo:

- La landing muestra el precio, premios, progreso y CTA.
- El CTA abre Google Forms en una nueva pestana.
- La asignacion real de numeros ocurre en Google Sheets con Apps Script.

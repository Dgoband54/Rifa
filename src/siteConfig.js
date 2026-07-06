import dedo1 from './evidencia/dedo1.jpeg';
import dedo2 from './evidencia/dedo2.jpeg';
import dedoEvento from './evidencia/dedo evento.jpeg';
import radio2 from './evidencia/radio 2.jpeg';
import radio1 from './evidencia/radio1.jpeg';
import transfer from './evidencia/transfer.png';

export const paymentConfig = {
  accountName: 'Diego Banda',
  bankName: 'Banco Pichincha',
  accountNumber: '2213914064',
  heroImageUrl: dedoEvento,
  imageUrl: transfer
};

export const storyGallery = [
  {
    title: 'Radiografias',
    caption: 'Diagnostico y seguimiento medico',
    imageUrl: radio1
  },
  {
    title: 'Evidencia Visual',
    caption: 'Como se ve desde nuestra perspectiva',
    imageUrl: dedo1
  },
  {
    title: 'Radiografias',
    caption: 'Como ven los medicos el daño y la evolucion de la fractura',
    imageUrl: radio2
  },
  {
    title: 'Evidencia Visual',
    caption: 'Terapia, paciencia y volver a la normalidad',
    imageUrl: dedo2
  }
];

export const prizes = [
  {
    name: 'Tanque de Gas domestico',
    tag: 'Hogar',
    imageUrl: 'https://www.tventas.com/13066677-large_default/protector-de-piso-para-tanque-de-gas-50-x-50-x-16-cm-ecocaucho-gris.jpg'
  },
  {
    name: 'Bocina Inteligente Alexa (semi nueva)',
    tag: 'Smart home',
    imageUrl: 'https://megamaxi-225de.kxcdn.com/wp-content/uploads/2024/12/840080531083-1-19.jpg'
  },
  {
    name: 'Casco para Motocicleta (semi nuevo)',
    tag: 'Ruta',
    imageUrl: 'https://edgehelmets.com/cdn/shop/files/CASCOABATIBLEBOSTONIRONMAN20265.jpg?v=1770331188'
  },
  {
    name: 'Guitarra Acustica Fender Series FA (usada)',
    tag: 'Musica',
    imageUrl: 'https://www.fender.cl/media/catalog/product/cache/1/image/800x800/9df78eab33525d08d6e5fb8d27136e95/g/a/ga070_0971160121v1.jpg'
  },
  {
    name: 'Set de Limpieza Facial',
    tag: 'Cuidado',
    imageUrl: 'https://cromantic.vtexassets.com/arquivos/ids/214279-500-auto?v=639127172739370000&width=500&height=auto&aspect=true'
  },
  {
    name: 'Bocina Bluetooth Portatil (semi nuevo)',
    tag: 'Audio',
    imageUrl: 'https://m.media-amazon.com/images/I/81E6G7Btv-L.jpg'
  }
];

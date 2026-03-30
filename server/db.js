const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'karaoke.db'));

// Enable WAL mode and foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT DEFAULT '',
    key TEXT DEFAULT '',
    section TEXT DEFAULT '',
    verses TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS masses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    name TEXT DEFAULT '',
    active INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS mass_songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mass_id INTEGER NOT NULL REFERENCES masses(id) ON DELETE CASCADE,
    song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    UNIQUE(mass_id, song_id)
  );
`);

// Migration: add active column if missing (for existing DBs)
const columns = db.prepare("PRAGMA table_info(masses)").all().map(c => c.name);
if (!columns.includes('active')) {
  db.exec('ALTER TABLE masses ADD COLUMN active INTEGER DEFAULT 0');
}

// Seed with default songs if empty
const count = db.prepare('SELECT COUNT(*) as c FROM songs').get().c;
if (count === 0) {
  const seedSongs = [
    {
      title: "El Carpintero",
      author: "Roger Hernández",
      key: "Mi m",
      section: "Entrada",
      verses: [
        { label: "Estrofa 1", lines: [
          { text: "Oiga ¿a dónde tan apurado", chorus: false },
          { text: "ese gentío va,", chorus: false },
          { text: "por las calles corriendo hacia", chorus: false },
          { text: "las afueras de la ciudad?", chorus: false },
          { text: "Niños, jóvenes, viejos,", chorus: false },
          { text: "toda la multitud.", chorus: false },
          { text: "Caminando de prisa,", chorus: false },
          { text: "con alegre inquietud.", chorus: false },
          { text: "Tanta alegría, tanto entusiasmo", chorus: false },
          { text: "se escucha por doquier,", chorus: false },
          { text: "que los días gloriosos", chorus: false },
          { text: "del Rey David parecen volver.", chorus: false },
        ]},
        { label: "Coro", lines: [
          { text: "Pero miren quien es", chorus: true },
          { text: "Si es el Carpintero de Nazaret", chorus: true },
          { text: "Que en burro montado está entrando en Jerusalén.", chorus: true },
          { text: "¡Hosanna!, ¡Hosanna!, ¡Hosanna!", chorus: true },
          { text: "Al hijo de David que llegó!", chorus: true },
          { text: "Bendito es el que viene a nosotros", chorus: true },
          { text: "En nombre del Señor! (×2)", chorus: true },
        ]},
        { label: "Estrofa 2", lines: [
          { text: "Oiga ¿Por qué esos ramos", chorus: false },
          { text: "la gente comienza a arrancar", chorus: false },
          { text: "que agitan en el aire", chorus: false },
          { text: "junto al camino de la ciudad?", chorus: false },
          { text: "Es un día de fiesta, un día sin igual,", chorus: false },
          { text: "que hasta las mismas piedras,", chorus: false },
          { text: "hoy parecen cantar.", chorus: false },
          { text: "¿Qué general triunfante", chorus: false },
          { text: "está entrando en Jerusalén,", chorus: false },
          { text: "que los días gloriosos", chorus: false },
          { text: "del Rey David parecen volver?", chorus: false },
        ]},
        { label: "Estrofa 3", lines: [
          { text: "Oiga ¿Por qué esos hombres", chorus: false },
          { text: "los mantos se quitan al andar", chorus: false },
          { text: "y los van colocando", chorus: false },
          { text: "sobre el camino de la ciudad?", chorus: false },
          { text: "Y ¿quién es ese hombre", chorus: false },
          { text: "que sonriendo va", chorus: false },
          { text: "a los niños que aclaman", chorus: false },
          { text: "gritando sin cesar?", chorus: false },
          { text: "Lo alaba el pueblo entero", chorus: false },
          { text: "venido de todo Israel", chorus: false },
          { text: "que los días gloriosos", chorus: false },
          { text: "del Rey David parecen volver.", chorus: false },
        ]},
      ]
    },
    {
      title: "Tú Reinarás",
      author: "F. X Moreau",
      key: "Mi",
      section: "Entrada",
      verses: [
        { label: "Estrofa 1", lines: [
          { text: "¡Tú reinarás! Este es el grito", chorus: false },
          { text: "que ardiente exhala nuestra fe:", chorus: false },
          { text: "¡Tú reinarás! ¡Oh Rey bendito!", chorus: false },
          { text: "Pues Tú dijiste: \"Reinaré\".", chorus: false },
        ]},
        { label: "Coro", lines: [
          { text: "Reine Jesús por siempre,", chorus: true },
          { text: "reine su corazón;", chorus: true },
          { text: "en nuestra patria, en nuestro suelo,", chorus: true },
          { text: "que es de María la Nación (×2)", chorus: true },
        ]},
        { label: "Estrofa 2", lines: [
          { text: "¡Tú reinarás! Dulce esperanza", chorus: false },
          { text: "que el alma llena de placer.", chorus: false },
          { text: "Habrá por fin paz y bonanza,", chorus: false },
          { text: "felicidad habrá doquier.", chorus: false },
        ]},
        { label: "Estrofa 3", lines: [
          { text: "¡Tú reinarás! Dichosa era,", chorus: false },
          { text: "dichoso pueblo con tal Rey;", chorus: false },
          { text: "será tu cruz nuestra bandera,", chorus: false },
          { text: "felicidad habrá doquier.", chorus: false },
        ]},
        { label: "Estrofa 4", lines: [
          { text: "¡Tú reinarás! Toda la vida", chorus: false },
          { text: "trabajaremos con gran fe", chorus: false },
          { text: "en realizar y ver cumplida", chorus: false },
          { text: "la gran promesa. \"Reinaré\".", chorus: false },
        ]},
        { label: "Estrofa 5", lines: [
          { text: "¡Tú reinarás! Reina ya ahora", chorus: false },
          { text: "en esta casa y población.", chorus: false },
          { text: "Ten compasión del que te implora", chorus: false },
          { text: "y acude a Ti en la aflicción.", chorus: false },
        ]},
        { label: "Estrofa 6", lines: [
          { text: "¡Tú reinarás! En este pueblo", chorus: false },
          { text: "te prometemos nuestro amor.", chorus: false },
          { text: "¡Oh! buen Jesús, danos consuelo", chorus: false },
          { text: "en este valle de dolor.", chorus: false },
        ]},
      ]
    },
    {
      title: "Hosanna Hey",
      author: "Roberto Malvezzi",
      key: "Mi m",
      section: "Procesión",
      verses: [
        { label: "Coro", lines: [
          { text: "Hosanna he, hosanna ha", chorus: true },
          { text: "Hosanna he, hosanna ha, hosanna he.", chorus: true },
        ]},
        { label: "Estrofa 1", lines: [
          { text: "Vamos a Él con espigas de mi trigo", chorus: false },
          { text: "y con mil ramos de olivo", chorus: false },
          { text: "siempre alegre, siempre en paz.", chorus: false },
        ]},
        { label: "Estrofa 2", lines: [
          { text: "Él es el Santo, es el Hijo de María,", chorus: false },
          { text: "es el Dios de Israel,", chorus: false },
          { text: "es el Hijo de David.", chorus: false },
        ]},
        { label: "Estrofa 3", lines: [
          { text: "Él es el Cristo, es el único creador,", chorus: false },
          { text: "es hosanna en las alturas,", chorus: false },
          { text: "es hosanna en el amor.", chorus: false },
        ]},
      ]
    },
    {
      title: "Hemos Entregado Nuestras Vidas",
      author: "",
      key: "Do M",
      section: "Ofertorio",
      verses: [
        { label: "Estrofa 1", lines: [
          { text: "Hemos entregado", chorus: false },
          { text: "nuestras vidas al Señor,", chorus: false },
          { text: "no hay mayor bendición", chorus: false },
          { text: "que ser de Él.", chorus: false },
          { text: "Hemos entregado", chorus: false },
          { text: "nuestras vidas al Señor,", chorus: false },
          { text: "y ahora nos da su vida eterna.", chorus: false },
        ]},
        { label: "Coro", lines: [
          { text: "Bendito seas, Señor, por este Pan", chorus: true },
          { text: "fruto de la tierra", chorus: true },
          { text: "y del trabajo del hombre.", chorus: true },
          { text: "Bendito seas, Señor, por este Vino", chorus: true },
          { text: "que hemos recibido,", chorus: true },
          { text: "de tu amor y bondad.", chorus: true },
        ]},
        { label: "Estrofa 2", lines: [
          { text: "Y ahora, Señor,", chorus: false },
          { text: "te presentamos el Pan", chorus: false },
          { text: "y el Vino que Tú convertirás", chorus: false },
          { text: "en Cuerpo y Sangre de tu Hijo, Jesús.", chorus: false },
          { text: "Pan de vida y Bebida de salvación.", chorus: false },
        ]},
        { label: "Final", lines: [
          { text: "Hemos entregado nuestras vidas", chorus: true },
          { text: "al Señor, y ahora nos da su vida eterna.", chorus: true },
        ]},
      ]
    },
    {
      title: "Santo, Llenos Están",
      author: "Heber Espinal",
      key: "Sol M",
      section: "Santo",
      verses: [
        { label: "", lines: [
          { text: "Santo, Santo, Santo es el Señor (×2)", chorus: true },
          { text: "Dios del universo.", chorus: true },
          { text: "Llenos están el cielo y la tierra", chorus: true },
          { text: "de tu gloria.", chorus: true },
        ]},
        { label: "Coro", lines: [
          { text: "Hosanna, hosanna,", chorus: true },
          { text: "hosanna en el cielo. (×2)", chorus: true },
        ]},
        { label: "", lines: [
          { text: "Bendito es el que viene", chorus: true },
          { text: "en el nombre del Señor.", chorus: true },
        ]},
      ]
    },
    {
      title: "Cordero de Dios",
      author: "Pablo Cambar",
      key: "Re M",
      section: "Cordero",
      verses: [
        { label: "", lines: [
          { text: "Cordero de Dios,", chorus: false },
          { text: "que quitas el pecado del mundo,", chorus: false },
          { text: "ten piedad de nosotros (×2)", chorus: false },
        ]},
        { label: "", lines: [
          { text: "Cordero de Dios que quitas", chorus: false },
          { text: "el pecado del mundo,", chorus: false },
          { text: "danos la Paz, danos la paz,", chorus: false },
          { text: "Cordero de Dios.", chorus: false },
        ]},
      ]
    },
    {
      title: "Getsemaní",
      author: "",
      key: "",
      section: "Comunión",
      verses: [
        { label: "Estrofa 1", lines: [
          { text: "Para que mi amor no sea un sentimiento", chorus: false },
          { text: "tan solo de deslumbramiento pasajero.", chorus: false },
          { text: "Para no gastar mis palabras más mías", chorus: false },
          { text: "ni vaciar de contenido mi te quiero.", chorus: false },
        ]},
        { label: "Estrofa 2", lines: [
          { text: "Quiero hundir más hondo mi raíz en ti", chorus: false },
          { text: "y cimentar en solidez este mi afecto.", chorus: false },
          { text: "Pues mi corazón que es inquieto y es frágil", chorus: false },
          { text: "sólo acierta si se abraza a tu proyecto.", chorus: false },
        ]},
        { label: "Coro", lines: [
          { text: "Más allá de mis miedos,", chorus: true },
          { text: "más allá de mi inseguridad", chorus: true },
          { text: "quiero darte mi respuesta", chorus: true },
          { text: "aquí estoy para hacer tu voluntad", chorus: true },
          { text: "para que mi amor sea decir que sí,", chorus: true },
          { text: "hasta el final.", chorus: true },
        ]},
        { label: "Estrofa 3", lines: [
          { text: "No es en las palabras, ni es en las promesas", chorus: false },
          { text: "donde la historia tiene su motor secreto.", chorus: false },
          { text: "Sólo en el amor en la cruz madurado,", chorus: false },
          { text: "el amor que mueve a todo el mundo entero.", chorus: false },
        ]},
        { label: "Estrofa 4", lines: [
          { text: "Hazme comprender, Señor, tu amor tan puro", chorus: false },
          { text: "amor que persevera en cruz, amor perfecto.", chorus: false },
          { text: "Hazme serte fiel cuando todo sea oscuro", chorus: false },
          { text: "para que mi amor no sea un sentimiento.", chorus: false },
        ]},
        { label: "Estrofa 5", lines: [
          { text: "Duermen en su sopor y temen en el huerto", chorus: false },
          { text: "ni sus amigos acompañan al maestro.", chorus: false },
          { text: "Si es hora de cruz, es de fidelidades", chorus: false },
          { text: "pero el mundo nunca puede aceptar esto.", chorus: false },
        ]},
      ]
    },
    {
      title: "Alma de Cristo",
      author: "",
      key: "Sol M",
      section: "Pos-comunión",
      verses: [
        { label: "", lines: [
          { text: "Alma de Cristo, santifícame", chorus: false },
          { text: "Cuerpo de Cristo, sálvame.", chorus: false },
          { text: "Sangre de Cristo, embriágame.", chorus: false },
          { text: "Agua del Costado de Cristo, lávame.", chorus: false },
          { text: "Pasión de Cristo, confórtame.", chorus: false },
          { text: "Oh Buen Jesús, óyeme", chorus: false },
          { text: "Y dentro de tus llagas escóndeme.", chorus: false },
          { text: "No permitas que me aparte de Ti.", chorus: false },
          { text: "Del enemigo defiéndeme,", chorus: false },
          { text: "en la hora de mi muerte, llámame", chorus: false },
          { text: "y mándame ir a Ti", chorus: false },
          { text: "para que con tus santos te alabe", chorus: false },
          { text: "por los siglos de los siglos. Amén.", chorus: false },
        ]},
      ]
    },
    {
      title: "En Tus Manos",
      author: "Roger Hernández / Emy Sorí",
      key: "Do M",
      section: "Salida",
      verses: [
        { label: "Coro", lines: [
          { text: "En tus manos, Señor,", chorus: true },
          { text: "en tus manos,", chorus: true },
          { text: "siempre estamos, Señor,", chorus: true },
          { text: "siempre estamos (×2)", chorus: true },
        ]},
        { label: "Estrofa 1", lines: [
          { text: "No importa de dónde vengamos,", chorus: false },
          { text: "ni a dónde tengamos qué ir,", chorus: false },
          { text: "de la extensión de tus manos,", chorus: false },
          { text: "Señor, nunca podremos salir.", chorus: false },
        ]},
        { label: "Estrofa 2", lines: [
          { text: "Si vamos los llanos cruzando,", chorus: false },
          { text: "vamos pisando tu piel;", chorus: false },
          { text: "si por los mares navegamos", chorus: false },
          { text: "y los desiertos cruzamos,", chorus: false },
          { text: "por la extensión de tus manos,", chorus: false },
          { text: "vamos también.", chorus: false },
        ]},
        { label: "Estrofa 3", lines: [
          { text: "No importa cuál sea el camino", chorus: false },
          { text: "que se nos depare al nacer;", chorus: false },
          { text: "que de tus manos partimos Señor", chorus: false },
          { text: "y a ellas debemos volver.", chorus: false },
        ]},
      ]
    },
  ];

  const insert = db.prepare(
    'INSERT INTO songs (title, author, key, section, verses) VALUES (?, ?, ?, ?, ?)'
  );

  const insertMany = db.transaction((songs) => {
    for (const s of songs) {
      insert.run(s.title, s.author, s.key, s.section, JSON.stringify(s.verses));
    }
  });

  insertMany(seedSongs);
  console.log('Database seeded with 9 songs');
}

module.exports = db;

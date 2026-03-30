# Coro Parroquial SJB

Sistema de proyeccion liturgica en tiempo real para coro parroquial. Permite al director controlar desde su celular lo que se muestra en el proyector, mientras cada integrante del coro sigue los cantos desde su propio dispositivo como un himnario digital sincronizado.

## Vistas

La aplicacion tiene 4 vistas independientes conectadas por WebSocket:

| Ruta | Funcion | Dispositivo tipico |
|------|---------|-------------------|
| `/` | **Coro** — Himnario digital sincronizado con el director | Celular de cada integrante |
| `/director` | **Director** — Panel de control en tiempo real | Celular/tablet del director |
| `/proyector` | **Proyector** — Pantalla de proyeccion fullscreen | PC conectado al proyector |
| `/admin/*` | **Admin** — Gestion de cantos y misas | Cualquier dispositivo |

### Vista Coro (`/`)

- Muestra el canto completo con todas las estrofas
- Resalta automaticamente la estrofa que el director esta proyectando
- Auto-scroll a la estrofa activa
- Navegacion por sidebar con lista de cantos de la misa
- Tamanio de fuente ajustable
- Gestos tactiles (swipe para abrir/cerrar menu)

### Vista Director (`/director`)

- Control total de lo que se muestra en el proyector
- 4 modos de proyeccion:
  - **Cantos** — Seleccion de canto y estrofa, navegacion prev/next
  - **Pantalla en blanco** — Proyector en blanco
  - **Texto libre** — Proyectar frases, citas biblicas o avisos
  - **Imagen** — Subir y proyectar imagenes
- Selector de misa (cambiar entre misas disponibles)
- Toggle tema claro/oscuro para el proyector
- Indicador de conexion WebSocket

### Vista Proyector (`/proyector`)

- Optimizada para proyectores de gama baja en ambientes con mucha luz
- Fullscreen sin decoraciones, cursor oculto
- Fuente grande y bold para maxima legibilidad
- Dos temas: oscuro (fondo negro, texto blanco) y claro (fondo blanco, texto negro)
- Controlada 100% desde la vista director

### Panel Admin (`/admin`)

- **Catalogo de cantos**: CRUD completo con titulo, autor, tonalidad, seccion liturgica y editor de versos/lineas
- **Gestion de misas**: Crear misas por fecha, asignar cantos del catalogo, reordenar, activar misa del dia
- Los cambios en admin se propagan en tiempo real a todas las vistas via WebSocket

## Arquitectura

```
Cliente (React + Vite)          Servidor (Node + Express 5)
========================        ============================

  /            Coro App    <--->   WebSocket Server (ws)
  /director    Director    <--->     Estado de sesion en memoria
  /proyector   Proyector   <--->     Broadcast a todos los clientes
  /admin/*     Admin       ---->   API REST
                                     /api/songs    (CRUD)
                                     /api/masses   (CRUD + activate)
                                     /api/uploads  (imagenes)
                                   SQLite (better-sqlite3)
                                     songs, masses, mass_songs
```

### Sincronizacion en tiempo real

- El director envia cambios de estado via WebSocket
- El servidor almacena el estado de sesion en memoria y lo retransmite a todos los clientes
- Cuando el admin modifica datos (cantos/misas), el servidor envia un evento `refresh` y todas las vistas recargan sus datos

## Despliegue con Docker

### Docker Compose (recomendado)

```bash
docker compose up -d
```

La app estara disponible en `http://localhost:8080`

Los datos (SQLite + imagenes) se persisten en `./data/` via volumen Docker.

### Reconstruir despues de cambios

```bash
docker compose up -d --build
```

### Detener

```bash
docker compose down
```

## Desarrollo local

```bash
npm install
npm run dev      # Frontend (Vite) en http://localhost:5173
npm run server   # Backend (Express) en http://localhost:3000
```

## Estructura del proyecto

```
coro-parroquial-sjb/
├── src/
│   ├── main.jsx                # Rutas principales
│   ├── App.jsx                 # Vista coro (himnario)
│   ├── styles.css              # Tailwind + tema custom
│   ├── hooks/
│   │   └── useSocket.js        # Hook WebSocket con reconexion
│   ├── components/
│   │   ├── Sidebar.jsx         # Lista de cantos
│   │   ├── TopBar.jsx          # Barra superior con controles
│   │   ├── Welcome.jsx         # Pantalla de bienvenida
│   │   └── LyricsView.jsx      # Renderizado de letras por estrofa
│   ├── director/
│   │   ├── DirectorApp.jsx     # Panel de control
│   │   ├── ModeButtons.jsx     # Selector de modo
│   │   └── SongControl.jsx     # Selector de canto/estrofa
│   ├── proyector/
│   │   └── ProyectorApp.jsx    # Vista fullscreen proyector
│   └── admin/
│       ├── AdminApp.jsx        # Layout admin con navegacion
│       ├── SongList.jsx        # Lista de cantos
│       ├── SongForm.jsx        # Crear/editar canto
│       ├── MassList.jsx        # Lista de misas
│       └── MassForm.jsx        # Crear/editar misa
├── server/
│   ├── index.js                # Express + HTTP server + uploads
│   ├── db.js                   # SQLite init + migraciones
│   ├── ws.js                   # WebSocket server + broadcast
│   └── routes/
│       ├── songs.js            # API REST cantos
│       └── masses.js           # API REST misas
├── public/
│   └── manifest.json           # PWA manifest
├── index.html
├── vite.config.js
├── package.json
├── Dockerfile
├── docker-compose.yml
└── data/                       # Volumen persistente (SQLite + uploads)
```

## Tecnologias

- **React 18** con React Router 7
- **Vite 6** como build tool
- **Tailwind CSS 4** con tema custom (colores liturgicos)
- **Express 5** como servidor backend
- **better-sqlite3** como base de datos
- **ws** para WebSocket nativo
- **Node 20 Alpine** en Docker

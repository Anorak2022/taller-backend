# TallerPro - Backend

API REST de TallerPro, un sistema de gestión para talleres mecánicos. Administra clientes, vehículos, mantenimientos e inventario de aceites, y envía recordatorios de mantenimiento por WhatsApp.

**Frontend:** [taller-front](https://github.com/Anorak2022/taller-front) (demo: https://taller-front-hazel.vercel.app/)

## Funcionalidades

- Autenticación con JWT.
- CRUD de clientes y vehículos.
- Registro de mantenimientos por vehículo, con anulación (soft delete) que conserva el historial.
- Inventario de aceites con entradas, historial de movimientos y consulta de stock bajo.
- Recordatorios de mantenimiento por WhatsApp con Twilio, enviables de forma manual.
- Tarea programada con `node-cron` que revisa los mantenimientos con próxima fecha dentro de los siguientes 7 días y envía el recordatorio, evitando duplicados en el mismo día.

## Tecnologías

| Categoría | Tecnología |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Base de datos | PostgreSQL |
| ORM | Prisma |
| Autenticación | JSON Web Tokens |
| Tareas programadas | node-cron |
| Mensajería | Twilio (WhatsApp) |
| Despliegue | Render |

## Modelo de datos

`Cliente`, `Vehiculo`, `Mantenimiento`, `Servicio`, `Recordatorio`, `Aceite` y `MovimientoInventario`, definidos en `prisma/schema.prisma`.

## Endpoints

Todos bajo el prefijo `/api`.

| Recurso | Rutas |
|---|---|
| `/auth` | `POST /login` |
| `/clientes` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` |
| `/vehiculos` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` |
| `/mantenimientos` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `GET /vehiculo/:vehiculoId`, `POST /:mantenimientoId/recordatorio`, `PATCH /:id/anular` |
| `/aceites` | `GET /`, `POST /`, `POST /entrada`, `GET /movimientos`, `GET /stock-bajo` |

## Estructura

```
taller-backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── controllers/    # Lógica de cada recurso
│   ├── routes/         # Definición de rutas
│   ├── services/       # whatsapp.js, scheduler.js
│   └── index.js        # Punto de entrada
└── package.json
```

## Instalación

Requisitos: Node.js 18 o superior, PostgreSQL y una cuenta de Twilio con WhatsApp habilitado.

```bash
git clone https://github.com/Anorak2022/taller-backend.git
cd taller-backend
npm install
```

Crea un archivo `.env` en la raíz:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/taller"
PORT=3000
JWT_SECRET=una_clave_secreta
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
ADMIN_TELEFONO=
```

Aplica las migraciones e inicia el servidor:

```bash
npx prisma migrate deploy
npm run dev
```

### Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Desarrollo con recarga automática (nodemon) |
| `npm start` | Producción |

## Autor

**Irvin Adonay Peraza Hernández**
Backend Developer, APIs y Servicios
irvin13peraza@gmail.com
[github.com/Anorak2022](https://github.com/Anorak2022)

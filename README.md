# Calendario Runner

Agenda argentina de carreras de calle y montaña.

## Stack

- **[Next.js 16](https://nextjs.org/)** — App Router, Server Components, Server Actions
- **[Drizzle ORM](https://orm.drizzle.team/)** + **[Turso](https://turso.tech/)** — SQLite serverless (gratis)
- **[Auth.js v5](https://authjs.dev/)** — Autenticación con email/password
- **[shadcn/ui](https://ui.shadcn.com/)** — Componentes UI (Radix UI + Tailwind CSS v4)
- **[Resend](https://resend.com/)** — Emails transaccionales (gratis hasta 3.000/mes)
- **[Vercel](https://vercel.com/)** — Deploy (gratis en Hobby)

---

## Configuración inicial

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Variables de entorno

Copiá `.env.local` y completá los valores:

| Variable | Descripción | Valor local |
|----------|-------------|-------------|
| `AUTH_SECRET` | Clave secreta para JWT | Ver abajo |
| `NEXTAUTH_URL` | URL base de la app | `http://localhost:3000` |
| `TURSO_DATABASE_URL` | URL de la base de datos | `file:./local.db` |
| `TURSO_AUTH_TOKEN` | Token Turso | Dejar vacío en local |
| `RESEND_API_KEY` | API key de Resend | Opcional en local |
| `RESEND_FROM` | Email remitente | `Calendario Runner <noreply@localhost>` |
| `REGISTRATION_ENABLED` | Habilitar registro público | `true` / `false` |

**Generar `AUTH_SECRET`:**

```bash
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Max 256 }))

# Linux / Mac
openssl rand -base64 32
```

### 3. Crear las tablas y cargar datos

```bash
pnpm db:push   # crea las tablas en local.db
pnpm seed      # carga provincias, disciplinas, carreras y ediciones
```

Estos dos son para la primera vez, con la base vacía. Una vez que las tablas existen, para recargar los datos alcanza con `pnpm db:reset` (ver [Resetear la base de datos](#resetear-la-base-de-datos)).

### 4. Levantar el servidor de desarrollo

```bash
pnpm dev
```

Abrí [http://localhost:3000](http://localhost:3000).

---

## Comandos disponibles

### Desarrollo

```bash
pnpm dev        # Servidor de desarrollo en localhost:3000
pnpm build      # Build de producción
pnpm start      # Iniciar servidor de producción
```

### Base de datos (local)

```bash
pnpm db:push      # Aplicar el schema (solo en una base vacía, ver más abajo)
pnpm db:studio    # Abrir Drizzle Studio (UI visual de la base)
pnpm seed         # Cargar datos desde scripts/data/*.json
pnpm db:reset     # Recargar el catálogo desde los JSON (conserva las cuentas)
pnpm db:reset:all # ⚠ Borra TODO, cuentas incluidas
```

### Base de datos (producción)

```bash
pnpm db:push:prod       # Aplicar el schema en Turso producción
pnpm db:seed:prod       # Cargar datos en producción
pnpm db:reset:prod      # Recargar el catálogo en producción (conserva las cuentas)
pnpm db:reset:all:prod  # ⚠ Borra TODO en producción, cuentas incluidas
```

> Estos comandos leen las credenciales desde `.env.production.local` (ver abajo).

---

## Datos de seed

Los datos iniciales (provincias, localidades, disciplinas y carreras) están en `scripts/data/`:

```
scripts/data/
├── provinces.json   # Provincias y localidades de Argentina
└── races.json       # Carreras con ediciones, lugares y links
```

Estos archivos se commitean al repo. Para agregar o editar carreras, modificá los JSONs y corré `pnpm db:reset`.

Hoy: **113 carreras, 192 ediciones, 252 links, 143 localidades**. Una carrera con el nombre vacío queda como placeholder y el seed la saltea.

El campo `published` es opcional en las carreras y en las ediciones, y por defecto es `true`. Se escribe solo para **ocultar algo del sitio sin borrarlo**; despublicar una carrera despublica sus ediciones.

El array `places` cuelga de la **carrera**, no de la edición: un cambio de sede entre ediciones es raro, y lo que se publica es el lugar de llegada o donde se concentra el evento, no necesariamente la largada.

### Huecos conocidos en los datos

En octubre de 2026 se relevaron las 113 carreras contra sus fuentes oficiales y se volcó todo lo verificable. Esto es lo que quedó sin resolver:

- **Instagram y Facebook sin verificar.** 86 carreras tienen Instagram y ninguna de esas cuentas se pudo revisar: requieren sesión. No se resuelve con búsqueda web — hay que mirarlas a mano.
- **Seis carreras sin señales de vida recientes**, que se dejaron publicadas a propósito porque "no encontré nada" no es prueba de que dejaron de hacerse: Anime Run, Cross de Los Pagos de Areco, Maratón de Formosa, Tilcara Trail, y sobre todo **La Caldera Team Trail** (última edición nov-2024) y **Maratón Independencia** (jul-2024). Epic Patagonia sí se despublicó: su dominio rechaza la conexión.
- **Siete ediciones sin distancias** (`[]`), con la fecha confirmada y las distancias sin publicar: Fiambalá 2025 y 2026, Raid de Los Andes 2025, Las Vallas 2026, Cruce Calchaquí 2026, 4 Refugios 2027 y Desafío Punta Negra 2027.
- **Dos fechas flojas**: Ushuaia Epic Trail tiene `2026-11-22` sin respaldo (el evento fue del 20 al 22 y ninguna fuente dice qué día corrió el trail), y Maratón del Fin del Mundo tiene `2026-04-20`, que cayó lunes.
- **Nombres con sponsor** sin alinear, varios con el año adentro ("NB 21K La Plata 2026"). Se dejaron como están: el `name` es de la carrera, no de la edición, y el slug se deriva de él, así que seguirle el sponsor cada año rompe URLs.
- **Cinco grafías del kilómetro vertical**: `PRVertical`, `KV`, `KMV`, `Km Vertical` y `Vertical`, cada una tomada de la fuente de su carrera.
- **Cinco carreras detectadas que no están en el JSON**: JUJUY Fuerza Sagrada by UTMB, Los 4 Elementos, Circuito de las Estaciones VERANO (20-dic-2026, Palermo), Carlos Paz Night Trail y Media Maratón Ciudad de Carlos Paz.
- **Tres sitios oficiales devuelven 403 a clientes automatizados** y funcionan en navegador: `elcruce.com.ar`, `laetapa.com.ar` y `ultraalpina.com`. No están caídos.

Dos cosas a tener en cuenta al verificar links: hubo dos dominios de carreras de Ushuaia (`ushuaiarun.com` y `ushuaiabyutmb.com`) que fueron tomados por sitios de apuestas, así que un `200` no alcanza — hay que mirar a dónde termina el redirect. Y algunas ediciones viejas se habían generado cambiándole el año a la fila anterior: si una fecha de fin de semana cae en día hábil, conviene desconfiar.

---

## Resetear la base de datos

Lo habitual, después de editar los JSON de `scripts/data/`:

```bash
pnpm db:reset
```

Esto hace en orden:
1. **Vacía** las tablas del catálogo: provincias, localidades, disciplinas, carreras, ediciones, lugares y links
2. Carga los datos con `pnpm seed`

**Las cuentas no se tocan.** `users` y `password_reset_tokens` quedan intactas, así que no perdés el acceso a `/admin`. El script avisa cuántos usuarios y admins conservó.

### Por qué no corre `db:push`

Las tablas se vacían en vez de borrarse, así que el schema ya está y no hay nada que aplicar. Además `drizzle-kit push` hoy **falla sobre una base que ya tiene los índices unique**: vuelve a emitir el `CREATE UNIQUE INDEX` de `races_slug_unique` y corta con `index already exists`. Solo funciona sobre una base vacía.

Por eso, **si cambiás el schema** (`lib/db/schema.ts`), el camino es:

```bash
pnpm db:reset:all   # borra TODO, corre db:push y siembra
```

Eso sí borra las cuentas: después hay que volver a crear el admin (ver abajo).

---

## Estructura del proyecto

```
app/
├── (public)/           # Páginas públicas (sin auth)
│   ├── page.tsx        # Homepage — listado con filtros
│   └── carreras/[slug]/ediciones/[year]/page.tsx
├── (auth)/             # Páginas de auth (login, register...)
├── (app)/              # Páginas autenticadas (perfil)
└── admin/              # Panel de administración
    ├── carreras/       # CRUD de carreras
    ├── ediciones/      # CRUD de ediciones
    ├── lugares/        # CRUD de lugares
    ├── localidades/    # CRUD de localidades
    ├── links/          # CRUD de links
    └── usuarios/       # CRUD de usuarios

lib/
├── auth.ts             # Configuración de Auth.js
├── db/
│   ├── index.ts        # Cliente Drizzle
│   └── schema.ts       # Schema de la base de datos
└── queries/            # Funciones de consulta reutilizables

actions/                # Server Actions (mutaciones)
components/
├── ui/                 # Componentes shadcn/ui
├── races/              # Componentes de carreras
└── admin/              # Componentes del admin

scripts/
├── data/
│   ├── provinces.json  # Datos de seed — provincias y localidades
│   └── races.json      # Datos de seed — carreras
└── seed.ts             # Script de seed
```

---

## Crear el primer usuario admin

Después de correr `pnpm db:push`, creá el primer usuario admin con Drizzle Studio:

```bash
pnpm db:studio
```

O con este script rápido (reemplazá los valores):

```bash
node -e "
const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const client = createClient({ url: process.env.TURSO_DATABASE_URL });
const hash = bcrypt.hashSync('tu-password', 12);
client.execute({ sql: 'INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, 1)', args: ['Tu Nombre', 'tu@email.com', hash] })
  .then(() => { console.log('Usuario admin creado'); process.exit(0); });
"
```

---

## Deploy en Vercel

1. Subir el código a GitHub
2. Crear un proyecto en [vercel.com](https://vercel.com) apuntando al repo
3. Agregar las variables de entorno en **Settings → Environment Variables**:
   - `AUTH_SECRET`
   - `NEXTAUTH_URL` → URL de producción (ej: `https://calendariorunner.vercel.app`)
   - `TURSO_DATABASE_URL` → `libsql://tu-base.turso.io`
   - `TURSO_AUTH_TOKEN`
   - `RESEND_API_KEY`
   - `RESEND_FROM`
   - `REGISTRATION_ENABLED` → `false`
   - `NEXT_PUBLIC_REGISTRATION_ENABLED` → `false`
4. Deploy → listo

**Crear la base en Turso (producción):**

```bash
turso auth login
turso db create calendario-runner
turso db show calendario-runner --url
turso db tokens create calendario-runner
```

O bien desde el **Vercel Marketplace** → Storage → Add Integration → Turso, que configura las variables automáticamente.

**Apuntar los comandos locales a producción:**

Creá `.env.production.local` con las credenciales de Turso producción:

```
TURSO_DATABASE_URL=libsql://tu-base.turso.io
TURSO_AUTH_TOKEN=tu-token-de-produccion
```

> `.env.production.local` está en `.gitignore` — nunca se commitea.

Luego ejecutá contra producción desde tu máquina:

```bash
pnpm db:push:prod       # aplica el schema (solo en una base vacía)
pnpm db:seed:prod       # carga los datos en producción
pnpm db:reset:prod      # recarga el catálogo, conservando las cuentas
pnpm db:reset:all:prod  # ⚠ borra TODO en producción, cuentas incluidas
```

Vercel detecta automáticamente que el proyecto usa `pnpm` por el `pnpm-lock.yaml`.

**Costo mensual estimado: $0** — Turso free tier + Vercel Hobby + Resend free.

---

## Panel de administración

El panel está en `/admin` y solo es accesible para usuarios con `is_admin = true`.

Permite gestionar:
- **Carreras** — nombre, disciplina, descripción, imagen, lugar
- **Ediciones** — fechas de inicio/fin, distancias
- **Lugares** — provincia y localidad asociada a cada carrera
- **Localidades** — listado de localidades por provincia
- **Links** — web, Instagram, WhatsApp, etc. de cada carrera
- **Usuarios** — crear y gestionar cuentas de administradores

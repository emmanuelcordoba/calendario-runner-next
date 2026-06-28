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

O en un solo comando:

```bash
pnpm db:reset
```

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

### Base de datos

```bash
pnpm db:push    # Aplicar el schema (crea las tablas si no existen)
pnpm db:studio  # Abrir Drizzle Studio (UI visual de la base)
pnpm seed       # Cargar datos desde scripts/data/*.json
pnpm db:reset   # ⚠ Resetear todo: borra local.db, recrea tablas y carga el seed
```

---

## Datos de seed

Los datos iniciales (provincias, localidades, disciplinas y carreras) están en `scripts/data/`:

```
scripts/data/
├── provinces.json   # Provincias y localidades de Argentina
└── races.json       # Carreras con ediciones, lugares y links
```

Estos archivos se commitean al repo. Para agregar o editar carreras, modificá los JSONs y corré `pnpm db:reset`.

---

## Resetear la base de datos

Para empezar desde cero — útil cuando cambiás el schema o editás los datos de seed:

```bash
pnpm db:reset
```

Esto hace en orden:
1. Borra `local.db` (y archivos WAL si existen)
2. Recrea todas las tablas con `pnpm db:push`
3. Carga los datos con `pnpm seed`

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

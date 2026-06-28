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

Copiá el archivo de ejemplo y completá los valores:

```bash
cp .env.example .env.local
```

Variables requeridas en `.env.local`:

| Variable | Descripción | Cómo obtener |
|----------|-------------|--------------|
| `AUTH_SECRET` | Clave secreta para JWT | Ver abajo |
| `NEXTAUTH_URL` | URL base de la app | `http://localhost:3000` en local |
| `TURSO_DATABASE_URL` | URL de la base Turso | [turso.tech](https://turso.tech) |
| `TURSO_AUTH_TOKEN` | Token de autenticación Turso | CLI de Turso |
| `RESEND_API_KEY` | API key de Resend | [resend.com](https://resend.com) |
| `RESEND_FROM` | Email remitente | `Calendario Runner <noreply@tudominio.com>` |
| `REGISTRATION_ENABLED` | Habilitar registro público | `true` / `false` |

**Generar `AUTH_SECRET`:**
```bash
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Max 256 }))

# Linux / Mac
openssl rand -base64 32
```

**Crear base de datos Turso:**
```bash
# Instalar CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login y crear base
turso auth login
turso db create calendario-runner

# Obtener URL y token
turso db show calendario-runner --url
turso db tokens create calendario-runner
```

### 3. Crear las tablas

```bash
pnpm db:push
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
pnpm dev          # Servidor de desarrollo en localhost:3000
pnpm build        # Build de producción
pnpm start        # Iniciar servidor de producción
```

### Base de datos

```bash
pnpm db:push      # Aplicar el schema a Turso (sin migraciones)
pnpm db:studio    # Abrir Drizzle Studio (UI visual de la base)
```

### Migración de datos (desde Laravel/MySQL)

```bash
pnpm migrate      # Correr el script de migración
```

Ver instrucciones completas en [Migración de datos](#migración-de-datos).

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
│   ├── index.ts        # Cliente Drizzle + Turso
│   └── schema.ts       # Schema de la base de datos
└── queries/            # Funciones de consulta reutilizables

actions/                # Server Actions (mutaciones)
components/
├── ui/                 # Componentes shadcn/ui
├── races/              # Componentes de carreras
└── admin/              # Componentes del admin

scripts/
└── migrate-from-mysql.ts   # Script de migración desde Laravel
```

---

## Migración de datos

Para migrar los datos desde el proyecto Laravel original:

**1. Exportar tablas desde MySQL** (TablePlus, phpMyAdmin, o CLI):

```sql
-- Exportar cada tabla a CSV con encabezados
SELECT * FROM provinces INTO OUTFILE '/tmp/provinces.csv' ...
-- O usar la opción "Export to CSV" de tu cliente de base de datos
```

Las tablas a exportar son: `provinces`, `localities`, `disciplines`, `races`, `editions`, `places`, `links`.

**2. Poner los CSVs en `scripts/data/`:**

```
scripts/data/
├── provinces.csv
├── localities.csv
├── disciplines.csv
├── races.csv
├── editions.csv
├── places.csv
└── links.csv
```

**3. Correr el script:**

```bash
pnpm migrate
```

Los archivos CSV en `scripts/data/` están en `.gitignore` para no subir datos de producción al repo.

---

## Crear el primer usuario admin

Después de correr `pnpm db:push`, creá el primer usuario admin directamente con Drizzle Studio:

```bash
pnpm db:studio
```

O con un script rápido (reemplazá los valores):

```bash
node -e "
const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
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
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `RESEND_API_KEY`
   - `RESEND_FROM`
   - `REGISTRATION_ENABLED` → `false`
   - `NEXT_PUBLIC_REGISTRATION_ENABLED` → `false`
4. Deploy → listo

Vercel detecta automáticamente que el proyecto usa `pnpm` por el `pnpm-lock.yaml`.

**Costo mensual estimado: $0** — Turso free tier + Vercel Hobby + Resend free.

---

## Panel de administración

El panel está en `/admin` y solo es accesible para usuarios con `is_admin = true`.

Permite gestionar:
- **Carreras** — nombre, disciplina, descripción, imagen, lugar
- **Ediciones** — fechas de inicio/fin, distancias, imagen por edición
- **Lugares** — provincia y localidad asociada a cada carrera
- **Localidades** — listado de localidades por provincia
- **Links** — web, Instagram, WhatsApp, etc. de cada carrera
- **Usuarios** — crear y gestionar cuentas de administradores

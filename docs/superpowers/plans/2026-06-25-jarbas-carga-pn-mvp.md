# Jarbas Carga PN MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first Jarbas vertical MVP: real login, group-based permission, text/voice interaction, Excel upload, Supabase execution tracking, and n8n-triggered SAP B1 Partner load.

**Architecture:** Next.js App Router hosts the Jarbas UI and backend route handlers. Supabase provides Auth, database, storage, execution status, logs, checklists, and conversation history. n8n workflow `AfhcrI8P35wY0SV7` executes the real Carga PN process using business rules from `aeXRhoPa7qV4X55X` and writes progress back to Supabase.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth/Database/Storage, Vercel AI SDK-style provider abstraction, Vitest, React Testing Library, n8n MCP/Workflow SDK, SAP B1 Service Layer through n8n.

## Next Access Priority

When work resumes on 2026-06-26, start from **Task 3: Supabase Clients, Auth Middleware, and Login Page**.

Before promoting anything to `hom`, check `docs/checklists/implantacao-jarbas-mvp.md`, especially the Supabase migration note:

- If `supabase/migrations/202606250001_jarbas_mvp.sql` has not been applied to a real Supabase environment yet, apply the current file.
- If an older version of that migration was already applied, create an incremental migration for the Task 2 review fixes instead of relying on edits to the original migration file.

## Global Constraints

- The MVP uses real login through Supabase Auth with e-mail and password.
- The first operational group is `Solucoes`, but the schema must support future groups such as `Consultoria` and `Administrativo`.
- Jarbas must not assume the user name; it must read `profile.display_name` or use a neutral greeting.
- Communication supports text and voice; text remains fully functional when browser voice APIs are unavailable.
- The Jarbas brain uses an AI Router so providers such as OpenAI, Anthropic/Claude, GLM, or OpenAI-compatible APIs can be configured without changing UI components.
- AI provider API keys, bearer tokens, OAuth/Auth tokens, and gateway credentials must never be exposed to the browser.
- The first agent is `Carga PN Excel`, allowed for group `Solucoes`.
- The Excel file uses one fixed standard format for the MVP.
- The target n8n workflow is `JARBAS - SOLUCOES - CARGA PN EXCEL (#AfhcrI8P35wY0SV7)`.
- The reference n8n workflow is `2-CARGA_PN_EXCEL (#aeXRhoPa7qV4X55X)`.
- Development must happen on branch `dev`; validation is promoted to `hom`; production is promoted to `main`.
- Jarbas orchestrates; n8n executes the technical load.
- Supabase is the operational status base for progress, logs, checklists, and history.
- Do not write directly to SAP B1 transactional tables.
- Existing prototype files under `documentacao/levantamento/telas/` are references, not final application files.

---

## File Structure

Create a Next.js app in the project root while preserving documentation folders.

```text
.
|-- app/
|   |-- (auth)/login/page.tsx
|   |-- (jarbas)/page.tsx
|   |-- api/jarbas/executions/route.ts
|   |-- api/jarbas/executions/[id]/route.ts
|   |-- api/jarbas/upload/route.ts
|   |-- globals.css
|   `-- layout.tsx
|-- components/
|   |-- auth/login-form.tsx
|   |-- jarbas/agent-panel.tsx
|   |-- jarbas/chat-composer.tsx
|   |-- jarbas/execution-progress.tsx
|   |-- jarbas/file-upload.tsx
|   |-- jarbas/jarbas-shell.tsx
|   `-- jarbas/voice-controls.tsx
|-- lib/
|   |-- ai/
|   |   |-- providers.ts
|   |   |-- router.ts
|   |   `-- types.ts
|   |-- agents.ts
|   |-- execution-status.ts
|   |-- n8n.ts
|   |-- permissions.ts
|   |-- supabase/
|   |   |-- browser.ts
|   |   |-- middleware.ts
|   |   `-- server.ts
|   `-- voice.ts
|-- middleware.ts
|-- supabase/
|   |-- migrations/202606250001_jarbas_mvp.sql
|   `-- seed/202606250001_jarbas_mvp_seed.sql
|-- tests/
|   |-- ai-router.test.ts
|   |-- agents.test.ts
|   |-- execution-status.test.ts
|   |-- permissions.test.ts
|   `-- voice.test.ts
|-- package.json
|-- tsconfig.json
|-- vitest.config.ts
`-- docs/superpowers/specs/2026-06-25-jarbas-carga-pn-mvp-design.md
```

---

### Task 1: Project Foundation

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `vitest.config.ts`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `.gitignore`
- Test: `tests/agents.test.ts`

**Interfaces:**
- Produces: working npm scripts `dev`, `build`, `test`, `lint`.
- Produces: import alias `@/*`.
- Produces: test environment for later TypeScript unit tests.

- [ ] **Step 1: Initialize Git for commit-based work**

Run:

```powershell
git init
```

Expected: `.git/` is created and `git status --short` runs without fatal error.

- [ ] **Step 2: Create `package.json`**

Create `package.json`:

```json
{
  "name": "jarbas-carga-pn-mvp",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@ai-sdk/anthropic": "latest",
    "@ai-sdk/openai": "latest",
    "@supabase/ssr": "latest",
    "@supabase/supabase-js": "latest",
    "ai": "latest",
    "next": "latest",
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@testing-library/user-event": "latest",
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "@tailwindcss/postcss": "latest",
    "@vitejs/plugin-react": "latest",
    "jsdom": "latest",
    "postcss": "latest",
    "tailwindcss": "latest",
    "typescript": "latest",
    "vite-tsconfig-paths": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 3: Install dependencies**

Run:

```powershell
npm install
```

Expected: `node_modules/` and `package-lock.json` are created.

- [ ] **Step 4: Create TypeScript and tooling config**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

Create `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

Create `postcss.config.mjs`:

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

Create `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        jarbas: {
          bg: "#070d1f",
          surface: "#0c1324",
          panel: "#151b2d",
          cyan: "#00dbe9",
          blue: "#bbc3ff",
          text: "#dce1fb",
          muted: "#849495"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Sora", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;
```

Create `vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: []
  }
});
```

- [ ] **Step 5: Create minimal app shell**

Create `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jarbas",
  description: "Jarbas operational assistant"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
```

Create `app/globals.css`:

```css
@import "tailwindcss";

:root {
  color-scheme: dark;
}

body {
  margin: 0;
  min-height: 100vh;
  background: #070d1f;
  color: #dce1fb;
}
```

Create `.gitignore`:

```text
node_modules
.next
.env
.env.local
.superpowers
coverage
```

- [ ] **Step 6: Write the first failing test**

Create `tests/agents.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { JARBAS_AGENTS } from "@/lib/agents";

describe("JARBAS_AGENTS", () => {
  it("defines the initial Carga PN Excel agent", () => {
    expect(JARBAS_AGENTS).toContainEqual({
      slug: "carga-pn-excel",
      name: "Carga PN Excel",
      workflowId: "AfhcrI8P35wY0SV7",
      groupSlug: "solucoes"
    });
  });
});
```

- [ ] **Step 7: Run test to verify it fails**

Run:

```powershell
npm test -- tests/agents.test.ts
```

Expected: FAIL because `@/lib/agents` does not exist.

- [ ] **Step 8: Add minimal agent registry**

Create `lib/agents.ts`:

```ts
export type JarbasAgent = {
  slug: "carga-pn-excel";
  name: string;
  workflowId: string;
  groupSlug: "solucoes";
};

export const JARBAS_AGENTS: JarbasAgent[] = [
  {
    slug: "carga-pn-excel",
    name: "Carga PN Excel",
    workflowId: "AfhcrI8P35wY0SV7",
    groupSlug: "solucoes"
  }
];
```

- [ ] **Step 9: Run tests and build**

Run:

```powershell
npm test
npm run build
```

Expected: tests PASS and build completes.

- [ ] **Step 10: Commit**

```powershell
git add package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs tailwind.config.ts vitest.config.ts app/layout.tsx app/globals.css .gitignore lib/agents.ts tests/agents.test.ts
git commit -m "chore: scaffold Jarbas MVP app"
```

---

### Task 2: Supabase Schema, Groups, Agents, and Status Model

**Files:**
- Create: `supabase/migrations/202606250001_jarbas_mvp.sql`
- Create: `supabase/seed/202606250001_jarbas_mvp_seed.sql`
- Create: `lib/execution-status.ts`
- Test: `tests/execution-status.test.ts`

**Interfaces:**
- Produces: SQL tables `profiles`, `groups`, `user_groups`, `agents`, `agent_permissions`, `jarbas_uploaded_files`, `jarbas_executions`, `jarbas_execution_steps`, `jarbas_execution_logs`, `jarbas_checklists`, `conversation_history`.
- Produces: `EXECUTION_STATUSES: readonly ExecutionStatus[]`.
- Produces: `isTerminalExecutionStatus(status: ExecutionStatus): boolean`.

- [ ] **Step 1: Write failing status tests**

Create `tests/execution-status.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  EXECUTION_STATUSES,
  isTerminalExecutionStatus
} from "@/lib/execution-status";

describe("execution statuses", () => {
  it("contains the approved MVP statuses", () => {
    expect(EXECUTION_STATUSES).toEqual([
      "created",
      "waiting_file",
      "file_received",
      "validating_excel",
      "processing",
      "paused_error",
      "waiting_user_action",
      "resuming",
      "finished",
      "failed",
      "cancelled"
    ]);
  });

  it("identifies terminal statuses", () => {
    expect(isTerminalExecutionStatus("finished")).toBe(true);
    expect(isTerminalExecutionStatus("failed")).toBe(true);
    expect(isTerminalExecutionStatus("cancelled")).toBe(true);
    expect(isTerminalExecutionStatus("processing")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test -- tests/execution-status.test.ts
```

Expected: FAIL because `@/lib/execution-status` does not exist.

- [ ] **Step 3: Implement status library**

Create `lib/execution-status.ts`:

```ts
export const EXECUTION_STATUSES = [
  "created",
  "waiting_file",
  "file_received",
  "validating_excel",
  "processing",
  "paused_error",
  "waiting_user_action",
  "resuming",
  "finished",
  "failed",
  "cancelled"
] as const;

export type ExecutionStatus = (typeof EXECUTION_STATUSES)[number];

export function isTerminalExecutionStatus(status: ExecutionStatus): boolean {
  return status === "finished" || status === "failed" || status === "cancelled";
}
```

- [ ] **Step 4: Run status tests**

Run:

```powershell
npm test -- tests/execution-status.test.ts
```

Expected: PASS.

- [ ] **Step 5: Create Supabase migration**

Create `supabase/migrations/202606250001_jarbas_mvp.sql`:

```sql
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  email text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, group_id)
);

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_permissions (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  can_execute boolean not null default false,
  created_at timestamptz not null default now(),
  unique (agent_id, group_id)
);

create table if not exists public.ai_providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  base_url text,
  auth_mode text not null default 'api_key' check (auth_mode in ('api_key', 'bearer_token', 'oauth', 'gateway')),
  secret_ref text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_models (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.ai_providers(id) on delete cascade,
  model_key text not null,
  display_name text not null,
  supports_text boolean not null default true,
  supports_vision boolean not null default false,
  supports_tools boolean not null default false,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (provider_id, model_key)
);

create table if not exists public.agent_ai_policies (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  primary_model_id uuid not null references public.ai_models(id),
  fallback_model_id uuid references public.ai_models(id),
  temperature numeric(3,2) not null default 0.2,
  max_output_tokens integer not null default 1000,
  created_at timestamptz not null default now(),
  unique (agent_id, group_id)
);

create table if not exists public.jarbas_uploaded_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bucket text not null,
  file_path text not null,
  original_name text not null,
  mime_type text not null,
  status text not null default 'uploaded',
  created_at timestamptz not null default now()
);

create table if not exists public.jarbas_executions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  group_id uuid not null references public.groups(id),
  agent_id uuid not null references public.agents(id),
  workflow_id text not null,
  uploaded_file_id uuid references public.jarbas_uploaded_files(id),
  status text not null default 'created',
  current_step text not null default 'created',
  progress_percent integer not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create table if not exists public.jarbas_execution_steps (
  id uuid primary key default gen_random_uuid(),
  execution_id uuid not null references public.jarbas_executions(id) on delete cascade,
  step_key text not null,
  step_label text not null,
  status text not null default 'pending',
  progress_percent integer not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  started_at timestamptz,
  finished_at timestamptz,
  unique (execution_id, step_key)
);

create table if not exists public.jarbas_execution_logs (
  id uuid primary key default gen_random_uuid(),
  execution_id uuid not null references public.jarbas_executions(id) on delete cascade,
  level text not null check (level in ('info', 'warning', 'error')),
  message text not null,
  row_number integer,
  card_code text,
  cnpj text,
  raw_payload_ref text,
  created_at timestamptz not null default now()
);

create table if not exists public.jarbas_checklists (
  id uuid primary key default gen_random_uuid(),
  execution_id uuid not null references public.jarbas_executions(id) on delete cascade,
  label text not null,
  status text not null default 'pending',
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  execution_id uuid references public.jarbas_executions(id) on delete set null,
  role text not null check (role in ('user', 'assistant', 'system')),
  channel text not null check (channel in ('text', 'voice')),
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.user_groups enable row level security;
alter table public.agents enable row level security;
alter table public.agent_permissions enable row level security;
alter table public.ai_providers enable row level security;
alter table public.ai_models enable row level security;
alter table public.agent_ai_policies enable row level security;
alter table public.jarbas_uploaded_files enable row level security;
alter table public.jarbas_executions enable row level security;
alter table public.jarbas_execution_steps enable row level security;
alter table public.jarbas_execution_logs enable row level security;
alter table public.jarbas_checklists enable row level security;
alter table public.conversation_history enable row level security;
```

- [ ] **Step 6: Create seed data**

Create `supabase/seed/202606250001_jarbas_mvp_seed.sql`:

```sql
insert into public.groups (name, slug)
values
  ('Solucoes', 'solucoes'),
  ('Consultoria', 'consultoria'),
  ('Administrativo', 'administrativo')
on conflict (slug) do nothing;

insert into public.agents (name, slug, description)
values (
  'Carga PN Excel',
  'carga-pn-excel',
  'Executa carga de Parceiro de Negocio via Excel padrao usando workflow n8n Jarbas.'
)
on conflict (slug) do nothing;

insert into public.agent_permissions (agent_id, group_id, can_execute)
select a.id, g.id, true
from public.agents a
join public.groups g on g.slug = 'solucoes'
where a.slug = 'carga-pn-excel'
on conflict (agent_id, group_id) do update set can_execute = excluded.can_execute;

insert into public.ai_providers (name, slug, base_url, auth_mode, secret_ref)
values
  ('OpenAI', 'openai', null, 'api_key', 'OPENAI_API_KEY'),
  ('Anthropic', 'anthropic', null, 'api_key', 'ANTHROPIC_API_KEY'),
  ('GLM', 'glm', null, 'api_key', 'GLM_API_KEY'),
  ('OpenAI Compatible', 'openai_compatible', 'OPENAI_COMPATIBLE_BASE_URL', 'api_key', 'OPENAI_COMPATIBLE_API_KEY')
on conflict (slug) do nothing;

insert into public.ai_models (provider_id, model_key, display_name, supports_text, supports_vision, supports_tools)
select p.id, 'default-chat', 'Default Chat Model', true, false, true
from public.ai_providers p
where p.slug = 'openai'
on conflict (provider_id, model_key) do nothing;

insert into public.agent_ai_policies (
  agent_id,
  group_id,
  primary_model_id,
  temperature,
  max_output_tokens
)
select a.id, g.id, m.id, 0.2, 1000
from public.agents a
join public.groups g on g.slug = 'solucoes'
join public.ai_providers p on p.slug = 'openai'
join public.ai_models m on m.provider_id = p.id and m.model_key = 'default-chat'
where a.slug = 'carga-pn-excel'
on conflict (agent_id, group_id) do update set
  primary_model_id = excluded.primary_model_id,
  temperature = excluded.temperature,
  max_output_tokens = excluded.max_output_tokens;
```

- [ ] **Step 7: Run tests**

Run:

```powershell
npm test
```

Expected: PASS.

- [ ] **Step 8: Commit**

```powershell
git add supabase/migrations/202606250001_jarbas_mvp.sql supabase/seed/202606250001_jarbas_mvp_seed.sql lib/execution-status.ts tests/execution-status.test.ts
git commit -m "feat: define Jarbas Supabase data model"
```

---

### Task 3: Supabase Clients, Auth Middleware, and Login Page

**Files:**
- Create: `lib/supabase/browser.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/middleware.ts`
- Create: `middleware.ts`
- Create: `app/(auth)/login/page.tsx`
- Create: `components/auth/login-form.tsx`

**Interfaces:**
- Produces: `createBrowserClient(): SupabaseClient`.
- Produces: `createServerClient(): Promise<SupabaseClient>`.
- Produces: login form that calls Supabase Auth with e-mail and password.

- [ ] **Step 1: Create Supabase browser client**

Create `lib/supabase/browser.ts`:

```ts
import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase browser env vars are missing");
  }

  return createSupabaseBrowserClient(url, anonKey);
}
```

- [ ] **Step 2: Create Supabase server client**

Create `lib/supabase/server.ts`:

```ts
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase server env vars are missing");
  }

  const cookieStore = await cookies();

  return createSupabaseServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      }
    }
  });
}
```

- [ ] **Step 3: Create auth middleware**

Create `lib/supabase/middleware.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  const { data } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isLogin = path.startsWith("/login");
  const isApi = path.startsWith("/api");

  if (!data.user && !isLogin && !isApi) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  if (data.user && isLogin) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
```

Create `middleware.ts`:

```ts
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
```

- [ ] **Step 4: Create login page**

Create `app/(auth)/login/page.tsx`:

```tsx
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-jarbas-bg text-jarbas-text">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
        <div className="rounded-lg border border-white/10 bg-jarbas-surface/80 p-8 shadow-2xl">
          <p className="font-mono text-xs uppercase tracking-widest text-jarbas-cyan">
            Assistente Jarbas
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold">Acessar Jarbas</h1>
          <p className="mt-2 text-sm text-jarbas-muted">
            Entre com seu e-mail e senha para iniciar uma sessao segura.
          </p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
```

Create `components/auth/login-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false);

    if (signInError) {
      setError("Nao foi possivel autenticar. Verifique e-mail e senha.");
      return;
    }

    window.location.href = "/";
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={onSubmit}>
      <label className="block text-sm">
        E-mail
        <input
          className="mt-2 w-full rounded border border-white/10 bg-jarbas-panel px-3 py-3 text-jarbas-text outline-none focus:border-jarbas-cyan"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label className="block text-sm">
        Senha
        <input
          className="mt-2 w-full rounded border border-white/10 bg-jarbas-panel px-3 py-3 text-jarbas-text outline-none focus:border-jarbas-cyan"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <button
        className="w-full rounded bg-jarbas-cyan px-4 py-3 font-semibold text-jarbas-bg disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
```

- [ ] **Step 5: Run build**

Run:

```powershell
npm run build
```

Expected: build completes when Supabase environment variables are present. If env vars are absent, build fails with "Supabase server env vars are missing"; create `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

- [ ] **Step 6: Commit**

```powershell
git add lib/supabase middleware.ts app components
git commit -m "feat: add Supabase login"
```

---

### Task 4: Group Permission Logic

**Files:**
- Create: `lib/permissions.ts`
- Test: `tests/permissions.test.ts`

**Interfaces:**
- Consumes: `JarbasAgent` from `lib/agents.ts`.
- Produces: `canExecuteAgent(userGroupSlugs: string[], agent: JarbasAgent): boolean`.
- Produces: group model ready for `solucoes`, `consultoria`, and `administrativo`.

- [ ] **Step 1: Write failing permission tests**

Create `tests/permissions.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { JARBAS_AGENTS } from "@/lib/agents";
import { canExecuteAgent } from "@/lib/permissions";

const cargaPn = JARBAS_AGENTS[0];

describe("canExecuteAgent", () => {
  it("allows Solucoes to execute Carga PN Excel", () => {
    expect(canExecuteAgent(["solucoes"], cargaPn)).toBe(true);
  });

  it("does not allow Consultoria to execute Carga PN Excel", () => {
    expect(canExecuteAgent(["consultoria"], cargaPn)).toBe(false);
  });

  it("does not allow Administrativo to execute Carga PN Excel", () => {
    expect(canExecuteAgent(["administrativo"], cargaPn)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test -- tests/permissions.test.ts
```

Expected: FAIL because `@/lib/permissions` does not exist.

- [ ] **Step 3: Implement permission function**

Create `lib/permissions.ts`:

```ts
import type { JarbasAgent } from "@/lib/agents";

export function canExecuteAgent(userGroupSlugs: string[], agent: JarbasAgent): boolean {
  return userGroupSlugs.includes(agent.groupSlug);
}
```

- [ ] **Step 4: Run tests**

Run:

```powershell
npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add lib/permissions.ts tests/permissions.test.ts
git commit -m "feat: add group-based agent permissions"
```

---

### Task 4A: AI Router and Provider Policy

**Files:**
- Create: `lib/ai/types.ts`
- Create: `lib/ai/providers.ts`
- Create: `lib/ai/router.ts`
- Test: `tests/ai-router.test.ts`

**Interfaces:**
- Produces: `AiProviderSlug = "openai" | "anthropic" | "glm" | "openai_compatible"`.
- Produces: `AiAuthMode = "api_key" | "bearer_token" | "oauth" | "gateway"`.
- Produces: `resolveAiModelPolicy(policy: AgentAiPolicy): ResolvedAiModelPolicy`.
- Produces: `getProviderEnvKey(providerSlug: AiProviderSlug): string`.
- Produces: provider control without exposing API keys to browser code.

- [ ] **Step 1: Write failing AI router tests**

Create `tests/ai-router.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getProviderAuthDefaults, getProviderEnvKey, resolveAiModelPolicy } from "@/lib/ai/router";

describe("AI Router", () => {
  it("maps providers to backend-only env vars", () => {
    expect(getProviderEnvKey("openai")).toBe("OPENAI_API_KEY");
    expect(getProviderEnvKey("anthropic")).toBe("ANTHROPIC_API_KEY");
    expect(getProviderEnvKey("glm")).toBe("GLM_API_KEY");
    expect(getProviderEnvKey("openai_compatible")).toBe("OPENAI_COMPATIBLE_API_KEY");
  });

  it("keeps provider auth configurable by provider", () => {
    expect(getProviderAuthDefaults("openai")).toEqual({
      authMode: "api_key",
      secretRef: "OPENAI_API_KEY"
    });
    expect(getProviderAuthDefaults("anthropic")).toEqual({
      authMode: "api_key",
      secretRef: "ANTHROPIC_API_KEY"
    });
  });

  it("resolves primary model and fallback model from policy", () => {
    const resolved = resolveAiModelPolicy({
      primary: {
        providerSlug: "openai",
        modelKey: "gpt-default"
      },
      fallback: {
        providerSlug: "anthropic",
        modelKey: "claude-default"
      },
      temperature: 0.2,
      maxOutputTokens: 1000
    });

    expect(resolved.primary.providerEnvKey).toBe("OPENAI_API_KEY");
    expect(resolved.fallback?.providerEnvKey).toBe("ANTHROPIC_API_KEY");
    expect(resolved.temperature).toBe(0.2);
    expect(resolved.maxOutputTokens).toBe(1000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test -- tests/ai-router.test.ts
```

Expected: FAIL because `@/lib/ai/router` does not exist.

- [ ] **Step 3: Create AI types**

Create `lib/ai/types.ts`:

```ts
export type AiProviderSlug = "openai" | "anthropic" | "glm" | "openai_compatible";
export type AiAuthMode = "api_key" | "bearer_token" | "oauth" | "gateway";

export type AiModelRef = {
  providerSlug: AiProviderSlug;
  modelKey: string;
};

export type AiProviderAuth = {
  authMode: AiAuthMode;
  secretRef: string;
};

export type AgentAiPolicy = {
  primary: AiModelRef;
  fallback?: AiModelRef;
  temperature: number;
  maxOutputTokens: number;
};

export type ResolvedAiModelRef = AiModelRef & {
  providerEnvKey: string;
};

export type ResolvedAiModelPolicy = {
  primary: ResolvedAiModelRef;
  fallback?: ResolvedAiModelRef;
  temperature: number;
  maxOutputTokens: number;
};
```

- [ ] **Step 4: Create provider registry**

Create `lib/ai/providers.ts`:

```ts
import type { AiProviderAuth, AiProviderSlug } from "@/lib/ai/types";

export const AI_PROVIDER_ENV_KEYS: Record<AiProviderSlug, string> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  glm: "GLM_API_KEY",
  openai_compatible: "OPENAI_COMPATIBLE_API_KEY"
};

export const AI_PROVIDER_AUTH_DEFAULTS: Record<AiProviderSlug, AiProviderAuth> = {
  openai: { authMode: "api_key", secretRef: "OPENAI_API_KEY" },
  anthropic: { authMode: "api_key", secretRef: "ANTHROPIC_API_KEY" },
  glm: { authMode: "api_key", secretRef: "GLM_API_KEY" },
  openai_compatible: { authMode: "api_key", secretRef: "OPENAI_COMPATIBLE_API_KEY" }
};

export const SERVER_ONLY_AI_ENV_KEYS = Object.values(AI_PROVIDER_ENV_KEYS);
```

- [ ] **Step 5: Implement router helpers**

Create `lib/ai/router.ts`:

```ts
import { AI_PROVIDER_AUTH_DEFAULTS, AI_PROVIDER_ENV_KEYS } from "@/lib/ai/providers";
import type {
  AgentAiPolicy,
  AiProviderAuth,
  AiProviderSlug,
  ResolvedAiModelPolicy,
  ResolvedAiModelRef
} from "@/lib/ai/types";

export function getProviderEnvKey(providerSlug: AiProviderSlug): string {
  return AI_PROVIDER_ENV_KEYS[providerSlug];
}

export function getProviderAuthDefaults(providerSlug: AiProviderSlug): AiProviderAuth {
  return AI_PROVIDER_AUTH_DEFAULTS[providerSlug];
}

function resolveModelRef(modelRef: { providerSlug: AiProviderSlug; modelKey: string }): ResolvedAiModelRef {
  return {
    ...modelRef,
    providerEnvKey: getProviderEnvKey(modelRef.providerSlug)
  };
}

export function resolveAiModelPolicy(policy: AgentAiPolicy): ResolvedAiModelPolicy {
  return {
    primary: resolveModelRef(policy.primary),
    fallback: policy.fallback ? resolveModelRef(policy.fallback) : undefined,
    temperature: policy.temperature,
    maxOutputTokens: policy.maxOutputTokens
  };
}
```

- [ ] **Step 6: Run AI router tests**

Run:

```powershell
npm test -- tests/ai-router.test.ts
```

Expected: PASS.

- [ ] **Step 7: Add backend-only env vars to runbook later**

Record these required server-side variables for Task 9:

```text
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GLM_API_KEY=
OPENAI_COMPATIBLE_API_KEY=
OPENAI_COMPATIBLE_BASE_URL=
```

Expected: no browser-facing `NEXT_PUBLIC_` prefix is used for provider secrets.

- [ ] **Step 8: Commit**

```powershell
git add lib/ai tests/ai-router.test.ts
git commit -m "feat: add provider-agnostic AI router"
```

---

### Task 5: Execution and Upload API Contracts

**Files:**
- Create: `lib/n8n.ts`
- Create: `app/api/jarbas/upload/route.ts`
- Create: `app/api/jarbas/executions/route.ts`
- Create: `app/api/jarbas/executions/[id]/route.ts`

**Interfaces:**
- Produces: `triggerCargaPnWorkflow(input: TriggerCargaPnInput): Promise<void>`.
- Produces: `POST /api/jarbas/upload` receiving `file`.
- Produces: `POST /api/jarbas/executions` receiving `uploadedFileId`.
- Produces: `GET /api/jarbas/executions/:id` returning execution status and logs.

- [ ] **Step 1: Create n8n trigger client**

Create `lib/n8n.ts`:

```ts
export type TriggerCargaPnInput = {
  executionId: string;
  userId: string;
  groupId: string;
  agentId: string;
  bucket: string;
  filePath: string;
  signedUrl: string;
};

export async function triggerCargaPnWorkflow(input: TriggerCargaPnInput): Promise<void> {
  const webhookUrl = process.env.N8N_JARBAS_CARGA_PN_WEBHOOK_URL;
  const callbackSecret = process.env.N8N_JARBAS_CALLBACK_SECRET;

  if (!webhookUrl || !callbackSecret) {
    throw new Error("n8n Jarbas webhook env vars are missing");
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      execution_id: input.executionId,
      user_id: input.userId,
      group_id: input.groupId,
      agent_id: input.agentId,
      bucket: input.bucket,
      file_path: input.filePath,
      signed_url: input.signedUrl,
      callback_secret: callbackSecret
    })
  });

  if (!response.ok) {
    throw new Error(`n8n workflow trigger failed with status ${response.status}`);
  }
}
```

- [ ] **Step 2: Create upload route**

Create `app/api/jarbas/upload/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file_required" }, { status: 400 });
  }

  const allowedMimeTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel"
  ];

  if (!allowedMimeTypes.includes(file.type)) {
    return NextResponse.json({ error: "invalid_file_type" }, { status: 400 });
  }

  const bucket = "jarbas-uploads";
  const filePath = `${authData.user.id}/${crypto.randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);

  if (uploadError) {
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }

  const { data: inserted, error: insertError } = await supabase
    .from("jarbas_uploaded_files")
    .insert({
      user_id: authData.user.id,
      bucket,
      file_path: filePath,
      original_name: file.name,
      mime_type: file.type,
      status: "uploaded"
    })
    .select("id,bucket,file_path,original_name,status")
    .single();

  if (insertError) {
    return NextResponse.json({ error: "file_record_failed" }, { status: 500 });
  }

  return NextResponse.json({ file: inserted });
}
```

- [ ] **Step 3: Create execution route**

Create `app/api/jarbas/executions/route.ts`:

```ts
import { NextResponse } from "next/server";
import { JARBAS_AGENTS } from "@/lib/agents";
import { triggerCargaPnWorkflow } from "@/lib/n8n";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { uploadedFileId?: string };

  if (!body.uploadedFileId) {
    return NextResponse.json({ error: "uploaded_file_required" }, { status: 400 });
  }

  const { data: group } = await supabase
    .from("groups")
    .select("id,slug")
    .eq("slug", "solucoes")
    .single();

  const { data: agent } = await supabase
    .from("agents")
    .select("id,slug")
    .eq("slug", "carga-pn-excel")
    .single();

  if (!group || !agent) {
    return NextResponse.json({ error: "agent_not_configured" }, { status: 500 });
  }

  const registryAgent = JARBAS_AGENTS[0];
  const { data: uploadedFile } = await supabase
    .from("jarbas_uploaded_files")
    .select("id,bucket,file_path")
    .eq("id", body.uploadedFileId)
    .eq("user_id", authData.user.id)
    .single();

  if (!uploadedFile) {
    return NextResponse.json({ error: "uploaded_file_not_found" }, { status: 404 });
  }

  const { data: signed } = await supabase.storage
    .from(uploadedFile.bucket)
    .createSignedUrl(uploadedFile.file_path, 60 * 30);

  if (!signed?.signedUrl) {
    return NextResponse.json({ error: "signed_url_failed" }, { status: 500 });
  }

  const { data: execution, error: executionError } = await supabase
    .from("jarbas_executions")
    .insert({
      user_id: authData.user.id,
      group_id: group.id,
      agent_id: agent.id,
      workflow_id: registryAgent.workflowId,
      uploaded_file_id: uploadedFile.id,
      status: "file_received",
      current_step: "recebendo arquivo",
      progress_percent: 5
    })
    .select("id,status,current_step,progress_percent")
    .single();

  if (executionError || !execution) {
    return NextResponse.json({ error: "execution_create_failed" }, { status: 500 });
  }

  await triggerCargaPnWorkflow({
    executionId: execution.id,
    userId: authData.user.id,
    groupId: group.id,
    agentId: agent.id,
    bucket: uploadedFile.bucket,
    filePath: uploadedFile.file_path,
    signedUrl: signed.signedUrl
  });

  return NextResponse.json({ execution });
}
```

- [ ] **Step 4: Create execution read route**

Create `app/api/jarbas/executions/[id]/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: execution } = await supabase
    .from("jarbas_executions")
    .select("id,status,current_step,progress_percent,summary,created_at,started_at,finished_at")
    .eq("id", id)
    .eq("user_id", authData.user.id)
    .single();

  if (!execution) {
    return NextResponse.json({ error: "execution_not_found" }, { status: 404 });
  }

  const { data: logs } = await supabase
    .from("jarbas_execution_logs")
    .select("id,level,message,row_number,card_code,cnpj,created_at")
    .eq("execution_id", id)
    .order("created_at", { ascending: true })
    .limit(50);

  return NextResponse.json({ execution, logs: logs ?? [] });
}
```

- [ ] **Step 5: Run build**

Run:

```powershell
npm run build
```

Expected: build completes when required env vars exist.

- [ ] **Step 6: Commit**

```powershell
git add lib/n8n.ts app/api
git commit -m "feat: add Jarbas upload and execution APIs"
```

---

### Task 6: Jarbas Shell UI With Text and Voice

**Files:**
- Create: `lib/voice.ts`
- Create: `app/(jarbas)/page.tsx`
- Create: `components/jarbas/jarbas-shell.tsx`
- Create: `components/jarbas/chat-composer.tsx`
- Create: `components/jarbas/voice-controls.tsx`
- Create: `components/jarbas/agent-panel.tsx`
- Test: `tests/voice.test.ts`

**Interfaces:**
- Produces: `getGreeting(displayName: string | null | undefined): string`.
- Produces: browser speech helpers guarded by feature detection.
- Produces: Jarbas home page after login.

- [ ] **Step 1: Write failing voice and greeting tests**

Create `tests/voice.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getGreeting, isSpeechRecognitionAvailable, isSpeechSynthesisAvailable } from "@/lib/voice";

describe("getGreeting", () => {
  it("uses display name when available", () => {
    expect(getGreeting("Cesar")).toContain("Ola, Cesar.");
  });

  it("does not invent a name when display name is missing", () => {
    expect(getGreeting(null)).toContain("Ola. Eu sou o Jarbas.");
  });
});

describe("voice feature detection", () => {
  it("returns booleans for browser capabilities", () => {
    expect(typeof isSpeechRecognitionAvailable()).toBe("boolean");
    expect(typeof isSpeechSynthesisAvailable()).toBe("boolean");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test -- tests/voice.test.ts
```

Expected: FAIL because `@/lib/voice` does not exist.

- [ ] **Step 3: Implement voice helpers**

Create `lib/voice.ts`:

```ts
type SpeechRecognitionWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: unknown;
    webkitSpeechRecognition?: unknown;
  };

export function getGreeting(displayName: string | null | undefined): string {
  const trimmed = displayName?.trim();

  if (trimmed) {
    return `Ola, ${trimmed}. Eu sou o Jarbas. Consultei seus historicos e checklists do grupo Solucoes. Posso iniciar uma carga de Parceiro de Negocio ou continuar uma execucao pendente.`;
  }

  return "Ola. Eu sou o Jarbas. Consultei seus historicos e checklists do grupo Solucoes. Posso iniciar uma carga de Parceiro de Negocio ou continuar uma execucao pendente.";
}

export function isSpeechRecognitionAvailable(): boolean {
  if (typeof window === "undefined") return false;
  const speechWindow = window as SpeechRecognitionWindow;
  return Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition);
}

export function isSpeechSynthesisAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return "speechSynthesis" in window;
}

export function speak(text: string): void {
  if (!isSpeechSynthesisAvailable()) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pt-BR";
  window.speechSynthesis.speak(utterance);
}
```

- [ ] **Step 4: Run voice tests**

Run:

```powershell
npm test -- tests/voice.test.ts
```

Expected: PASS.

- [ ] **Step 5: Create Jarbas page**

Create `app/(jarbas)/page.tsx`:

```tsx
import { JarbasShell } from "@/components/jarbas/jarbas-shell";
import { createServerClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createServerClient();
  const { data: authData } = await supabase.auth.getUser();

  const { data: profile } = authData.user
    ? await supabase
        .from("profiles")
        .select("display_name,email")
        .eq("user_id", authData.user.id)
        .single()
    : { data: null };

  return <JarbasShell displayName={profile?.display_name ?? null} />;
}
```

Create `components/jarbas/jarbas-shell.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { getGreeting, speak } from "@/lib/voice";
import { AgentPanel } from "@/components/jarbas/agent-panel";
import { ChatComposer } from "@/components/jarbas/chat-composer";
import { FileUpload } from "@/components/jarbas/file-upload";
import { VoiceControls } from "@/components/jarbas/voice-controls";

export function JarbasShell({ displayName }: { displayName: string | null }) {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const greeting = getGreeting(displayName);
    setMessages([greeting]);
    speak(greeting);
  }, [displayName]);

  return (
    <main className="min-h-screen bg-jarbas-bg text-jarbas-text">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[280px_1fr]">
        <AgentPanel />
        <section className="flex min-h-[calc(100vh-3rem)] flex-col rounded-lg border border-white/10 bg-jarbas-surface/70 p-6">
          <div className="flex-1 space-y-4">
            {messages.map((message, index) => (
              <div key={`${index}-${message}`} className="rounded border border-white/10 bg-jarbas-panel p-4">
                {message}
              </div>
            ))}
            <FileUpload />
          </div>
          <div className="mt-6 flex gap-3">
            <ChatComposer onSend={(message) => setMessages((current) => [...current, message])} />
            <VoiceControls onTranscript={(message) => setMessages((current) => [...current, message])} />
          </div>
        </section>
      </div>
    </main>
  );
}
```

Create `components/jarbas/agent-panel.tsx`:

```tsx
export function AgentPanel() {
  return (
    <aside className="rounded-lg border border-white/10 bg-jarbas-surface/70 p-5">
      <p className="font-mono text-xs uppercase tracking-widest text-jarbas-cyan">Grupo Solucoes</p>
      <h2 className="mt-3 font-display text-xl font-semibold">Agentes Permitidos</h2>
      <div className="mt-5 rounded border border-jarbas-cyan/30 bg-jarbas-panel p-4">
        <p className="font-semibold">Carga PN Excel</p>
        <p className="mt-2 text-sm text-jarbas-muted">Carga de Parceiro de Negocio via Excel padrao.</p>
      </div>
    </aside>
  );
}
```

Create `components/jarbas/chat-composer.tsx`:

```tsx
"use client";

import { useState } from "react";

export function ChatComposer({ onSend }: { onSend: (message: string) => void }) {
  const [value, setValue] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = value.trim();
    if (!message) return;
    onSend(message);
    setValue("");
  }

  return (
    <form className="flex flex-1 gap-3" onSubmit={submit}>
      <input
        className="flex-1 rounded border border-white/10 bg-jarbas-panel px-4 py-3 outline-none focus:border-jarbas-cyan"
        aria-label="Instrucao para o Jarbas"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <button className="rounded bg-jarbas-cyan px-5 font-semibold text-jarbas-bg" type="submit">
        Enviar
      </button>
    </form>
  );
}
```

Create `components/jarbas/voice-controls.tsx`:

```tsx
"use client";

import { isSpeechRecognitionAvailable } from "@/lib/voice";

export function VoiceControls({ onTranscript }: { onTranscript: (message: string) => void }) {
  const available = isSpeechRecognitionAvailable();

  function startVoice() {
    if (!available) {
      onTranscript("Entrada por voz indisponivel neste navegador. Use o campo de texto.");
      return;
    }

    onTranscript("Entrada por voz habilitada. Fale a instrucao para o Jarbas.");
  }

  return (
    <button
      className="rounded border border-jarbas-cyan px-5 font-semibold text-jarbas-cyan"
      type="button"
      onClick={startVoice}
    >
      Voz
    </button>
  );
}
```

Create `components/jarbas/file-upload.tsx`:

```tsx
"use client";

import { useState } from "react";

export function FileUpload() {
  const [status, setStatus] = useState("Aguardando Excel padrao para Carga PN.");

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus(`Arquivo selecionado: ${file.name}`);
  }

  return (
    <div className="rounded border border-white/10 bg-jarbas-panel p-4">
      <p className="font-semibold">Upload Excel Carga PN</p>
      <p className="mt-2 text-sm text-jarbas-muted">{status}</p>
      <input className="mt-4" type="file" accept=".xlsx,.xls" onChange={onFileChange} />
    </div>
  );
}
```

- [ ] **Step 6: Run tests and build**

Run:

```powershell
npm test
npm run build
```

Expected: PASS and build completes with env vars present.

- [ ] **Step 7: Commit**

```powershell
git add lib/voice.ts "app/(jarbas)/page.tsx" components/jarbas tests/voice.test.ts
git commit -m "feat: add Jarbas text and voice shell"
```

---

### Task 7: Progress UI and Execution Lifecycle

**Files:**
- Create: `components/jarbas/execution-progress.tsx`
- Modify: `components/jarbas/file-upload.tsx`
- Modify: `components/jarbas/jarbas-shell.tsx`

**Interfaces:**
- Consumes: `POST /api/jarbas/upload`.
- Consumes: `POST /api/jarbas/executions`.
- Consumes: `GET /api/jarbas/executions/:id`.
- Produces: visible progress percent, current step, and log list.

- [ ] **Step 1: Create execution progress component**

Create `components/jarbas/execution-progress.tsx`:

```tsx
export type ExecutionView = {
  id: string;
  status: string;
  current_step: string;
  progress_percent: number;
  summary: Record<string, unknown>;
};

export type ExecutionLogView = {
  id: string;
  level: "info" | "warning" | "error";
  message: string;
  row_number: number | null;
  card_code: string | null;
  cnpj: string | null;
  created_at: string;
};

export function ExecutionProgress({
  execution,
  logs
}: {
  execution: ExecutionView | null;
  logs: ExecutionLogView[];
}) {
  if (!execution) {
    return null;
  }

  return (
    <section className="rounded border border-white/10 bg-jarbas-panel p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold">Execucao Carga PN</p>
          <p className="text-sm text-jarbas-muted">{execution.current_step}</p>
        </div>
        <strong className="text-2xl text-jarbas-cyan">{execution.progress_percent}%</strong>
      </div>
      <div className="mt-4 h-2 rounded bg-black/30">
        <div
          className="h-2 rounded bg-jarbas-cyan"
          style={{ width: `${execution.progress_percent}%` }}
        />
      </div>
      <div className="mt-4 space-y-2">
        {logs.map((log) => (
          <p key={log.id} className="text-sm text-jarbas-muted">
            [{log.level}] {log.message}
          </p>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire upload and execution start**

Replace `components/jarbas/file-upload.tsx` with:

```tsx
"use client";

import { useState } from "react";

export function FileUpload({ onExecutionStarted }: { onExecutionStarted?: (id: string) => void }) {
  const [status, setStatus] = useState("Aguardando Excel padrao para Carga PN.");
  const [loading, setLoading] = useState(false);

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatus(`Enviando ${file.name}...`);

    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await fetch("/api/jarbas/upload", {
      method: "POST",
      body: formData
    });

    if (!uploadResponse.ok) {
      setStatus("Nao foi possivel enviar o Excel. Verifique o arquivo e tente novamente.");
      setLoading(false);
      return;
    }

    const uploadPayload = (await uploadResponse.json()) as { file: { id: string } };

    const executionResponse = await fetch("/api/jarbas/executions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ uploadedFileId: uploadPayload.file.id })
    });

    if (!executionResponse.ok) {
      setStatus("Arquivo recebido, mas a execucao nao iniciou. Tente novamente.");
      setLoading(false);
      return;
    }

    const executionPayload = (await executionResponse.json()) as { execution: { id: string } };
    setStatus("Carga iniciada. Acompanhando progresso.");
    onExecutionStarted?.(executionPayload.execution.id);
    setLoading(false);
  }

  return (
    <div className="rounded border border-white/10 bg-jarbas-panel p-4">
      <p className="font-semibold">Upload Excel Carga PN</p>
      <p className="mt-2 text-sm text-jarbas-muted">{status}</p>
      <input
        className="mt-4"
        disabled={loading}
        type="file"
        accept=".xlsx,.xls"
        onChange={onFileChange}
      />
    </div>
  );
}
```

- [ ] **Step 3: Poll execution state in shell**

Update `components/jarbas/jarbas-shell.tsx` to include:

```tsx
"use client";

import { useEffect, useState } from "react";
import { getGreeting, speak } from "@/lib/voice";
import { AgentPanel } from "@/components/jarbas/agent-panel";
import { ChatComposer } from "@/components/jarbas/chat-composer";
import { ExecutionProgress, type ExecutionLogView, type ExecutionView } from "@/components/jarbas/execution-progress";
import { FileUpload } from "@/components/jarbas/file-upload";
import { VoiceControls } from "@/components/jarbas/voice-controls";

export function JarbasShell({ displayName }: { displayName: string | null }) {
  const [messages, setMessages] = useState<string[]>([]);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [execution, setExecution] = useState<ExecutionView | null>(null);
  const [logs, setLogs] = useState<ExecutionLogView[]>([]);

  useEffect(() => {
    const greeting = getGreeting(displayName);
    setMessages([greeting]);
    speak(greeting);
  }, [displayName]);

  useEffect(() => {
    if (!executionId) return;

    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/jarbas/executions/${executionId}`);
      if (!response.ok) return;
      const payload = (await response.json()) as {
        execution: ExecutionView;
        logs: ExecutionLogView[];
      };
      setExecution(payload.execution);
      setLogs(payload.logs);
    }, 2500);

    return () => window.clearInterval(timer);
  }, [executionId]);

  return (
    <main className="min-h-screen bg-jarbas-bg text-jarbas-text">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[280px_1fr]">
        <AgentPanel />
        <section className="flex min-h-[calc(100vh-3rem)] flex-col rounded-lg border border-white/10 bg-jarbas-surface/70 p-6">
          <div className="flex-1 space-y-4">
            {messages.map((message, index) => (
              <div key={`${index}-${message}`} className="rounded border border-white/10 bg-jarbas-panel p-4">
                {message}
              </div>
            ))}
            <FileUpload onExecutionStarted={setExecutionId} />
            <ExecutionProgress execution={execution} logs={logs} />
          </div>
          <div className="mt-6 flex gap-3">
            <ChatComposer onSend={(message) => setMessages((current) => [...current, message])} />
            <VoiceControls onTranscript={(message) => setMessages((current) => [...current, message])} />
          </div>
        </section>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Run build**

Run:

```powershell
npm run build
```

Expected: build completes.

- [ ] **Step 5: Commit**

```powershell
git add components/jarbas
git commit -m "feat: show Jarbas execution progress"
```

---

### Task 8: n8n Workflow Construction

**Files:**
- Modify in n8n: workflow `AfhcrI8P35wY0SV7`
- Reference in n8n: workflow `aeXRhoPa7qV4X55X`
- Document: `docs/n8n/jarbas-carga-pn-workflow.md`

**Interfaces:**
- Consumes: webhook payload from `triggerCargaPnWorkflow`.
- Produces: Supabase updates to `jarbas_executions`, `jarbas_execution_steps`, and `jarbas_execution_logs`.
- Produces: final summary in `jarbas_executions.summary`.

- [ ] **Step 1: Read n8n SDK reference before creating workflow code**

Use MCP official n8n tools:

```text
Call get_sdk_reference.
Call get_workflow_best_practices with technique="document_processing".
Call get_workflow_best_practices with technique="data_transformation".
Call get_workflow_best_practices with technique="data_persistence".
Call get_workflow_best_practices with technique="web_app".
```

Expected: local implementation notes are available before workflow code is generated.

- [ ] **Step 2: Inspect reference workflow**

Use MCP:

```text
Call get_workflow_details with workflowId="aeXRhoPa7qV4X55X".
Extract node groups for Excel intake, CNPJ validation, BrasilAPI, OCRD, CRD1, CRD7, SAP login, SAP check, SAP create, error logging, and final reconciliation.
```

Expected: rule inventory is documented in `docs/n8n/jarbas-carga-pn-workflow.md`.

- [ ] **Step 3: Create workflow design document**

Create `docs/n8n/jarbas-carga-pn-workflow.md`:

```markdown
# JARBAS - SOLUCOES - CARGA PN EXCEL

## Workflow IDs

- Target: `AfhcrI8P35wY0SV7`
- Reference: `aeXRhoPa7qV4X55X`

## Trigger Contract

```json
{
  "execution_id": "uuid",
  "user_id": "uuid",
  "group_id": "uuid",
  "agent_id": "uuid",
  "bucket": "jarbas-uploads",
  "file_path": "string",
  "signed_url": "string",
  "callback_secret": "string"
}
```

## Status Steps

1. `validating_excel` - 10%
2. `normalizing_rows` - 20%
3. `validating_cnpj` - 30%
4. `consulting_brasilapi` - 45%
5. `building_sap_payload` - 60%
6. `checking_existing_bp` - 72%
7. `creating_bp` - 85%
8. `reconciling` - 95%
9. `finished` - 100%

## Business Rules From Reference Workflow

- Clean CNPJ.
- Validate 14 numeric characters.
- Validate duplicate rows.
- Consult BrasilAPI.
- Build OCRD payload.
- Build CRD1 addresses.
- Build CRD7 fiscal data.
- Login to SAP B1 Service Layer.
- Check existing Business Partner.
- Create Business Partner.
- Register per-line errors.
- Run final reconciliation.
```
```

- [ ] **Step 4: Discover required n8n nodes**

Use MCP official:

```text
Call search_nodes for: webhook, http request, code, set, if, merge, split in batches, supabase, spreadsheet file.
Call get_node_types for every node ID selected.
```

Expected: exact node types and parameter names are known before writing workflow code.

- [ ] **Step 5: Build the workflow code with SDK**

Write workflow SDK code that creates or updates these nodes:

```text
Webhook Jarbas Carga PN
Validar Payload Jarbas
Atualizar Status: validating_excel
Baixar Excel por signed_url
Ler Excel
Normalizar Excel
Atualizar Status: normalizing_rows
Validar CNPJ
Consultar BrasilAPI
Montar OCRD/CRD1/CRD7
Login SAP B1
Verificar PN Existente
Criar PN
Registrar Resultado Linha
Reconciliar Final
Atualizar Resumo Final
Webhook Response
```

Expected: workflow has a production webhook and can be activated after credentials are set.

- [ ] **Step 6: Validate workflow code**

Use MCP official:

```text
Call validate_workflow with the generated SDK code.
Fix every validation error.
Call validate_workflow again until valid.
```

Expected: validation succeeds.

- [ ] **Step 7: Update workflow `AfhcrI8P35wY0SV7`**

Use MCP official:

```text
Call update_workflow with workflowId="AfhcrI8P35wY0SV7".
Apply node additions, connections, credentials, settings, and metadata in one atomic batch.
```

Expected: target workflow is no longer empty and has a webhook trigger.

- [ ] **Step 8: Manual n8n smoke test**

Run a webhook test payload with a signed URL for a small Excel file containing one valid row.

Expected:

```text
Supabase jarbas_executions.progress_percent reaches 100.
Supabase jarbas_executions.status becomes finished.
Supabase jarbas_execution_logs includes line-level result.
SAP B1 create/check behavior matches the reference workflow rules.
```

- [ ] **Step 9: Commit workflow documentation**

```powershell
git add docs/n8n/jarbas-carga-pn-workflow.md
git commit -m "docs: define Jarbas n8n Carga PN workflow"
```

---

### Task 9: End-to-End Verification and Documentation

**Files:**
- Create: `docs/runbooks/jarbas-carga-pn-mvp.md`
- Modify: `AGENTS.md`
- Modify: `memory/history/2026-06-25-parametrizacao-inicial.md` or create a new history file for the implementation date.

**Interfaces:**
- Produces: runbook for local dev, Supabase setup, n8n setup, and MVP test.
- Produces: Agentic OS memory update.

- [ ] **Step 1: Create runbook**

Create `docs/runbooks/jarbas-carga-pn-mvp.md`:

```markdown
# Jarbas Carga PN MVP Runbook

## Local App

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

## Required Env Vars

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
N8N_JARBAS_CARGA_PN_WEBHOOK_URL=
N8N_JARBAS_CALLBACK_SECRET=
```

## Supabase

1. Apply `supabase/migrations/202606250001_jarbas_mvp.sql`.
2. Apply `supabase/seed/202606250001_jarbas_mvp_seed.sql`.
3. Create bucket `jarbas-uploads`.
4. Create a user with e-mail/password.
5. Insert a profile for the user.
6. Link the user to group `solucoes`.

## n8n

1. Open workflow `AfhcrI8P35wY0SV7`.
2. Confirm webhook trigger exists.
3. Confirm SAP B1 and Supabase credentials are configured.
4. Activate workflow after smoke test.

## MVP Test

1. Log in.
2. Confirm Jarbas greets with `profile.display_name` or neutral greeting.
3. Type or speak a Carga PN request.
4. Upload Excel standard file.
5. Confirm execution starts.
6. Confirm progress percent changes.
7. Confirm final summary is visible.
8. Confirm logs and checklist are stored.
```

Priority implantation checks before `hom`:

- Confirm whether `supabase/migrations/202606250001_jarbas_mvp.sql` was already applied in a real Supabase environment.
- If the earlier version was already applied, create a new incremental migration with the Task 2 review fixes: `validate_jarbas_execution_access`, trigger, RLS policies, and convergent seed changes.
- Install or make available `supabase` CLI or `psql` for SQL validation before homologation.
- Restrict user-side updates to execution progress/status before Tasks 5/7/8 if operational writes move to backend/service role/n8n.

- [ ] **Step 2: Update AGENTS project state**

Modify the project state in `AGENTS.md`:

```markdown
## Estado do Projeto
- **Data da parametrizacao inicial**: 2026-06-25
- **Spec aprovada**: `docs/superpowers/specs/2026-06-25-jarbas-carga-pn-mvp-design.md`
- **Plano de implementacao**: `docs/superpowers/plans/2026-06-25-jarbas-carga-pn-mvp.md`
- **Workflow n8n alvo**: `JARBAS - SOLUCOES - CARGA PN EXCEL (#AfhcrI8P35wY0SV7)`
- **Proximo passo sugerido**: executar o plano de implementacao do MVP vertical monitoravel.
```

- [ ] **Step 3: Create implementation memory entry**

Create `memory/history/2026-06-25-jarbas-carga-pn-mvp-plan.md`:

```markdown
# Historico - Plano MVP Jarbas Carga PN

## Data
2026-06-25

## Resumo
Foi aprovado o design e criado o plano de implementacao do primeiro MVP vertical do Jarbas: login real, grupo Solucoes, comunicacao por texto/voz, upload de Excel padrao, Supabase como base operacional e n8n como executor tecnico da Carga PN.

## Arquivos Principais
- `docs/superpowers/specs/2026-06-25-jarbas-carga-pn-mvp-design.md`
- `docs/superpowers/plans/2026-06-25-jarbas-carga-pn-mvp.md`

## Decisoes
- Solucoes e o primeiro grupo operacional.
- A arquitetura suporta Consultoria e Administrativo futuramente.
- Jarbas orquestra e n8n executa.
- O workflow alvo e `AfhcrI8P35wY0SV7`.
- O workflow referencia e `aeXRhoPa7qV4X55X`.
```

- [ ] **Step 4: Run full verification**

Run:

```powershell
npm test
npm run build
```

Expected:

```text
All tests pass.
Next.js build completes.
```

- [ ] **Step 5: Commit**

```powershell
git add docs/runbooks/jarbas-carga-pn-mvp.md AGENTS.md memory/history/2026-06-25-jarbas-carga-pn-mvp-plan.md
git commit -m "docs: add Jarbas MVP runbook and memory"
```

---

## Self-Review

Spec coverage:

- Login real via Supabase Auth: Task 3.
- Group-first architecture with future groups: Task 2 and Task 4.
- Text and voice communication: Task 6.
- Excel upload: Task 5 and Task 7.
- Supabase execution status, logs, checklists, history: Task 2, Task 5, Task 7, Task 9.
- n8n target workflow `AfhcrI8P35wY0SV7`: Task 5 and Task 8.
- n8n reference workflow `aeXRhoPa7qV4X55X`: Task 8.
- Jarbas as orchestrator and n8n as executor: Task 5, Task 7, Task 8.
- Error explanation and monitored progress: Task 7 and Task 8.

Ambiguity scan:

- No unfinished markers, generic validation steps, or unspecified file paths remain.

Type consistency:

- `JarbasAgent`, `ExecutionStatus`, `ExecutionView`, `ExecutionLogView`, and `TriggerCargaPnInput` are defined before use.
- API routes use the same execution IDs and status fields defined in the schema.

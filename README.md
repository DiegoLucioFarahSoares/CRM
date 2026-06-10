# CRM Pro

Sistema profissional de CRM (Customer Relationship Management) para gestão de clientes, negócios, calendário e relatórios.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16.2.6 (App Router, Turbopack) |
| UI | React 19 + Tailwind CSS 4 + shadcn/ui |
| Animações | Framer Motion |
| Gráficos | Recharts |
| Backend / BD | Supabase (PostgreSQL, Auth, RLS) |
| Autenticação | Magic Link (OTP) via Supabase |
| Deploy | Vercel (com Analytics) |

---

## Pré-requisitos

- Node.js 18+
- npm ou pnpm
- Conta no [Supabase](https://supabase.com) com projeto criado
- Supabase CLI instalado (`npm i -g supabase`)

---

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_XXXXXXXXXXXXXXXX
```

> **Onde encontrar:** Supabase Dashboard → Settings → API

---

## Instalação e Build Local

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em desenvolvimento (http://localhost:3000)
npm run dev

# 3. Build de produção
npm run build

# 4. Iniciar servidor de produção
npm run start

# 5. Checar lint
npm run lint
```

---

## Banco de Dados (Supabase)

O projeto usa o Supabase CLI para gerenciar migrações.

### Linkar com o projeto remoto

```bash
supabase link --project-ref SEU_PROJECT_REF
```

### Aplicar migrações no banco remoto

```bash
supabase db push
```

### Migrações incluídas

| Arquivo | Tabela criada |
|---|---|
| `20260522141723_remote_commit.sql` | `clientes`, `negocios` |
| `20260610000000_create_eventos.sql` | `eventos` |
| `20260610120000_create_mensagens.sql` | `mensagens` |

Todas as tabelas têm **RLS (Row Level Security)** habilitado com política `authenticated`.

---

## Estrutura do Projeto

```
c:\CRM Pro\
├── app/
│   ├── auth/callback/route.ts   # Handler PKCE para magic link
│   ├── login/page.tsx           # Página de login com magic link
│   ├── page.tsx                 # Shell principal do CRM (roteamento interno)
│   ├── layout.tsx               # Layout raiz com AuthProvider
│   └── globals.css
├── components/
│   ├── crm/
│   │   ├── header.tsx           # Header: busca, notificações, mensagens, logout
│   │   ├── sidebar.tsx          # Sidebar de navegação
│   │   ├── global-search.tsx    # Busca global (clientes, negócios, eventos)
│   │   ├── notifications-panel.tsx  # Painel de notificações (eventos + negócios)
│   │   ├── messages-panel.tsx   # Painel de mensagens (CRUD Supabase)
│   │   ├── reminders.tsx        # Widget de lembretes do dashboard
│   │   └── pages/
│   │       ├── dashboard-page.tsx
│   │       ├── clientes-page.tsx
│   │       ├── negocios-page.tsx
│   │       ├── calendario-page.tsx
│   │       ├── relatorios-page.tsx
│   │       └── configuracoes-page.tsx
│   └── ui/                      # Componentes shadcn/ui
├── lib/
│   ├── auth-context.tsx         # Context de autenticação (signIn, signOut, user)
│   ├── supabase.ts              # Cliente Supabase (browser)
│   ├── crm-data.ts              # Tipos e helpers do domínio CRM
│   └── utils.ts
├── supabase/
│   ├── config.toml              # Config do projeto Supabase (email template, auth)
│   ├── migrations/              # Migrações SQL
│   └── templates/
│       └── magic_link.html      # Template moderno do e-mail magic link
├── public/
│   └── icon.svg                 # Favicon CRM Pro (gráfico de barras verde)
└── proxy.ts                     # Middleware de autenticação (Next.js 16)
```

---

## Páginas

### Dashboard
Visão geral com métricas principais (total de clientes, negócios, receita), gráfico de receita por mês, funil de negócios, atividades recentes e lembretes do dia.

### Clientes (`/clientes`)
Listagem completa com filtro por status, busca por nome/empresa/email e ordenação. CRUD completo: criar, visualizar, editar e excluir clientes com campos de contato, empresa, valor e status.

### Negócios (`/negocios`)
Kanban de pipeline de vendas com as etapas: Lead → Qualificado → Proposta → Negociação → Fechado/Perdido. Drag & drop entre colunas, filtros por etapa e responsável, valor total por etapa.

### Calendário (`/calendario`)
Agenda com visão mensal e semanal. CRUD de eventos com tipo (reunião, ligação, tarefa, lembrete), horário de início/fim, vínculo opcional com cliente e status de conclusão.

### Relatórios (`/relatorios`)
Gráficos de desempenho: receita por período, conversão por etapa do funil, atividade por tipo, comparativo mensal. Dados calculados em tempo real do Supabase.

### Configurações (`/configuracoes`)
Perfil do usuário, preferências de notificação e tema da interface.

---

## Autenticação

O sistema usa **Magic Link** (passwordless) via Supabase Auth:

1. Usuário informa o e-mail na tela de login
2. Supabase envia um link de acesso seguro por e-mail
3. Ao clicar, o usuário é redirecionado para `/auth/callback`
4. O handler troca o código PKCE por sessão e redireciona para `/`

O template de e-mail moderno está em `supabase/templates/magic_link.html` e foi aplicado via `supabase config push`.

### Middleware de Auth (`proxy.ts`)
Intercepta todas as requisições. Redireciona usuários não autenticados para `/login` e usuários autenticados que acessam `/login` para `/`.

---

## Features do Header

| Feature | Descrição |
|---|---|
| **Busca Global** | `Ctrl+F` abre busca em tempo real em clientes, negócios e eventos |
| **Mensagens** | Inbox com CRUD completo, contador de não lidas, composição inline |
| **Notificações** | Eventos dos próximos 3 dias + negócios vencendo em 7 dias. Read state em localStorage |
| **Logout** | `window.location.href` para garantir reset completo da sessão |

---

## Deploy na Vercel

1. Importe o repositório na Vercel
2. Configure as variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
3. Deploy automático a cada push na `main`

> O `@vercel/analytics` já está integrado e ativo em produção.

---

## Supabase Config Push

Para sincronizar configurações (auth, email templates) com o projeto remoto:

```bash
supabase config push
```

O arquivo `supabase/config.toml` controla:
- URLs de redirect autorizadas
- Configurações de OTP (expiração, tamanho)
- Template de e-mail do magic link

---

## Licença

Proprietário — © 2026 CRM Pro. Todos os direitos reservados.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in a chat interface, Claude generates JSX code via tool calls into a virtual file system, and a live preview renders the result in a sandboxed iframe.

## Commands/

- **Setup:** `npm run setup` (installs deps, generates Prisma client, runs migrations)
- **Dev server:** `npm run dev` (Next.js with Turbopack on port 3000)
- **Build:** `npm run build`
- **Lint:** `npm run lint`
- **Run all tests:** `npx vitest run`
- **Run single test:** `npx vitest run src/components/chat/__tests__/MessageList.test.tsx`
- **Run tests in watch mode:** `npx vitest`
- **Reset database:** `npm run db:reset`
- **Regenerate Prisma client after schema changes:** `npx prisma generate && npx prisma migrate dev`

All npm scripts require `NODE_OPTIONS='--require ./node-compat.cjs'` (already configured in package.json) to patch Node 25+ Web Storage globals that break SSR.

## Architecture

### Request Flow

1. User sends a chat message from the browser
2. `ChatProvider` (React context) calls `/api/chat` via Vercel AI SDK's `useChat`, sending the message history and serialized virtual file system
3. The API route (`src/app/api/chat/route.ts`) streams a response using `streamText` with two tools: `str_replace_editor` and `file_manager`
4. As the model makes tool calls, the server-side `VirtualFileSystem` is mutated; the client-side `FileSystemProvider` mirrors those mutations via `onToolCall`
5. `PreviewFrame` reacts to file system changes, transforms JSX with `@babel/standalone`, builds an import map with blob URLs (third-party deps via esm.sh), and renders everything in a sandboxed iframe

### Key Abstractions

- **VirtualFileSystem** (`src/lib/file-system.ts`): In-memory tree of `FileNode` objects. All file operations (CRUD, rename, serialize/deserialize) go through this class. No files are written to disk. Serialized as JSON for persistence in the Project model.
- **JSX Transformer** (`src/lib/transform/jsx-transformer.ts`): Babel-based pipeline that transforms JSX/TSX to JS, resolves `@/` import aliases, collects CSS imports, creates blob URLs, and builds a browser-compatible import map. Third-party packages are resolved via `https://esm.sh/`.
- **MockLanguageModel** (`src/lib/provider.ts`): When no `ANTHROPIC_API_KEY` is set, a mock `LanguageModelV1` implementation returns static component code so the app is functional without API access.

### AI Tools

The model has two tools available during generation:

- **`str_replace_editor`** (`src/lib/tools/str-replace.ts`): view, create, str_replace, insert operations on virtual files
- **`file_manager`** (`src/lib/tools/file-manager.ts`): rename and delete operations

The system prompt (`src/lib/prompts/generation.tsx`) instructs the model to always create a root `/App.jsx` as the entry point, use Tailwind CSS for styling, and use `@/` import aliases for local files.

### Data Model

SQLite via Prisma (`prisma/schema.prisma`). Two models:
- **User**: email/password auth with bcrypt
- **Project**: belongs to User; stores `messages` (JSON array) and `data` (serialized VirtualFileSystem) as text columns

### Auth

JWT-based sessions stored in httpOnly cookies (`src/lib/auth.ts`). Server actions in `src/actions/index.ts` handle signUp/signIn/signOut. Anonymous users can use the app without persistence. Middleware protects `/api/projects` and `/api/filesystem` routes.

### Client State

Two React contexts wrap the main content:
- **FileSystemProvider** (`src/lib/contexts/file-system-context.tsx`): owns the client-side VirtualFileSystem instance, handles tool call side effects
- **ChatProvider** (`src/lib/contexts/chat-context.tsx`): wraps Vercel AI SDK's `useChat`, sends serialized files with each request

### UI Components

- `src/components/ui/` - shadcn/ui components (new-york style, Radix primitives)
- `src/components/chat/` - chat interface (message list, input, markdown rendering)
- `src/components/editor/` - Monaco-based code editor and file tree
- `src/components/preview/` - iframe-based live preview
- `src/components/auth/` - sign in/up dialog and forms

### Path Aliases

`@/*` maps to `./src/*` (configured in tsconfig.json). Tests use vitest with `vite-tsconfig-paths` to resolve the same aliases.

## Tech Stack

- Next.js 15 (App Router, Turbopack) / React 19 / TypeScript
- Tailwind CSS v4 (PostCSS plugin, not the CLI)
- Prisma with SQLite
- Vercel AI SDK (`ai` + `@ai-sdk/anthropic`)
- shadcn/ui (new-york style) with Radix primitives
- Monaco Editor (`@monaco-editor/react`)
- Vitest + Testing Library + jsdom for tests

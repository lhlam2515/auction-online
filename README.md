# Auction Online (monorepo)

Short instructions to get this repository running locally (Windows / PowerShell).

## Prerequisites

- Node.js (LTS recommended, e.g. 18.x or later)
- pnpm (this repo uses pnpm workspaces; packageManager: `pnpm@9.0.0`)
- Git

You can enable/install pnpm via Corepack (bundled with recent Node versions):

```powershell
corepack enable
corepack prepare pnpm@9.0.0 --activate
```

Or install pnpm globally:

```powershell
# optional
npm install -g pnpm
```

## Install dependencies

From the repository root:

```powershell
pnpm install
```

This installs dependencies for the workspace (root + packages/apps).

## Run in development

This monorepo uses Turbo (turbo) to orchestrate tasks across packages. The root `package.json` includes a `dev` script that runs `turbo run dev`. Use the root dev command to start all apps that expose a `dev` script:

```powershell
pnpm dev
```

If you want to run a single app directly, `cd` into the app and run its dev script. Example:

```powershell
cd apps/backend
pnpm install   # only needed if you didn't rely on root install
pnpm dev

# in a separate terminal
cd ..\frontend
pnpm install
pnpm dev
```

## Build for production

From repo root (runs `turbo run build`):

```powershell
pnpm build
```

## Notes & Troubleshooting

- If a `pnpm` command fails, ensure `pnpm` is on your PATH and matches the required version (see `package.json` root `packageManager`).
- The dev orchestration relies on each app exposing a `dev` script in its own `package.json`. If `pnpm dev` at root doesn't start a particular app, check `apps/<name>/package.json` for the `dev` script.
- If ports conflict, stop the process using the port or change the app's port via environment variables (check each app's README or `config/`).

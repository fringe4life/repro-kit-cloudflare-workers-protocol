# Repro: `cloudflare:workers` left in SSR output ([sveltejs/kit#17271](https://github.com/sveltejs/kit/issues/17271))

Minimal SvelteKit 3 + `@sveltejs/adapter-cloudflare` 8 + Vite 8/Rolldown.

**Do not use `vite preview`** for Cloudflare builds (maintainer note on the issue).

## Versions

| Package | Version |
| --- | --- |
| `@sveltejs/kit` | `3.0.0-next.31` |
| `@sveltejs/adapter-cloudflare` | `8.0.0-next.8` |
| `vite` | `8.3.1` |
| `svelte` | `5.57.1` |
| `@sveltejs/vite-plugin-svelte` | `7.3.1` |
| `wrangler` | `4.142.0` |

## Setup

```bash
bun install
```

## Reproduce

```bash
bun run build
```

`vite build` may **succeed**. That is enough — the bug is leftover protocol imports in SSR output after `adapt()`.

### Evidence (verified)

After a successful build:

```bash
rg -n 'from ["'\'']cloudflare:workers["'\'']' .svelte-kit/output/server --glob '*.js'
```

Expected hit:

```text
.svelte-kit/output/server/entries/pages/_page.server.ts.js:1:import { env } from "cloudflare:workers";
```

Prove Node cannot load that SSR chunk:

```bash
node --input-type=module -e \
  "import('./.svelte-kit/output/server/entries/pages/_page.server.ts.js')"
```

Expected failure:

```text
Error [ERR_UNSUPPORTED_ESM_URL_SCHEME]: Only URLs with a scheme in: file, data, and node are supported by the default ESM loader. Received protocol 'cloudflare:'
```

### What happens

1. During the Vite SSR build, `@sveltejs/adapter-cloudflare` rewrites `cloudflare:workers` → a Node `file://…/virtual-cloudflare-workers.js?<uuid>` stub so prerender can load modules under Node.
2. After prerender, `adapt()` runs `replace_stub()` on `builder.getServerDirectory()` and restores bare `cloudflare:workers` in `.svelte-kit/output/server/**/*.js` (for the Worker artifact).
3. That restored protocol import is unloadable under Node/Bun — so any later Node-side load of the SSR output fails.

### Optional: prerender access failure

If a prerendered `load` **touches** `env` properties (e.g. `Object.keys(env)`), build fails earlier with the adapter stub error:

```text
Error: Cannot access cloudflare:workers in a prerenderable route
```

This repro intentionally only **imports** `env` (no property access) so `adapt()` finishes and leaves the protocol in SSR output.

## App shape

- `src/lib/server/cf-env.ts` — `import { env } from 'cloudflare:workers'`
- `src/routes/+page.server.ts` — imports that module, `prerender = true`
- **No** local Vite workaround plugin

## Related

- https://github.com/sveltejs/kit/issues/17271
- https://github.com/sveltejs/kit/pull/16754 (`platform` → `cloudflare:workers`)
- https://github.com/sveltejs/kit/issues/16966 (closed; analysis-before-SSR direction)

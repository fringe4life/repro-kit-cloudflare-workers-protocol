import { env } from 'cloudflare:workers';

/**
 * Re-export so the `cloudflare:workers` import stays in the SSR graph.
 * Do not touch `env` properties from prerenderable loads — the adapter stub
 * throws on property access during prerender.
 */
export { env };

/** Runtime helper (call only outside prerender / under workerd). */
export function readEnvBindingNames(): string[] {
	return Object.keys(env as object).sort();
}

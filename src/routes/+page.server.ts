import { env } from '#lib/server/cf-env';

export const prerender = true;

export function load() {
	// Keep the module (and thus the protocol import) in the SSR graph without
	// touching Cloudflare bindings — property access on the adapter stub throws
	// during prerender ("Cannot access cloudflare:workers in a prerenderable route").
	return {
		imported: typeof env === 'object'
	};
}

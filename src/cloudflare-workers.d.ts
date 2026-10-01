declare namespace Cloudflare {
	interface Env {
		// Minimal Env so `import { env } from 'cloudflare:workers'` typechecks.
		// No real bindings required to reproduce the leftover protocol import.
	}
}

declare module 'cloudflare:workers' {
	export const env: Cloudflare.Env;
	export function waitUntil(promise: Promise<unknown>): void;
}

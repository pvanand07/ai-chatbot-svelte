import { getContext, setContext } from 'svelte';
import { browser } from '$app/environment';

export class Box<T> {
	value = $state<T>() as T;

	constructor(value: T) {
		this.value = value;
	}
}

/**
 * For CSR, we use localStorage instead of synchronized cookies
 */
export class SynchronizedCookie {
	#contextKey: symbol;
	#key: string;
	#value = $state<string>()!;

	constructor(key: string, value: string) {
		this.#key = key;
		// In CSR, get initial value from localStorage if available
		if (browser) {
			const stored = localStorage.getItem(key);
			this.#value = stored || value;
		} else {
			this.#value = value;
		}
		this.#contextKey = Symbol.for(`SynchronizedCookie:${key}`);
	}

	get key() {
		return this.#key;
	}

	get value() {
		return this.#value;
	}

	set value(v: string) {
		// Store in localStorage for CSR
		if (browser) {
			localStorage.setItem(this.#key, v);
			// Also sync with server for persistence across sessions
			fetch(`/api/synchronized-cookie/${this.#key}`, {
				method: 'POST',
				body: JSON.stringify({ value: v }),
				headers: {
					'Content-Type': 'application/json'
				}
			}).catch(console.error);
		}
		this.#value = v;
	}

	setContext() {
		setContext(this.#contextKey, this);
	}

	static fromContext(key: string): SynchronizedCookie {
		if (!browser) {
			// Return a default instance for SSR
			return new SynchronizedCookie(key, '');
		}
		return getContext(Symbol.for(`SynchronizedCookie:${key}`));
	}
}

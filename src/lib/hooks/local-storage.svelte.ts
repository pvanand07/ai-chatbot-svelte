import { on } from 'svelte/events';
import { createSubscriber } from 'svelte/reactivity';
import { browser } from '$app/environment';

export class LocalStorage<T> {
	#key: string;
	#defaultValue: T;
	#subscribe: () => void;

	constructor(key: string, defaultValue: T) {
		this.#key = key;
		this.#defaultValue = defaultValue;

		if (browser) {
			this.#subscribe = createSubscriber((update) => {
				const off = on(window, 'storage', (event) => {
					if (event.key === this.#key) {
						update();
					}
				});

				return off;
			});
		} else {
			this.#subscribe = () => {};
		}
	}

	get value() {
		if (!browser) return this.#defaultValue;
		
		this.#subscribe();
		const storedValue = localStorage.getItem(this.#key);
		return storedValue === null ? this.#defaultValue : JSON.parse(storedValue);
	}

	set value(v: T) {
		if (!browser) return;
		localStorage.setItem(this.#key, JSON.stringify(v));
	}

	delete() {
		if (!browser) return;
		localStorage.removeItem(this.#key);
	}
}

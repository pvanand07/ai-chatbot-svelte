import { SynchronizedCookie } from '$lib/utils/reactivity.svelte';
import { browser } from '$app/environment';

export class SelectedModel extends SynchronizedCookie {
	constructor(value: string) {
		super('selected-model', value);
	}

	static fromContext(): SelectedModel {
		if (!browser) {
			// Return a default instance for SSR
			return new SelectedModel('chat-model');
		}
		return super.fromContext('selected-model');
	}
}

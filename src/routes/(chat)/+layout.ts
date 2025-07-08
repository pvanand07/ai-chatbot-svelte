import { browser } from '$app/environment';
import { chatModels, DEFAULT_CHAT_MODEL } from '$lib/ai/models';
import { SelectedModel } from '$lib/hooks/selected-model.svelte.js';
import type { Chat } from '$lib/server/db/schema.js';

export async function load({ fetch }) {
	// Only run on client-side
	if (!browser) {
		return {
			chats: Promise.resolve([]),
			user: null,
			sidebarCollapsed: true,
			selectedChatModel: new SelectedModel(DEFAULT_CHAT_MODEL)
		};
	}

	// Get user from client-side API call
	let user = null;
	try {
		const userResponse = await fetch('/api/user');
		if (userResponse.ok) {
			user = await userResponse.json();
		}
	} catch (error) {
		console.error('Failed to fetch user:', error);
	}

	// Handle sidebar state from localStorage
	const sidebarCollapsed = localStorage.getItem('sidebar:state') !== 'true';

	// Handle model selection from localStorage
	let modelId = DEFAULT_CHAT_MODEL;
	const storedModel = localStorage.getItem('selected-model');
	if (storedModel && chatModels.find((model) => model.id === storedModel)) {
		modelId = storedModel;
	}

	let chats = Promise.resolve<Chat[]>([]);
	if (user) {
		chats = fetch('/api/history').then((res) => res.ok ? res.json() : []);
	}

	return {
		chats,
		user,
		sidebarCollapsed,
		selectedChatModel: new SelectedModel(modelId)
	};
}

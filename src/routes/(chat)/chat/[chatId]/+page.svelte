<script lang="ts">
	import Chat from '$lib/components/chat.svelte';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { convertToUIMessages } from '$lib/utils/chat';
	import type { Chat as DbChat, Message } from '$lib/server/db/schema';

	let chat = $state<DbChat | null>(null);
	let messages = $state<Message[]>([]);
	let user = $state(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			// Get user info
			const userResponse = await fetch('/api/user');
			if (userResponse.ok) {
				user = await userResponse.json();
			}

			// Get chat data
			const chatResponse = await fetch(`/api/chat/${page.params.chatId}`);
			if (!chatResponse.ok) {
				if (chatResponse.status === 404) {
					goto('/');
					return;
				}
				throw new Error('Failed to load chat');
			}

			const chatData = await chatResponse.json();
			chat = chatData.chat;
			messages = chatData.messages;
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
		} finally {
			loading = false;
		}
	});
</script>

{#if loading}
	<div class="flex h-dvh items-center justify-center">
		<p>Loading chat...</p>
	</div>
{:else if error}
	<div class="flex h-dvh items-center justify-center">
		<p class="text-red-500">Error: {error}</p>
	</div>
{:else if chat}
	<Chat
		{chat}
		initialMessages={convertToUIMessages(messages)}
		readonly={user?.id !== chat.userId}
		{user}
	/>
{/if}

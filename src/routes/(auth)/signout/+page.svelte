<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	onMount(async () => {
		try {
			await fetch('/api/auth/signout', {
				method: 'POST'
			});
			toast.success('Successfully signed out');
		} catch (error) {
			console.error('Signout error:', error);
		} finally {
			goto('/signin');
		}
	});
</script>

<div class="flex h-dvh items-center justify-center">
	<p>Signing out...</p>
</div>
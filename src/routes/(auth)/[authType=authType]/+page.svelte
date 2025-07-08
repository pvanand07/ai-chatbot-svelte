<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);

	const signInSignUp = $derived(page.params.authType === 'signup' ? 'Sign up' : 'Sign in');

	async function handleSubmit(event: Event) {
		event.preventDefault();
		loading = true;

		try {
			const response = await fetch(`/api/auth/${page.params.authType}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password })
			});

			const result = await response.json();

			if (response.ok) {
				toast.success(`Successfully ${page.params.authType === 'signup' ? 'signed up' : 'signed in'}!`);
				goto('/');
			} else {
				toast.error(result.message || 'Authentication failed');
			}
		} catch (error) {
			toast.error('Network error. Please try again.');
		} finally {
			loading = false;
		}
	}
</script>

<div
	class="bg-background flex h-dvh w-screen items-start justify-center pt-12 md:items-center md:pt-0"
>
	<div class="flex w-full max-w-md flex-col gap-12 overflow-hidden rounded-2xl">
		<div class="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
			<h3 class="text-xl font-semibold dark:text-zinc-50">{signInSignUp}</h3>
			<p class="text-sm text-gray-500 dark:text-zinc-400">
				Use your email and password to {signInSignUp.toLowerCase()}
			</p>
		</div>
		
		<form onsubmit={handleSubmit} class="flex flex-col gap-4 px-4 sm:px-16">
			<div class="flex flex-col gap-2">
				<Label for="email" class="text-zinc-600 dark:text-zinc-400">Email Address</Label>
				<Input
					id="email"
					name="email"
					class="text-md bg-muted md:text-sm"
					type="email"
					placeholder="user@acme.com"
					autocomplete="email"
					required
					autofocus
					bind:value={email}
				/>
			</div>

			<div class="flex flex-col gap-2">
				<Label for="password" class="text-zinc-600 dark:text-zinc-400">Password</Label>
				<Input
					id="password"
					name="password"
					class="text-md bg-muted md:text-sm"
					type="password"
					required
					bind:value={password}
				/>
			</div>

			<Button type="submit" disabled={loading} class="relative">
				{signInSignUp}
				{#if loading}
					<span class="absolute right-4">Loading...</span>
				{/if}
			</Button>

			{#if page.params.authType === 'signup'}
				{@render switchAuthType({
					question: 'Already have an account? ',
					href: '/signin',
					cta: 'Sign in',
					postscript: ' instead.'
				})}
			{:else}
				{@render switchAuthType({
					question: "Don't have an account? ",
					href: '/signup',
					cta: 'Sign up',
					postscript: ' for free.'
				})}
			{/if}
		</form>
	</div>
</div>

{#snippet switchAuthType({
	question,
	href,
	cta,
	postscript
}: {
	question: string;
	href: string;
	cta: string;
	postscript: string;
})}
	<p class="mt-4 text-center text-sm text-gray-600 dark:text-zinc-400">
		{question}
		<a {href} class="font-semibold text-gray-800 hover:underline dark:text-zinc-200">
			{cta}
		</a>
		{postscript}
	</p>
{/snippet}

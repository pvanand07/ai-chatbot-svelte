import { BREAKPOINTS } from '$lib/utils/constants';
import { MediaQuery } from 'svelte/reactivity';
import { browser } from '$app/environment';

export class IsMobile extends MediaQuery {
	constructor() {
		// Only initialize MediaQuery on client-side
		super(browser ? `max-width: ${BREAKPOINTS.md.value - 1}${BREAKPOINTS.md.unit}` : '(max-width: 767px)');
	}
}

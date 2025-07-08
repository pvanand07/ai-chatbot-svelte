import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/auth/index.js';

export async function POST({ locals, cookies }) {
	if (locals.session) {
		await invalidateSession(locals.session.id);
	}
	deleteSessionTokenCookie(cookies);
	
	return Response.json({ success: true });
}
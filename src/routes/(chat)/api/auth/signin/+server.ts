import {
	createSession,
	generateSessionToken,
	setSessionTokenCookie
} from '$lib/server/auth/index.js';
import { getAuthUser } from '$lib/server/db/queries.js';
import { error } from '@sveltejs/kit';
import { compare } from 'bcrypt-ts';
import { z } from 'zod';

const schema = z.object({
	email: z.string().email(),
	password: z.string().min(8)
});

export async function POST({ request, cookies }) {
	try {
		const body = await request.json();
		const { email, password } = schema.parse(body);

		const userResult = await getAuthUser(email);
		if (userResult.isErr()) {
			return Response.json({ message: 'Invalid credentials' }, { status: 400 });
		}

		const user = userResult.value;
		const passwordIsCorrect = await compare(password, user.password);
		if (!passwordIsCorrect) {
			return Response.json({ message: 'Invalid credentials' }, { status: 400 });
		}

		const token = generateSessionToken();
		const sessionResult = await createSession(token, user.id);
		
		if (sessionResult.isErr()) {
			return Response.json({ message: 'Failed to create session' }, { status: 500 });
		}

		setSessionTokenCookie(cookies, token, sessionResult.value.expiresAt);
		
		return Response.json({ success: true });
	} catch (err) {
		if (err instanceof z.ZodError) {
			return Response.json({ message: 'Invalid input' }, { status: 400 });
		}
		return Response.json({ message: 'Internal server error' }, { status: 500 });
	}
}
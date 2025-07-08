export async function GET({ locals }) {
	if (!locals.user) {
		return Response.json(null, { status: 401 });
	}
	
	return Response.json(locals.user);
}
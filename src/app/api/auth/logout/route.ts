/** Phase D — `204`; stateless JWT; client clears `quizmaker_auth_token` (`docs/sprint-1/prd-auth-contract-env.mdc` §2.4). */
export async function POST() {
	return new Response(null, { status: 204 });
}

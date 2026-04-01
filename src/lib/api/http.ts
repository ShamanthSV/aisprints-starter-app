import type { ApiErrorBody, ErrorCode } from "@/lib/auth-contract";

export function jsonError(status: number, code: ErrorCode, message: string): Response {
	const body: ApiErrorBody = { error: { code, message } };
	return Response.json(body, { status });
}

export async function readJson(request: Request): Promise<unknown | null> {
	try {
		return await request.json();
	} catch {
		return null;
	}
}

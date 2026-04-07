import { NextResponse } from "next/server";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function withPublicCorsHeaders(
  res: NextResponse
): NextResponse {
  for (const [k, v] of Object.entries(CORS_HEADERS)) {
    res.headers.set(k, v);
  }
  return res;
}

export function publicJson(data: unknown, status = 200) {
  return withPublicCorsHeaders(NextResponse.json(data, { status }));
}

export function publicOptions() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

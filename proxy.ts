import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  EDITOR_COOKIE_NAME,
  isValidEditorSessionToken,
  isValidSessionToken,
} from "@/lib/auth-token";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (await isValidSessionToken(token)) return NextResponse.next();

  const liveMatch = request.nextUrl.pathname.match(/^\/admin\/jogos\/([^/]+)\/ao-vivo\/?$/);
  if (liveMatch) {
    const gameId = decodeURIComponent(liveMatch[1]);
    const editorToken = request.cookies.get(EDITOR_COOKIE_NAME)?.value;
    if (await isValidEditorSessionToken(editorToken, gameId)) return NextResponse.next();

    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("gameId", gameId);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*"],
};

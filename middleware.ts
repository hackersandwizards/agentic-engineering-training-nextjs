import { NextResponse, type NextRequest } from "next/server";

const AUTH_PAGES = ["/login", "/signup"];

// Gate pages on the presence of the auth cookie. Token validity is enforced at
// the data layer (getCurrentUser); this only handles redirects. API routes are
// excluded from the matcher so external Bearer-token clients are unaffected.
export function middleware(request: NextRequest) {
  const hasToken = Boolean(request.cookies.get("access_token")?.value);
  const { pathname } = request.nextUrl;
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (!hasToken && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (hasToken && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

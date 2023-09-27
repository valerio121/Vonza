import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = new URL(req.nextUrl);

  if (process.env.VERCEL_ENV != "production" && !url.searchParams.has("host")) {
    url.searchParams.set("host", "app");
    return NextResponse.redirect(url);
  }

  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  const subdomain = url.searchParams.get("host") ?? req.headers.get("host")!;

  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const path = url.pathname;

  // rewrites for app pages
  if (subdomain == "app") {
    const session = await getToken({ req });
    if (!session && path !== "/login") {
      return NextResponse.redirect(new URL("/login", req.url));
    } else if (session && path == "/login") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return rewrite(`/app${path === "/" ? "" : path}`, req);
  }
  
  // rewrite root application to `/home` folder
  if (subdomain === "" || subdomain === "www") {
    return rewrite(`/home${path}`, req);
  }

  // rewrite everything else to `/[domain]/[path] dynamic route
  return rewrite(`/${subdomain}${path}`, req);
}

const rewrite = (url: string, req: NextRequest) => {
  const rewrite = new URL(url, req.url);
  const res = NextResponse.rewrite(rewrite);
  res.headers.set("x-rewrite", rewrite.toString());
  return res;
};

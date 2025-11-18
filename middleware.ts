import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Check if onboarding is completed
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("onboarding_completed, is_admin")
      .eq("id", user.id)
      .single();

    // If profile doesn't exist or onboarding not completed, redirect to onboarding
    if (error || !profile || !profile.onboarding_completed) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    // If user is admin, redirect to admin portal
    if (profile.is_admin === true) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Check onboarding and admin status
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("onboarding_completed, is_admin")
      .eq("id", user.id)
      .single();

    // If profile doesn't exist or onboarding not completed, redirect to onboarding
    if (error || !profile || !profile.onboarding_completed) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    // Only allow access if is_admin is explicitly true
    // If null, undefined, or false, redirect to dashboard
    if (profile.is_admin !== true) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    // If we get here, user is admin - allow access
  }

  // Allow access to onboarding page for authenticated users
  if (request.nextUrl.pathname === "/onboarding") {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // If onboarding is already completed, check admin status and redirect accordingly
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed, is_admin")
      .eq("id", user.id)
      .single();

    if (profile && profile.onboarding_completed) {
      const url = request.nextUrl.clone();
      url.pathname = profile.is_admin === true ? "/admin" : "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from login page (but not if they need onboarding)
  if (request.nextUrl.pathname === "/login" && user) {
    // Check onboarding and admin status
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed, is_admin")
      .eq("id", user.id)
      .single();

    const url = request.nextUrl.clone();
    if (!profile || !profile.onboarding_completed) {
      url.pathname = "/onboarding";
    } else {
      url.pathname = profile.is_admin === true ? "/admin" : "/dashboard";
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};


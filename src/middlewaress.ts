import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // আপনার বিদ্যমান middleware-এর লজিক এখানে অপরিবর্তিত থাকবে
  // ... (আপনার সম্পূর্ণ middleware কোড) ...
  let response = NextResponse.next({ request: { headers: request.headers } });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );
  await supabase.auth.getUser();
  return response;
}

// ==========================================================
// ===== মূল পরিবর্তনটি এখানে: matcher কনফিগারেশন =====
// ==========================================================
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /auth (Supabase-এর auth সম্পর্কিত সমস্ত রুট, যেমন /auth/callback)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth).*)',
  ],
}
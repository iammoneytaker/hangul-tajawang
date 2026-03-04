import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {}
        },
      },
    }
  )

  // [핵심] 이미 세션이 있는지 먼저 확인 (중복 호출 대응)
  // 이 로직이 있으면 두 번째 호출에서 에러 페이지로 가지 않습니다.
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    return NextResponse.redirect(new URL(next, request.url))
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // 진짜 실패한 경우에만 에러 페이지행
  return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
}

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
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

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // [핵심] 현재 요청이 들어온 도메인(origin)을 그대로 사용하여 리다이렉트
      // 이렇게 해야 www 도메인에서 온 사람은 www로, 아닌 사람은 아닌 곳으로 정확히 돌아갑니다.
      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    }
  }

  // 진짜 실패한 경우
  return NextResponse.redirect(`${requestUrl.origin}/auth/auth-code-error`)
}

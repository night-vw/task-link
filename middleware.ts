import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  const url = request.nextUrl.clone();
  
  // 静的ファイルやスタイルシートのリクエストをスキップ
  const PUBLIC_FILE = /\.(.*)$/;
  if (PUBLIC_FILE.test(url.pathname)) {
    return NextResponse.next();
  }
  
  // リダイレクト対象外のパスを指定
  const EXCLUDED_PATHS = ['/landing', '/create-account', '/login','password-reset'];
  if (!session && !EXCLUDED_PATHS.includes(url.pathname)) {
    url.pathname = '/landing';
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/((?!landing|create-account|login|password-reset|_next/static|_next/image|favicon.ico).*)',
};

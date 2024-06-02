"use client"
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

const SignUpPage = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // エラーメッセージ用のステート

  const onCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null); // エラーメッセージをクリア

      if (!email || !password) {
          setError('メールアドレスとパスワードを入力してください。');
          return;
      }

      try {
          setLoading(true);
          const { error: signUpError } = await supabase.auth.signUp({
              email: email,
              password: password,
          });
          if (signUpError) {
              // Supabaseのエラーメッセージを日本語に翻訳
              switch (signUpError.message) {
                  case 'Invalid email or password':
                      setError('無効なメールアドレスまたはパスワードです。');
                      break;
                  case 'User already registered':
                      setError('このメールアドレスは既に登録されています。');
                      break;
                  case 'Password should be at least 6 characters.':
                      setError('パスワードは少なくとも6文字以上にしてください。');
                      break;
                  default:
                      setError('アカウント作成中にエラーが発生しました。');
              }
              throw signUpError;
          }
          
          router.push("/");
          router.refresh();
      } catch (error: any) {
          console.error('アカウント作成エラー:', error);
          if (!error.message) {
              setError('エラーが発生しました。詳細: ' + error.message); // エラーメッセージを設定
          }
          setLoading(false);
      }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 w-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">Task-Link アカウント作成</h2>
        <form className="space-y-4" onSubmit={onCreate}>
        {error && <div className="text-red-500 mb-4">{error}</div>} {/* エラーメッセージの表示 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={password}
              onChange={e => {setPassword(e.target.value)}}
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              {loading ? 'アカウント作成中...' : 'アカウント作成'}
            </button>
          </div>
        </form>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            すでにアカウントをお持ちの場合は、
            <br />
            <Link href="/login" className="text-indigo-600 hover:text-indigo-500">
              ログインしてください
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;

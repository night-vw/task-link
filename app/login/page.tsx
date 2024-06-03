"use client"
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

const LoginPage = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // エラーメッセージ用のステート

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // エラーメッセージをクリア

    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください。');
      return;
    }

    try {
      setLoading(true);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (signInError) {
        // Supabaseのエラーメッセージを日本語に翻訳
        switch (signInError.message) {
          case 'Invalid login credentials':
            setError('無効なログイン情報です。');
            break;
          case 'Email not confirmed':
            setError('メールアドレスが確認されていません。');
            break;
          default:
            setError('ログイン中にエラーが発生しました。');
        }
        throw signInError;
      }
      await router.push("/");
      await router.refresh();
    } catch (error: any) {
      console.error('ログインエラー:', error);
      if (!error.message) {
        setError('エラーが発生しました。詳細: ' + error.message); // エラーメッセージを設定
      }
      setLoading(false);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 w-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">Task-Link ログイン</h2>
        <form className="space-y-4" onSubmit={onLogin}>
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
              autoComplete="current-password"
              required
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              className={`w-full px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </div>
        </form>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Task-Link を初めてご利用の場合は、
            <br />
            <Link href="/create-account"className="text-indigo-600 hover:text-indigo-500">
              アカウントを作成してください
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

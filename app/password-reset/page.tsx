"use client";
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import crypto from 'crypto';

const ForgotPasswordPage = () => {
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const encrypt = (text: string) => {
    const algorithm = 'aes-256-cbc';
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return `${iv.toString('hex')}:${encrypted.toString('hex')}:${key.toString('hex')}`;
  };

  const onSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError('メールアドレスを入力してください。');
      return;
    }

    try {
      setLoading(true);

      // リセットURLの末尾を暗号化
      const encryptedEmail = encrypt(email);

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/password-reset/reset-form?token=${encryptedEmail}`,
      });
      if (resetError) throw resetError;

      console.log('パスワードリセットリンクを送信しました:', email);
      setSuccess('パスワードリセットリンクを送信しました。\nメールを確認してください。');

    } catch (error: any) {
      console.error('パスワードリセットエラー:', error);
      setError('エラーが発生しました。詳細: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 w-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">パスワードリセット</h2>
        <form className="space-y-4" onSubmit={onSendResetLink}>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {success && (
            <div className="flex justify-center items-center text-green-500 mb-4 whitespace-pre-line text-center">
              {success}
            </div>
          )}
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
            <button
              type="submit"
              className={`w-full px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? '送信中...' : 'リセットリンクを送信'}
            </button>
          </div>
        </form>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            <Link href="/login" className="text-indigo-600 hover:text-indigo-500">
              ログインページに戻る
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

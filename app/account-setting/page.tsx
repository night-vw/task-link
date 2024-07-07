"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PasswordResetPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showModal, setShowModal] = useState(false); // モーダル表示の状態管理
  const [isLoading, setIsLoading] = useState(true); // ローディング状態の管理
  const [userEmail, setUserEmail] = useState(''); // ユーザのメール情報を管理

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsGoogleAuth(user.app_metadata.provider === 'google');
        setUserEmail(user.email!); // ユーザのメール情報を設定
      }
      setIsLoading(false); // ローディング終了
    };
    fetchUser();
  }, [supabase]);

  const handlePasswordChange = async (e: any) => {
    e.preventDefault();
    setErrorMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMessage('新しいパスワードと確認用パスワードが一致しません。');
      return;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setErrorMessage('ユーザー情報の取得中にエラーが発生しました。');
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      });

      if (signInError) {
        setErrorMessage('現在のパスワードが正しくありません。');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setErrorMessage('パスワードの更新中にエラーが発生しました。');
      } else {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        toast.success('パスワードが変更されました', {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          className: 'text-base font-black',
        });
      }
    } catch (error) {
      setErrorMessage('パスワードの更新中にエラーが発生しました。');
    }
  };

  const handleDeleteAccount = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage('ユーザー情報の取得中にエラーが発生しました。');
      return;
    }

    try {
      const response = await fetch('/api/deleteUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        await supabase.auth.signOut();
        router.push('/landing');
        toast.success('アカウントが削除されました', {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          className: 'text-base font-black',
        });
      } else {
        const data = await response.json();
        setErrorMessage(data.error || 'アカウントの削除中にエラーが発生しました。');
      }
    } catch (error) {
      setErrorMessage('アカウントの削除中にエラーが発生しました。');
    }
  };

  const confirmDeleteAccount = () => {
    setShowModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-2xl">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-zinc-600">アカウント情報を取得中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
      <div className="text-center text-gray-700 mb-4">
          <p>{userEmail}</p>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center">パスワードの変更</h2>

        {isGoogleAuth ? (
          <div className="text-center text-red-500">
            Google認証ではパスワードの変更はできません。
          </div>
        ) : (
          <form onSubmit={handlePasswordChange}>
            <div className="mb-4">
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">現在のパスワード</label>
              <div className="relative mt-1">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="current-password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">新しいパスワード</label>
              <input
                type="password"
                id="new-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">パスワードの確認</label>
              <div className="relative mt-1">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirm-password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                </button>
              </div>
            </div>
            {errorMessage && (
              <div className="text-red-500 text-center mb-4">
                {errorMessage}
              </div>
            )}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                パスワードを変更
              </button>
            </div>
          </form>
        )}
        <ToastContainer />
        <div className="mt-6">
          <button
            onClick={confirmDeleteAccount}
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            アカウントを削除
          </button>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 md:pl-64">
          <div className="bg-white rounded-lg p-8 shadow-lg text-center">
            <h2 className="text-xl sm:text-2xl md:text-xl lg:text-2xl font-bold mb-4">削除確認</h2>
            <p className="text-lg sm:text-xl md:text-lg lg:text-xl mb-8">本当にアカウントを削除しますか？</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                閉じる
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordResetPage;

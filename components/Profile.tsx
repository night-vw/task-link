"use client";
import { useState } from "react";
import { FiEdit, FiUser, FiCamera } from "react-icons/fi";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const Profile = () => {
  const supabase = createClientComponentClient();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [icon, setIcon] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIcon(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (icon) {
      try {
        setUploading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("ユーザーが認証されていません");

        const fileName = `${user.id}/${icon.name}`;
        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(fileName, icon);

        if (uploadError) throw uploadError;

        // プライベートストレージ用に署名付きURLを生成
        const { data: signedUrlData, error: signedUrlError } = await supabase
          .storage
          .from('profile-images')
          .createSignedUrl(fileName, 60 * 60 * 24); // 24時間有効な署名付きURL

        if (signedUrlError) throw signedUrlError;

        const publicUrl = signedUrlData.signedUrl;

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id);

        if (updateError) throw updateError;

        console.log("プロフィール画像がアップロードされました:", publicUrl);
      } catch (error) {
        
      } finally {
        setUploading(false);
      }
    }

    // 他のデータをサーバーに送信するロジックをここに追加します
    console.log({ name, username, icon });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">プロフィールを編集</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">アイコン</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="icon-upload"
                onChange={handleIconChange}
              />
              <label
                htmlFor="icon-upload"
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring focus:border-blue-300"
              >
                <FiCamera className="text-gray-400 mr-2" />
                {icon ? icon.name : "アイコンを選択"}
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">ユーザ名</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ユーザ名を入力"
              />
            </div>
          </div>
          <div className="text-center">
            <button
              type="submit"
              className="w-full bg-indigo-500 text-white py-2 px-4 rounded-lg shadow hover:bg-indigo-600 transition duration-300"
              disabled={uploading}
            >
              {uploading ? "アップロード中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;

"use client";

import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const DeleteProfileImage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: userError } = await supabase.auth.getUser();
      if (userError || !data.user) {
        throw new Error('User not authenticated');
      }

      const userId = data.user.id;
      const filePath = `public/${userId}/profile.jpg`;

      console.log(`Attempting to delete file at path: ${filePath}`);

      const { error: deleteError } = await supabase
        .storage
        .from('profile-images')
        .remove([filePath]);

      if (deleteError) {
        console.error('Error deleting file:', deleteError);
        throw deleteError;
      }

      alert('Profile image deleted successfully');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleDelete}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400"
        disabled={loading}
      >
        {loading ? 'Deleting...' : 'Delete Profile Image'}
      </button>
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  );
};

export default DeleteProfileImage;

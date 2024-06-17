"use client"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FiLogOut } from "react-icons/fi";
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';


const LogoutButton = () => {
    const router = useRouter();
    const supabase = createClientComponentClient();
    const [loading, setLoading] = useState(false);

    const Logout = async () => {
        try {
            setLoading(true);
            const { error: logoutError } = await supabase.auth.signOut();
            if (logoutError) {
                throw logoutError;
            }
            await router.push("/landing");
            await router.refresh();
        } catch {
            setLoading(false);
            alert('ログアウトエラーが発生しました');
        }
    };

    return (
        <button onClick={Logout} disabled={loading}>
            {loading ? "ログアウト中..." : <div className='flex'><FiLogOut className='mt-1 mr-1'/>ログアウト</div>}
        </button>
    );
};

export default LogoutButton;

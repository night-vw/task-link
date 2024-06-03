"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FcGoogle } from "react-icons/fc";

const GoogleSignIn: React.FC = () => {
    const supabase = createClientComponentClient();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleRedirect = async () => {
            const session = await supabase.auth.getSession();
            if (session.data.session) {
                router.push("/");
            }
        };

        if (typeof window !== 'undefined') {
            handleRedirect();
        }
    }, [router, supabase.auth]);

    const signInWithGoogle = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/landing`,
            },
        });
        
        if (error) {
            console.error('Googleログインエラー:', error);
            setLoading(false);
            return;
        }
    };

    return (
        <button
            className={`flex items-center px-8 py-3 border border-transparent text-sm font-semibold rounded-md text-gray-100 bg-red-500 hover:bg-red-600 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={signInWithGoogle}
            disabled={loading}>
            <FcGoogle className="mr-2" />{loading ? 'Googleでログイン中...' : 'Googleでログイン'}
        </button>
    );
};

export default GoogleSignIn;

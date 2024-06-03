"use client"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import {DropdownMenuItem } from "@/components/ui/dropdown-menu";


const LogoutButton = () => {

    const router = useRouter() ;
    const supabase = createClientComponentClient();
    const [loading,SetLoading] = useState(false) ;

    const Logout = async(e:React.FormEvent) => {
        e.preventDefault();
        try{
          SetLoading(true);
          const { error:logoutError } = await supabase.auth.signOut()
          if (logoutError) {
            throw logoutError;
          }
          await router.push("/landing");
          await router.refresh() ;
        }catch{
            SetLoading(false);
          alert('ログアウトエラーが発生しました');
        }
      }
  return (
    <DropdownMenuItem
    onClick={Logout}
    disabled={loading}>
    {loading ? "ログアウト中..." : "ログアウト"}
    </DropdownMenuItem>
  )
}

export default LogoutButton
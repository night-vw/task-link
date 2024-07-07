"use client";
import React, { useEffect, useState } from 'react';
import { TbMapUp } from "react-icons/tb";
import { loadStripe } from "@stripe/stripe-js";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const processSubscription = async (plan_id: string, setLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
  try {
    setLoading(true);
    const response = await fetch(`/api/subscription/${plan_id}`);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);
    await stripe?.redirectToCheckout({ sessionId: data.id });
  } catch (error) {
    console.error('Error processing subscription:', error);
  } finally {
    setLoading(false);
  }
};

const SubscriptionPage = () => {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [interval, setInterval] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const month_plan_id = process.env.NEXT_PUBLIC_STRIPE_PLANID_MONTH;
  const year_plan_id = process.env.NEXT_PUBLIC_STRIPE_PLANID_YEAR;

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        setUser(session.user);
        const { data: profile, error } = await supabase
          .from('profile')
          .select('is_subscribed, interval')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          setIsSubscribed(profile.is_subscribed);
          setInterval(profile.interval);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [supabase]);

  const handleSubscription = async (plan_id: string) => {
    await processSubscription(plan_id, setLoading);
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/portal`);
    const data = await response.json();
    setLoading(false);
    router.push(data.url);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-2xl">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-zinc-600">処理中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center flex flex-col items-center pt-20" style={{ backgroundImage: "url('/space.png')" }}>
      <main className="flex-1 w-full max-w-4xl mx-auto p-6">
        <section className="bg-white shadow-md rounded-lg p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex">アップグレードプランの紹介<TbMapUp className='pl-2' size={30} /></h2>
          {!isSubscribed && (
            <>
              <p className="text-gray-600 mb-6">
                Task-Linkでは、地図上でタスク管理が可能です。
              </p>
              <p className="text-gray-900 mb-6">
                無料プランでは、同時に9個までタスクを追加できますが、アップグレードプランに加入することで、同時に10個以上のタスクを地図上に追加することが可能になります。
              </p>
            </>
          )}

          {!isSubscribed ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold text-indigo-500 mb-4">月額プラン</h3>
                <p className="text-2xl font-bold text-gray-800 mb-4">¥500 / 月</p>
                <ul className="list-disc list-inside text-gray-700 mb-6">
                  <li>無制限のタスク追加</li>
                  <li>優先サポート</li>
                </ul>
                <button
                  className="w-full bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600"
                  onClick={() => handleSubscription(month_plan_id!)}
                >
                  今すぐプランに加入
                </button>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold text-teal-500 mb-4">年額プラン</h3>
                <p className="text-2xl font-bold text-gray-800 mb-4">¥5000 / 年</p>
                <ul className="list-disc list-inside text-gray-700 mb-6">
                  <li>無制限のタスク追加</li>
                  <li>優先サポート</li>
                </ul>
                <button
                  className="w-full bg-teal-500 text-white py-2 rounded hover:bg-teal-600"
                  onClick={() => handleSubscription(year_plan_id!)}
                >
                  今すぐプランに加入
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center mt-6 bg-green-100 p-6 rounded-lg shadow-lg">
              <p className="text-base md:text-2xl font-bold text-green-700">
                あなたは現在 {interval === 'month' ? '月額プラン' : '年額プラン'} に加入しています。
              </p>
              <button
                className="mt-4 bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600"
                onClick={handleManageSubscription}
              >
                プランを変更/解約
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default SubscriptionPage;

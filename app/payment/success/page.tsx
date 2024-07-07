"use client"
import React from 'react';

const PaymentSuccessPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cover p-4" style={{ backgroundImage: "url('/space.png')" }}>
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">

          <h1 className="text-2xl font-semibold text-gray-800">支払いが成功しました！</h1>
          <p className="mt-2 text-gray-600">
            ご購入ありがとうございます。お支払いが正常に処理されました。
          </p>
          <div className="mt-6">
            <button
              className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
              onClick={() => window.location.href = '/subscription'}
            >
              アップグレードプランに移動
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccessPage;

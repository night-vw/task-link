"use client"
import React from 'react';

const PaymentCancelledPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cover p-4" style={{ backgroundImage: "url('/space.png')" }}>
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800">支払いがキャンセルされました</h1>
          <p className="mt-2 text-gray-600">
            お支払いがキャンセルされました。もう一度お試しください。
          </p>
          <div className="mt-6">
            <button
              className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
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

export default PaymentCancelledPage;

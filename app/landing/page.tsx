import Head from 'next/head';
import Link from "next/link"

const Landing = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100 w-screen">

      <main className="flex flex-col items-center justify-center flex-1 px-6 md:px-20 text-center max-w-screen-lg mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-sky-700">Task-Link </h1>

        <p className="mt-3 text-xl md:text-2xl font-medium">
          サインイン してください
        </p>

        <div className="mt-6 flex flex-col md:flex-row justify-center">

          <Link
            href="/"
            className="px-8 py-3 border border-transparent text-base font-semibold rounded-md text-gray-100 bg-blue-800 hover:bg-blue-800"
          >
            サインイン
          </Link>
        </div>
      </main>

      <footer className="flex items-center justify-center w-full h-24 border-t mt-8">
        <p className="text-gray-500">
          © 2024 Task-Link. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Landing;

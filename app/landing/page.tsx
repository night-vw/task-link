import { FcGoogle } from "react-icons/fc";
import Link from "next/link"

const Landing = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100 w-screen">

      <main className="flex flex-col items-center justify-center flex-1 px-6 md:px-20 text-center max-w-screen-lg mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-sky-700">Task-Link</h1>

        <p className="mt-3 text-xl md:text-2xl font-medium">
          ログイン してください
        </p>

        <div className="mt-6 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
          <Link
            href="/login"
            className="px-8 py-3 border border-transparent text-base font-semibold rounded-md text-gray-100 bg-indigo-500 hover:bg-indigo-600"
          >
            Emailでログイン
          </Link>
          <p className="md:mx-4">or</p>
          <Link
            href="/"
            className="flex items-center px-8 py-3 border border-transparent text-sm font-semibold rounded-md text-gray-100 bg-red-500 hover:bg-red-600"
          >
            <FcGoogle className="mr-2" />
            Googleでログイン
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

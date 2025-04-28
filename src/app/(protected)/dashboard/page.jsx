'use client'

import { useSession, signOut } from "next-auth/react";

function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (!session) {
    return <p className="text-center mt-10">You are not signed in</p>;
  }

  return (
    <main className="w-full h-screen flex flex-col items-center justify-center px-4 bg-white">
      <div className="max-w-md w-full text-center space-y-5">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome {session.user.username} 👋
        </h1>

        <button
          onClick={() => signOut({ callbackUrl: '/signin' })}
          className="mt-6 px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 duration-150 hover:cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </main>
  );
}

export default DashboardPage;

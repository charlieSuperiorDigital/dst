"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export function Navbar() {
  const { data: session, status } = useSession();
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-6">
          <div className="flex">
            <Link
              href="/admin/dashboard"
              className="flex-shrink-0 flex items-center"
            >
              Dashboard
            </Link>
          </div>
          <div className="flex items-center">
            {status === "loading" ? (
              <p>Loading...</p>
            ) : session ? (
              <>
                <span className="mr-4">Welcome, {session.user?.name}</span>
                <button onClick={() => signOut({ callbackUrl: "/" })}>
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

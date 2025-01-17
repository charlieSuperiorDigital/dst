"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Navbar() {
  const { data: session, status } = useSession();
  return (
    <nav className="border-b">
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {status === "loading" ? (
              <p>Loading...</p>
            ) : session ? (
              <span>Welcome, {session.user?.name}</span>
            ) : null}
          </div>
          <div className="flex items-center">
            {status === "loading" ? (
              <p>Loading...</p>
            ) : session ? (
              <Button 
                variant="outline" 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
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

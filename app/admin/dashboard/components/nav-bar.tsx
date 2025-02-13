"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, Users, ScrollText, Package, FileText } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

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
          <div className="flex items-center gap-2">
            {status === "loading" ? (
              <p>Loading...</p>
            ) : session ? (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/admin/dashboard">
                        <Button 
                          variant="outline" 
                          className={`text-gray-500 border-gray-500 hover:bg-gray-500 hover:text-white ${
                            pathname === "/admin/dashboard" ? "bg-gray-500 text-white" : ""
                          }`}
                        >
                          <Package className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Parts</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/admin/dashboard/quotes">
                        <Button 
                          variant="outline" 
                          className={`text-gray-500 border-gray-500 hover:bg-gray-500 hover:text-white ${
                            pathname === "/admin/dashboard/quotes" ? "bg-gray-500 text-white" : ""
                          }`}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Quotes</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/admin/dashboard/logs">
                        <Button 
                          variant="outline" 
                          className={`text-gray-500 border-gray-500 hover:bg-gray-500 hover:text-white ${
                            pathname === "/admin/dashboard/logs" ? "bg-gray-500 text-white" : ""
                          }`}
                        >
                          <ScrollText className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Logs</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/admin/dashboard/user-list">
                        <Button 
                          variant="outline" 
                          className={`text-gray-500 border-gray-500 hover:bg-gray-500 hover:text-white ${
                            pathname === "/admin/dashboard/user-list" ? "bg-gray-500 text-white" : ""
                          }`}
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Users</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Log out</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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

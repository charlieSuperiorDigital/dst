"use client";

import { Navbar } from "./components/nav-bar";
import SessionAuthProvider from "@/app/context/SessionAuthProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionAuthProvider>
      <div className="container mx-auto p-4">
        <Navbar />
        <div>&nbsp;</div>
        <div className="border rounded-lg p-4">
          {children}
        </div>
      </div>
    </SessionAuthProvider>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(() => {
    if (pathname === "/admin/dashboard/quotes") return "quotes";
    if (pathname === "/admin/dashboard/user-list") return "users";
    return "parts";
  });

  return (
    <div className="container mx-auto p-4">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mb-4"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="parts" asChild>
            <Link href="/admin/dashboard">Parts</Link>
          </TabsTrigger>
          <TabsTrigger value="quotes" asChild>
            <Link href="/admin/dashboard/quotes">Quotes</Link>
          </TabsTrigger>
          <TabsTrigger value="users" asChild>
            <Link href="/admin/dashboard/user-list">Users</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {children}
    </div>
  );
}

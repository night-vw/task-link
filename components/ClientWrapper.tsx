"use client";

import { usePathname } from "next/navigation";
import React from "react";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSideMenu = pathname !== "/landing" && pathname !=="/login" && pathname !=="/create-account";


  return <>{showSideMenu && children}</>;
}

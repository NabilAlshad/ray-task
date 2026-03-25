"use client";

import { useState, useEffect } from "react";

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="min-h-screen bg-gray-50 flex flex-col font-sans"></div>;
  }

  return <>{children}</>;
}

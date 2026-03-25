"use client";

import { type ReactNode, useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function ClientWrapper({ children }: { children: ReactNode }) {
  const isMounted = useSyncExternalStore(subscribe, () => true, () => false);

  if (!isMounted) {
    return <div className="min-h-screen bg-gray-50 flex flex-col font-sans"></div>;
  }

  return <>{children}</>;
}

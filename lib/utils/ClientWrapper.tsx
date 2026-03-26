"use client";

import { type ReactNode, useSyncExternalStore } from "react";
import { LoadingOverlay } from "@/lib/utils/lazy";

const subscribe = () => () => {};

export function ClientWrapper({ children }: { children: ReactNode }) {
  const isMounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  if (!isMounted) {
    return <LoadingOverlay message="Initializing..." />;
  }

  return <>{children}</>;
}

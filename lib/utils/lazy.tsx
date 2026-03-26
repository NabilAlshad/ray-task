import { lazy as reactLazy, Suspense as SuspenseReact, ReactNode } from "react";

export function LazyLoadingSpinner(): ReactNode {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          border: "3px solid #e5e7eb",
          borderTopColor: "#3b82f6",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
    </div>
  );
}

export function LoadingOverlay({
  message = "Loading...",
}: {
  message?: string;
}): ReactNode {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        zIndex: 9999,
        gap: "1rem",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          border: "4px solid #e5e7eb",
          borderTopColor: "#3b82f6",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <span style={{ color: "#6b7280", fontSize: "1rem", fontWeight: 500 }}>
        {message}
      </span>
      <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
    </div>
  );
}

export function LazyLoadingFallback({
  message = "Loading...",
}: {
  message?: string;
}): ReactNode {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
        gap: "1rem",
      }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          border: "3px solid #e5e7eb",
          borderTopColor: "#3b82f6",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>{message}</span>
      <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
    </div>
  );
}

export function lazyLoad<T extends React.ComponentType<unknown>>(
  importFunc: () => Promise<{ default: T }>,
  fallbackName?: string,
): React.LazyExoticComponent<T> {
  return reactLazy(() =>
    importFunc().catch((error: unknown) => {
      console.error(`Failed to load ${fallbackName || "component"}:`, error);
      throw error;
    }),
  ) as React.LazyExoticComponent<T>;
}

export function withSuspense(
  lazyComponent: ReactNode,
  fallback?: ReactNode,
): ReactNode {
  return (
    <SuspenseReact fallback={fallback || <LazyLoadingSpinner />}>
      {lazyComponent}
    </SuspenseReact>
  );
}

export { reactLazy as lazy };

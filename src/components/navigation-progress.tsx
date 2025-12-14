import { useRouterState } from "@tanstack/react-router";

export function NavigationProgress() {
  const isLoading = useRouterState({ select: (s) => s.isLoading });

  if (!isLoading) return null;

  return (
    <div className="h-0.5 w-full bg-muted overflow-hidden">
      <div className="h-full w-1/3 bg-primary animate-progress-indeterminate" />
    </div>
  );
}

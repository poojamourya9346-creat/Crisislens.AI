import { AppProviders } from "@/app/providers";
import { AppRouter } from "@/app/router";
import { ErrorBoundary } from "@/components/ui/error-boundary";

/** Root application shell. */
export function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </ErrorBoundary>
  );
}

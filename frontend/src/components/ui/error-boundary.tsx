import { Component, type ErrorInfo, type ReactNode } from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage?: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unhandled application error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#0B0F17] px-4">
          {/* Ambient glows */}
          <div className="pointer-events-none fixed inset-0 z-0">
            <div className="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-[#EF4444]/5 blur-[120px]" />
            <div className="absolute -right-40 bottom-1/3 h-96 w-96 rounded-full bg-[#3B82F6]/5 blur-[120px]" />
          </div>
          <div className="relative z-10 w-full max-w-md text-center">
            <div className="rounded-[20px] border border-white/[0.06] bg-[#151C28]/80 p-10 shadow-[0_32px_80px_rgba(0,0,0,0.7),0_1px_0_rgba(255,255,255,0.03)_inset] backdrop-blur-2xl">
              {/* Decorative grid */}
              <div className="absolute inset-0 -z-10 rounded-[20px] bg-[linear-gradient(to_right,rgba(255,255,255,0.008)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.008)_1px,transparent_1px)] bg-[size:24px_24px]" />
              {/* Icon */}
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#EF4444]/20 bg-[#EF4444]/10 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                <ShieldAlert className="h-8 w-8 text-[#EF4444]" />
              </div>
              <div className="space-y-2 mb-8">
                <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">Render Error</h2>
                <p className="text-sm text-[#CBD5E1] leading-relaxed font-medium">
                  A critical application error has occurred. The system was unable to render this component.
                </p>
                {this.state.errorMessage && (
                  <p className="mt-3 rounded-xl border border-[#EF4444]/15 bg-[#EF4444]/5 px-4 py-3 font-mono text-[11px] text-[#EF4444]/80 text-left">
                    {this.state.errorMessage}
                  </p>
                )}
              </div>
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
                className="w-full gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Application
              </Button>
              <p className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8]/60">
                CrisisLens AI · System Recovery
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

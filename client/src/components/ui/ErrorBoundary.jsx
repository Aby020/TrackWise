import { AlertTriangle, RefreshCw } from "lucide-react";
import { Component } from "react";
import { Button } from "./Button";

/**
 * React error boundary for isolated subtrees. Renders a human-readable
 * failure with a retry control that remounts the children.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="flex flex-col items-center justify-center px-6 py-14 text-center"
        >
          <span
            className="grid h-12 w-12 place-items-center rounded-xl bg-danger-soft text-danger"
            aria-hidden="true"
          >
            <AlertTriangle className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <h3 className="mt-4 text-sm font-semibold text-ink">
            This section hit a snag
          </h3>
          <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-muted">
            {this.state.error?.message ||
              "Something went wrong while rendering this view."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleRetry}
            leftIcon={RefreshCw}
            className="mt-5"
          >
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

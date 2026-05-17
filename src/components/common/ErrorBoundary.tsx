import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in React lifecycle:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F9F5EE] p-6">
          <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center space-y-5">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">
                Đã xảy ra sự cố hiển thị
              </h3>
              <p className="text-sm text-gray-500 font-light">
                Hệ thống gặp lỗi bất thường khi vẽ giao diện. Vui lòng tải lại
                trang hoặc liên hệ quản trị viên.
              </p>
            </div>
            {this.state.error && (
              <pre className="text-left text-xs bg-gray-50 p-4 rounded-xl text-gray-600 font-mono overflow-auto max-h-40 border border-gray-100">
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#C89A3D] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#B68B35] transition-all"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;

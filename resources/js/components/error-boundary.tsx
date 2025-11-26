import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex min-h-[400px] items-center justify-center p-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card max-w-md p-6 text-center"
                    >
                        <div className="mb-4 flex justify-center">
                            <div className="rounded-full bg-warning-100 p-3 dark:bg-warning-900/30">
                                <svg
                                    className="h-8 w-8 text-warning-600 dark:text-warning-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                            Something went wrong
                        </h2>
                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                            An unexpected error occurred. Please try again or contact support if the problem persists.
                        </p>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mt-4 rounded-lg bg-zinc-100 p-3 text-left dark:bg-zinc-800">
                                <p className="font-mono text-xs text-warning-600 dark:text-warning-400">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}
                        <div className="mt-6 flex justify-center gap-3">
                            <button
                                onClick={this.handleReset}
                                className="btn-secondary"
                            >
                                Try Again
                            </button>
                            <Link href="/" className="btn-primary">
                                Go Home
                            </Link>
                        </div>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}

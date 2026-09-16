import React from 'react';

interface LoadingProps {
    fullPage?: boolean;
    text?: string;
}

const Loading: React.FC<LoadingProps> = ({ fullPage = false, text }) => {
    const containerClasses = fullPage
        ? "fixed inset-0 flex flex-col items-center justify-center bg-white z-50"
        : "flex flex-col items-center justify-center py-10 w-full";

    return (
        <div className={containerClasses}>
            <div className="relative w-8 h-8">
                {/* Track */}
                <svg
                    className="animate-spin w-8 h-8"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    role="status"
                    aria-label={text ?? "Loading"}
                >
                    <circle cx="16" cy="16" r="12" stroke="#e5e7eb" strokeWidth="3" fill="none" />
                    <path d="M16 4 A12 12 0 0 1 28 16" stroke="#4285F4" strokeWidth="3" strokeLinecap="round" fill="none" />
                    <path d="M28 16 A12 12 0 0 1 21.485 26.485" stroke="#EA4335" strokeWidth="3" strokeLinecap="round" fill="none" />
                    <path d="M21.485 26.485 A12 12 0 0 1 10.515 26.485" stroke="#FBBC05" strokeWidth="3" strokeLinecap="round" fill="none" />
                    <path d="M10.515 26.485 A12 12 0 0 1 4 16" stroke="#34A853" strokeWidth="3" strokeLinecap="round" fill="none" />
                </svg>
            </div>

            {text && (
                <p className="mt-3 text-sm text-gray-500">{text}</p>
            )}

            <span className="sr-only">Loading...</span>
        </div>
    );
};

export default Loading;
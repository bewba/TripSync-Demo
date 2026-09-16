import React from 'react';
import Head from 'next/head';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-body">
      <Head>
        <title>{`${title} | Fleet Manager`}</title>
      </Head>
      <div className="w-full max-w-md bg-white border border-outline-variant/30 shadow-sm rounded-xl p-8 space-y-6">
        <div className="text-center">
            <h1 className="text-2xl font-headline font-extrabold text-primary tracking-tight">Fleet Manager</h1>
            <p className="text-on-surface-variant mt-2 text-sm">{title} to continue to your dashboard</p>
        </div>
        {children}
      </div>
    </div>
  );
};

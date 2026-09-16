import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Loader2, ShieldCheck, Truck, Users } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('admin@demofleet.ph');
  const [password, setPassword] = useState('demo123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: '/auth/active-drivers',
      });

      if (res?.error) {
        setErrorMsg('Sign-in failed. Please try again.');
      } else if (res?.url) {
        router.push(res.url);
      } else {
        router.push('/auth/active-drivers');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, role: string) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: demoEmail,
        password: 'demo',
        role,
        callbackUrl: '/auth/active-drivers',
      });
      if (res?.url) {
        router.push(res.url);
      } else {
        router.push('/auth/active-drivers');
      }
    } catch (err: any) {
      setErrorMsg('Quick login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1-Click Demo Quick Access Banner */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl text-white shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-white">
            Interactive Standalone Demo
          </span>
          <span className="text-xs text-blue-100">Zero-Config Mode</span>
        </div>
        <p className="text-sm text-blue-100 mb-3">
          Explore the live moving fleet, analytics, and trip planner instantly without setting up any credentials.
        </p>

        <button
          type="button"
          onClick={() => handleQuickLogin('admin@demofleet.ph', 'Admin')}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 py-2.5 px-4 rounded-lg font-bold text-sm shadow transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          )}
          ⚡ Quick Demo Access (Fleet Admin)
        </button>

        {/* Quick Role Switcher */}
        <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
          <span className="text-blue-200">Other demo roles:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('dispatcher@demofleet.ph', 'Dispatcher')}
              disabled={isLoading}
              className="hover:text-white text-blue-200 underline cursor-pointer"
            >
              Dispatcher
            </button>
            <span className="text-blue-300">•</span>
            <button
              type="button"
              onClick={() => handleQuickLogin('driver@demofleet.ph', 'Driver')}
              disabled={isLoading}
              className="hover:text-white text-blue-200 underline cursor-pointer"
            >
              Driver
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
          {errorMsg}
        </div>
      )}

      {/* Standard Email / Password Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@demofleet.ph"
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            required
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
            <span className="text-xs text-slate-400">Any password in demo</span>
          </div>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full cursor-pointer bg-slate-900 text-white py-2.5 rounded-lg font-semibold hover:bg-slate-800 transition-colors active:scale-[0.98] mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Sign In
        </button>
      </form>
    </div>
  );
};

export const SignupForm: React.FC = () => {
  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</label>
        <input
          type="email"
          id="email"
          placeholder="name@example.com"
          className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          required
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
        <input
          type="password"
          id="password"
          placeholder="Create a password"
          className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-semibold hover:bg-slate-800 transition-colors active:scale-[0.98] mt-2 cursor-pointer"
      >
        Create Account
      </button>
      <div className="text-center mt-4">
        <p className="text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </form>
  );
};

import React from 'react';
import Head from 'next/head';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/AuthForms';
import { GoogleSignInButton } from '@/components/auth/SocialAuthButtons';

const LoginPage = () => {
  return (
    <>
      <Head>
        <title>Sign In | Transport Fleet Management</title>
      </Head>
      <AuthLayout title="Fleet Management Portal">
        <div className="space-y-6">
          <LoginForm />
          <GoogleSignInButton />
        </div>
      </AuthLayout>
    </>
  );
};

export default LoginPage;

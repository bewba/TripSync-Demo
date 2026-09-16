import React from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { GoogleSignInButton } from '@/components/auth/SocialAuthButtons';

const SignupPage = () => {
  return (
    <AuthLayout title="Create Account">
      <div className="space-y-6">
        <GoogleSignInButton />
      </div>
    </AuthLayout>
  );
};

export default SignupPage;

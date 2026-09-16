import React from 'react';
import { signOut } from "next-auth/react";

const SignOutPage = () => {
    return (
        /* The flex, items-center, and justify-center classes handle the centering */
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="space-y-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900">You are not an admin!</h1>
                <h3 className='text-lg font-medium text-gray-600'>
                    Please contact an admin if this is a mistake
                </h3>
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="px-6 py-2 bg-red-600 text-white cursor-pointer rounded-md hover:bg-red-700 transition font-semibold shadow-sm"
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default SignOutPage;
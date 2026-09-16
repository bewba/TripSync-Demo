import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { DEMO_USERS } from '../../../lib/demoData';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'demo-ltc-secret-key-32-chars-long';

const providers: any[] = [
  CredentialsProvider({
    credentials: {
      email: { label: 'Email', type: 'email', placeholder: 'admin@demofleet.ph' },
      password: { label: 'Password', type: 'password' },
      role: { label: 'Role', type: 'text' },
    },
    async authorize(credentials) {
      if (!credentials) return null;

      const email = (credentials.email || 'admin@demofleet.ph').toLowerCase().trim();
      const requestedRole = credentials.role || '';

      // Match known demo user or create an active admin session
      const matched = DEMO_USERS.find((u) => u.email.toLowerCase() === email);

      if (matched) {
        return {
          id: matched.id,
          name: matched.name,
          email: matched.email,
          role: requestedRole || matched.role,
          image: matched.avatar,
        };
      }

      // Fallback for any email provided: grant Admin access for review
      return {
        id: 'usr-admin',
        name: email.split('@')[0] || 'Fleet Admin',
        email: email,
        role: requestedRole || 'Admin',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop',
      };
    },
  }),
];

// Optionally enable Google OAuth if environment variables are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  secret: NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'Admin';
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role || 'Admin';
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
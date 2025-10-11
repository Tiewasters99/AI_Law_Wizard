import NextAuth, { AuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'CUSTOMER',
          profileComplete: user.profileComplete,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle OAuth sign-in (Google and future providers)
      if (account?.provider === 'google') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { lawyerProfile: true, customerProfile: true },
          });

          if (!existingUser) {
            // Create new OAuth user without role - they must select it
            const newUser = await prisma.user.create({
              data: {
                name: user.name,
                email: user.email,
                image: user.image,
                emailVerified: new Date(),
                role: 'CUSTOMER', // Default role, will prompt for selection if profileComplete is false
                profileComplete: false, // Forces role selection on first login
                accounts: {
                  create: {
                    type: account.type,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    access_token: account.access_token,
                    refresh_token: account.refresh_token,
                    expires_at: account.expires_at,
                    token_type: account.token_type,
                    scope: account.scope,
                    id_token: account.id_token,
                    session_state: account.session_state,
                  },
                },
              },
            });
            
            // Create wallet with starter tokens for new OAuth users
            try {
              await prisma.wallet.create({
                data: {
                  userId: newUser.id,
                  tokens: 5000, // Give 5000 starter tokens to new OAuth users
                },
              });
              console.log(`Created wallet with 5000 tokens for OAuth user: ${newUser.email}`);
            } catch (walletError) {
              console.error('Error creating wallet for OAuth user:', walletError);
              // Don't fail sign-in if wallet creation fails
            }
          }
          
          // Ensure ALL existing users have a wallet (covers all cases including completed profiles)
          if (existingUser) {
            try {
              const existingWallet = await prisma.wallet.findUnique({
                where: { userId: existingUser.id },
              });
              
              if (!existingWallet) {
                await prisma.wallet.create({
                  data: {
                    userId: existingUser.id,
                    tokens: 5000, // Give 5000 starter tokens if wallet doesn't exist
                  },
                });
                console.log(`Created wallet with 5000 tokens for user without wallet: ${existingUser.email}`);
              }
            } catch (walletError) {
              console.error('Error ensuring wallet exists:', walletError);
            }
          }
        } catch (error) {
          console.error('Error during OAuth sign-in:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        // Normalize LAWYER to ATTORNEY for backward compatibility
        token.role = user.role === 'LAWYER' ? 'ATTORNEY' : user.role;
        token.profileComplete = user.profileComplete;
      }
      
      // Update user data from database on each request to ensure fresh data
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: {
              role: true,
              profileComplete: true,
            },
          });
          if (dbUser) {
            // Normalize LAWYER to ATTORNEY for backward compatibility
            token.role = dbUser.role === 'LAWYER' ? 'ATTORNEY' : (dbUser.role || 'CUSTOMER');
            token.profileComplete = dbUser.profileComplete;
          }
        } catch (error) {
          console.error('Error updating token from database:', error);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role === 'LAWYER' ? 'ATTORNEY' : token.role) as 'ATTORNEY' | 'LAWYER' | 'CUSTOMER';
        session.user.profileComplete = token.profileComplete as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

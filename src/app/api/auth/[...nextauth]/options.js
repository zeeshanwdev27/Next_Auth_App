import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/UserModel";
import NextAuth from "next-auth";

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (credentials) {
          await dbConnect();
          try {
            const user = await UserModel.findOne({ email: credentials.email });
            if (!user) {
              throw new Error("No User Found");
            }
            if (!user.isVerified) {
              throw new Error("Please Verify Your Account First");
            }
            const isPasswordCorrect = await bcrypt.compare(
              credentials.password,
              user.password
            );
            if (isPasswordCorrect) {
              return user;
            } else {
              throw new Error("Incorrect Password");
            }
          } catch (error) {
            throw new Error(error.message); // Make sure the error is user-friendly
          }
        }
        return null; // Allow Google to handle authentication when no credentials are provided
      },
    }),
    
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  
  callbacks: {
    async jwt({ token, user, account }) {
      await dbConnect();
    
      if (account?.provider === "google") {
        const existingUser = await UserModel.findOne({ email: token.email });

        if (!existingUser) {
          const newUser = await UserModel.create({
            username: token.email.split("@")[0],
            email: token.email,
            provider: "google",
            isVerified: true,
            password: "",
          });

          token._id = newUser._id.toString();
          token.isVerified = newUser.isVerified;
          token.username = newUser.username;
          token.isAcceptingMessages = true;
        } else {
          token._id = existingUser._id.toString();
          token.isVerified = existingUser.isVerified;
          token.username = existingUser.username;
          token.isAcceptingMessages = existingUser.isAcceptingMessages;
        }
      } else if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },
  
  session: {
    strategy: "jwt",
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signin", // your custom sign-in page
  },
};

export default NextAuth(authOptions);

import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { authConfig as baseConfig } from "./auth.config.js"
import type { JWT } from "next-auth/jwt"
import type { Session, User } from "next-auth"

export const authConfig = {
  ...baseConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (!parsedCredentials.success) {
          return null
        }

        const { email, password } = parsedCredentials.data
        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.hashedPassword) {
          return null
        }

        const passwordsMatch = await bcrypt.compare(
          password,
          user.hashedPassword
        )

        if (!passwordsMatch) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.role = token.role as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
} 
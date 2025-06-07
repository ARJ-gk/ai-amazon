import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { NextApiRequest, NextApiResponse } from "next"
import type { Session } from "next-auth"
import bcrypt from "bcryptjs"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = (await getServerSession(req, res, authOptions)) as Session | null
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  if (req.method === "PATCH") {
    const { currentPassword, newPassword } = req.body
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { hashedPassword: true },
    })
    if (!user || !user.hashedPassword) {
      return res.status(404).json({ error: "User not found" })
    }
    const isPasswordValid = await bcrypt.compare(currentPassword, user.hashedPassword)
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Current password is incorrect" })
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { hashedPassword },
    })
    return res.status(200).json({ message: "Password updated successfully" })
  }

  res.setHeader("Allow", ["PATCH"])
  res.status(405).end(`Method ${req.method} Not Allowed`)
} 
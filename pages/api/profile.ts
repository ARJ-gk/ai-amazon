import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { NextApiRequest, NextApiResponse } from "next"
import type { Session } from "next-auth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = (await getServerSession(req, res, authOptions)) as Session | null
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  if (req.method === "GET") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, role: true },
    })
    if (!user) return res.status(404).json({ error: "User not found" })
    return res.status(200).json(user)
  }

  if (req.method === "PATCH") {
    const { name } = req.body
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name },
      select: { id: true, name: true, email: true, role: true },
    })
    return res.status(200).json(user)
  }

  res.setHeader("Allow", ["GET", "PATCH"])
  res.status(405).end(`Method ${req.method} Not Allowed`)
} 
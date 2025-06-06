import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const verifyEmailSchema = z.object({
  token: z.string(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { token } = verifyEmailSchema.parse(body)

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token },
      })
      return NextResponse.json(
        { error: "Token expired" },
        { status: 400 }
      )
    }

    // Update user's email verification status
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    })

    // Delete used token
    await prisma.verificationToken.delete({
      where: { token },
    })

    return NextResponse.json({
      message: "Email verified successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
} 
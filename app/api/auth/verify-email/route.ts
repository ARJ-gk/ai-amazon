import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import crypto from "crypto"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Save verification token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    // Send verification email
    await resend.emails.send({
      from: "AI Amazon <noreply@ai-amazon.com>",
      to: email,
      subject: "Verify your email address",
      html: `
        <h1>Welcome to AI Amazon!</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}">
          Verify Email
        </a>
        <p>This link will expire in 24 hours.</p>
      `,
    })

    return NextResponse.json({
      message: "Verification email sent",
    })
  } catch (error) {
    console.error("Error sending verification email:", error)
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    )
  }
} 
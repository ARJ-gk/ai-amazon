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

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour

    // Save reset token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    // Send reset email
    await resend.emails.send({
      from: "AI Amazon <noreply@ai-amazon.com>",
      to: email,
      subject: "Reset your password",
      html: `
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    })

    return NextResponse.json({
      message: "Password reset email sent",
    })
  } catch (error) {
    console.error("Error sending reset email:", error)
    return NextResponse.json(
      { error: "Failed to send reset email" },
      { status: 500 }
    )
  }
} 
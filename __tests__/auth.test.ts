import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { getServerSession } from "next-auth"

// Mock dependencies
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}))

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}))

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn(),
  },
}))

// Import the API route handlers
import { POST as registerHandler } from "@/app/api/register/route"
import { PATCH as profileUpdateHandler } from "@/app/api/profile/route"
import { PATCH as passwordUpdateHandler } from "@/app/api/profile/password/route"

jest.mock("next-auth", () => ({
  ...jest.requireActual("next-auth"),
  getServerSession: jest.fn(),
}))

describe("Auth API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Register", () => {
    it("should register a new user", async () => {
      const mockUser = { id: "1", email: "test@example.com" }
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.user.create as jest.Mock).mockResolvedValue(mockUser)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword")

      const req = new Request("http://localhost/api/register", {
        method: "POST",
        body: JSON.stringify({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        }),
      })

      await registerHandler(req)

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: "Test User",
          email: "test@example.com",
          hashedPassword: "hashedPassword",
        },
      })
      expect(NextResponse.json).toHaveBeenCalledWith(
        { message: "User created successfully", user: { id: "1", email: "test@example.com" } },
        { status: 201 }
      )
    })

    it("should return error if user already exists", async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "1", email: "test@example.com" })

      const req = new Request("http://localhost/api/register", {
        method: "POST",
        body: JSON.stringify({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        }),
      })

      await registerHandler(req)

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    })
  })

  describe("Profile Update", () => {
    it("should update user profiles", async () => {
      const req = {
        json: jest.fn().mockResolvedValue({ name: "Updated User", email: "updated@example.com" }),
      } as any
      const session = { user: { id: "user-id" } }
      ;(getServerSession as jest.Mock).mockResolvedValue(session)
      ;(prisma.user.update as jest.Mock).mockResolvedValue({
        id: "user-id",
        name: "Updated User",
        email: "updated@example.com",
        role: "CUSTOMER",
      })
      await profileUpdateHandler(req)
      expect(NextResponse.json).toHaveBeenCalledWith({
        id: "user-id",
        name: "Updated User",
        email: "updated@example.com",
        role: "CUSTOMER",
      })
    })
  })

  describe("Password Update", () => {
    it("should update user password", async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ hashedPassword: "oldHashedPassword" })
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue("newHashedPassword")

      const req = new Request("http://localhost/api/profile/password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: "oldPassword",
          newPassword: "newPassword",
          confirmPassword: "newPassword",
        }),
      })

      await passwordUpdateHandler(req)

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-id" },
        data: { hashedPassword: "newHashedPassword" },
      })
      expect(NextResponse.json).toHaveBeenCalledWith({ message: "Password updated successfully" })
    })

    it("should return error if current password is incorrect", async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ hashedPassword: "oldHashedPassword" })
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      const req = new Request("http://localhost/api/profile/password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: "wrongPassword",
          newPassword: "newPassword",
          confirmPassword: "newPassword",
        }),
      })

      await passwordUpdateHandler(req)

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Current password is incorrect" },
        { status: 400 }
      )
    })
  })
}) 
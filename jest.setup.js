// Mock Next.js
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn(),
  },
}))

// Mock next-auth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(() => Promise.resolve({ user: { id: "1", role: "CUSTOMER" } })),
}))

// Mock bcryptjs
jest.mock("bcryptjs", () => ({
  hash: jest.fn(() => Promise.resolve("hashedPassword")),
  compare: jest.fn(() => Promise.resolve(true)),
}))

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
})) 
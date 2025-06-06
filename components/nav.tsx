"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function Nav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="text-lg font-semibold hover:text-blue-600 transition-colors"
          >
            AI Amazon
          </Link>
          <div className="hidden md:flex space-x-4">
            <Link
              href="/products"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                pathname === "/products" ? "text-blue-600" : "text-gray-500"
              }`}
            >
              Products
            </Link>
            <Link
              href="/categories"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                pathname === "/categories" ? "text-blue-600" : "text-gray-500"
              }`}
            >
              Categories
            </Link>
          </div>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          {session ? (
            <>
              <span className="text-sm text-gray-500">
                Welcome, {session.user?.name}
              </span>
              <Button
                variant="ghost"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button>Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
} 
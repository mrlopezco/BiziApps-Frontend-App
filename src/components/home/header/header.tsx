import Link from "next/link"
import { User } from "@supabase/supabase-js"
import Image from "next/image"
import { Button } from "@/components/ui/button"

import { LogoutButton } from "@/components/layout/logout-button"
import { User as UserIcon, LayoutDashboard, Briefcase, Home } from "lucide-react"

interface Props {
  data: { user: User | null } | null
}

export default function Header({ data }: Props) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/assets/icons/logo/BiziApps-logo-icon.svg" alt="BiziApps" width={32} height={32} />
          <span className="font-semibold text-lg">BiziApps</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link
            href="/jobs"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Briefcase className="h-4 w-4" />
            Jobs
          </Link>
          {data?.user && (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          )}
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          {data?.user ? (
            <>
              <div className="hidden md:flex flex-col items-end text-sm">
                <span className="font-medium">{data.user.user_metadata?.full_name || "User"}</span>
                <span className="text-muted-foreground text-xs">{data.user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/dashboard/profile">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <UserIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Profile</span>
                  </Button>
                </Link>
                <LogoutButton />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

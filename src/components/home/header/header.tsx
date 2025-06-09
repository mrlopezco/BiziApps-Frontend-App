"use client" // Add this directive at the top for client-side hooks

import Link from "next/link"
import { usePathname } from "next/navigation" // Import usePathname
import { User } from "@supabase/supabase-js"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/layout/logout-button"
import { User as UserIcon, Briefcase, Home, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar" // Import Avatar components

interface Props {
  data: { user: User | null } | null
}

export default function Header({ data }: Props) {
  const pathname = usePathname() // Get the current pathname

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src={"/justbee_30.svg"} alt={"Biziapps"} width={32} height={32} />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              pathname === "/" ? "text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link
            href="/jobs"
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              pathname === "/jobs" ? "text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Jobs
          </Link>
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          {data?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    {" "}
                    {/* Use Avatar component */}
                    {data.user.user_metadata?.avatar_url ? (
                      <AvatarImage
                        src={data.user.user_metadata.avatar_url}
                        alt={data.user.user_metadata?.full_name || "User"}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <AvatarFallback>
                        <UserIcon className="h-6 w-6" /> {/* UserIcon as fallback */}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  {data.user.user_metadata?.full_name && (
                    <p className="text-sm font-medium leading-none">{data.user.user_metadata.full_name}</p>
                  )}
                  {data.user.email && <p className="text-xs leading-none text-muted-foreground">{data.user.email}</p>}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <LogoutButton>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </LogoutButton>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

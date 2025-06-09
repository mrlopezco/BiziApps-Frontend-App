"use client"

import { Album, Briefcase, CreditCard, Home, User, Bookmark } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils" // Assuming you have this utility for classnames

const sidebarItems = [
  {
    title: "Dashboard",
    icon: <Home className="h-5 w-5" />, // Reduced icon size for horizontal display
    href: "/dashboard",
  },
  {
    title: "Bookmarks",
    icon: <Bookmark className="h-5 w-5" />,
    href: "/dashboard/bookmarks",
  },
  // {
  //   title: "Subscriptions",
  //   icon: <Album className="h-5 w-5" />,
  //   href: "/dashboard/subscriptions",
  // },
  // {
  //   title: "Payments",
  //   icon: <CreditCard className="h-5 w-5" />,
  //   href: "/dashboard/payments",
  // },
]

export function DashboardMenuBar() {
  const pathname = usePathname()
  return (
    <div className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-3">
      <nav className="flex flex-wrap gap-2 justify-center text-sm font-medium">
        {sidebarItems.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className={cn("flex items-center gap-2 px-3 py-2 rounded-md transition-colors hover:bg-muted", {
              "bg-primary text-primary-foreground":
                item.href === "/dashboard" ? pathname === item.href : pathname.includes(item.href),
              "text-muted-foreground": !(item.href === "/dashboard"
                ? pathname === item.href
                : pathname.includes(item.href)),
            })}
          >
            {item.icon} {item.title}
          </Link>
        ))}
      </nav>
    </div>
  )
}

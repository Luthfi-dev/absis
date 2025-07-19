"use client"

import { cn } from "@/lib/utils"

export function Header({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-16 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    >
      {children}
    </header>
  )
}

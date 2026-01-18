"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User } from "lucide-react"
import { DatePicker } from "@/components/date-picker"

interface AppHeaderProps {
  userEmail: string
  selectedDate: Date
}

export function AppHeader({ userEmail, selectedDate }: AppHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <header className="bg-secondary/80 backdrop-blur-sm border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-3 py-2.5 max-w-6xl">
        <div className="flex items-center justify-between gap-2">
          {/* Title */}
          <h1 className="hidden sm:block text-base font-semibold tracking-tight text-foreground whitespace-nowrap">
            Daily Voice Journal
          </h1>
          
          {/* Date picker */}
          <div className="flex-1 sm:flex-none flex justify-center sm:justify-start">
            <DatePicker selectedDate={selectedDate} />
          </div>
          
          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-card hover:bg-card/80 text-foreground border border-border shrink-0 h-8 w-8"
              >
                <User className="h-4 w-4" />
                <span className="sr-only">Menu de usuario</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-auto max-w-64 bg-card">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-foreground truncate">{userEmail}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

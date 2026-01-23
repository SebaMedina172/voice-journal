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
import { parseLocalDate } from "@/lib/date-utils"
import { GoogleConnectButton } from "@/components/google-connect-button"

interface AppHeaderProps {
  userEmail: string
  selectedDateStr: string
}

export function AppHeader({ userEmail, selectedDateStr }: AppHeaderProps) {
  const router = useRouter()
  const selectedDate = parseLocalDate(selectedDateStr)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <header className="bg-secondary/80 backdrop-blur-sm border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 max-w-6xl">
        <div className="flex items-center justify-between gap-2 sm:gap-4 min-h-10">
          {/* Title - hidden on mobile */}
          <h1 className="hidden sm:block text-sm sm:text-base font-semibold tracking-tight text-foreground whitespace-nowrap flex-shrink-0">
            Daily Voice Journal
          </h1>
          
          {/* Date picker - takes center space on mobile */}
          <div className="flex-1 sm:flex-none flex justify-center sm:justify-start">
            <DatePicker selectedDate={selectedDate} />
          </div>
          
          {/* User menu */}
          <div className="flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-card hover:bg-card/80 text-foreground border border-border h-8 w-8 flex-shrink-0"
                >
                  <User className="h-4 w-4" />
                  <span className="sr-only">Menu de usuario</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-auto max-w-xs sm:max-w-sm md:max-w-64 bg-card">
                <div className="px-2 py-1.5">
                  <p className="text-xs sm:text-sm font-medium text-foreground truncate">{userEmail}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="text-xs sm:text-sm p-0">
                  <GoogleConnectButton />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive text-xs sm:text-sm">
                  <LogOut className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Cerrar sesion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}

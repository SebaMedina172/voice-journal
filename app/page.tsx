import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  // Si está logueado, ir a la app. Si no, al login.
  if (data?.user) {
    redirect("/app")
  } else {
    redirect("/auth/login")
  }
}

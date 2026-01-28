import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ArrowLeft, Globe, Palette, Link as LinkIcon, User } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GoogleConnectButton } from "@/components/google-connect-button"

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const handleLogout = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/auth/login")
  }

  return (
    <div className="min-h-svh cork-texture flex flex-col">
      {/* Header */}
      <header className="bg-secondary/80 backdrop-blur-sm border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 max-w-4xl">
          <div className="flex items-center gap-4">
            <Link href="/app">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Volver</span>
              </Button>
            </Link>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Configuracion
            </h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="space-y-6">
            {/* Account Section */}
            <section className="bg-card/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Cuenta</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="text-sm font-medium text-foreground">{data.user.email}</p>
                </div>
                <div className="pt-2">
                  <form action={handleLogout}>
                    <Button type="submit" variant="destructive" size="sm">
                      Cerrar sesion
                    </Button>
                  </form>
                </div>
              </div>
            </section>

            {/* Integrations Section */}
            <section className="bg-card/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <LinkIcon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Integraciones</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Google</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Conecta tu cuenta de Google para sincronizar eventos de Calendar y tareas de Tasks.
                  </p>
                  <GoogleConnectButton />
                </div>
              </div>
            </section>

            {/* Language Section - future implementation */}
            {/* 
            <section className="bg-card/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Idioma y Region</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Idioma de la aplicacion</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Cambia el idioma de la interfaz y del reconocimiento de voz.
                  </p>
                  {/* Add language selector here (i18n switch) 
                </div>
              </div>
            </section>
            */}

            {/* Appearance Section - future implementation */}
            {/* 
            <section className="bg-card/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Apariencia</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Tema</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Personaliza el aspecto visual de la aplicacion.
                  </p>
                  {/* Add dark mode toggle here 
                </div>
              </div>
            </section>
            */}
          </div>
        </div>
      </main>
    </div>
  )
}

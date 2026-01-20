import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center px-4 py-6 sm:px-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl sm:text-2xl">¡Gracias por registrarte!</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Revisa tu email para confirmar tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              Te enviamos un email de confirmación. Una vez que confirmes tu cuenta, podrás iniciar sesión.
            </p>
            <Button asChild variant="outline" className="w-full bg-transparent text-xs sm:text-sm">
              <Link href="/auth/login">Ir a iniciar sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

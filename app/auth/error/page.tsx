import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center px-4 py-6 sm:px-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Algo salió mal</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:gap-4">
            {params?.error ? (
              <p className="text-xs sm:text-sm text-muted-foreground break-words">Error: {params.error}</p>
            ) : (
              <p className="text-xs sm:text-sm text-muted-foreground">Ocurrió un error inesperado.</p>
            )}
            <Button asChild variant="outline" className="w-full bg-transparent text-xs sm:text-sm">
              <Link href="/auth/login">Volver al inicio de sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

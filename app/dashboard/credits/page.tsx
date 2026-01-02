import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { CreditsPackages } from "./credits-packages" // Importe o componente novo

export default async function CreditsPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const calculatedCredits = (profile?.total_credits || 0) - (profile?.used_credits || 0)
  const availableCredits = Math.max(0, calculatedCredits)

  // Buscar pacotes de créditos ativos
  const { data: packages } = await supabase
    .from("credit_packages")
    .select("*")
    .eq("active", true)
    .order("price", { ascending: true })

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-card/30 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Comprar Créditos
            </h1>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
            <span className="text-sm text-muted-foreground">Créditos:</span>
            <span className="font-bold text-primary">{availableCredits}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Escolha seu pacote de créditos</h2>
            <p className="text-muted-foreground text-lg">
              Cada crédito permite uma interação com qualquer agente de IA
            </p>
          </div>

          {/* Passar pacotes para o componente */}
          <CreditsPackages packages={packages || []} />

          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Como funcionam os créditos?</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Cada mensagem enviada para um agente consome 1 crédito</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Os créditos não expiram e podem ser usados a qualquer momento</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Você recebeu 20 créditos grátis ao criar sua conta</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Pagamento seguro via Mercado Pago</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

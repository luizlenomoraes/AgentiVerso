import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { CreditsPackages } from "./credits-packages"

export default async function CreditsPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Buscar pacotes de créditos ativos
  const { data: packages } = await supabase
    .from("credit_packages")
    .select("*")
    .eq("active", true)
    .order("price", { ascending: true })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header da Página */}
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold font-orbitron">
            Comprar Créditos
          </h1>
        </div>

        <div className="text-center space-y-4 pt-4">
          <h2 className="text-4xl font-bold">Escolha seu pacote de créditos</h2>
          <p className="text-muted-foreground text-lg">
            Adquira créditos para potencializar seus agentes com IA de ponta
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
                <span>Cada ação consome créditos proporcionalmente à complexidade da entrega. Respostas mais simples usam menos, entregas profundas usam mais (1 crédito ≈ 1.000 tokens)</span>
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
    </div>
  )
}

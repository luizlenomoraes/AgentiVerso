"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Zap, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

const creditPackages = [
  { credits: 100, price: 10, popular: false },
  { credits: 500, price: 45, popular: true },
  { credits: 1000, price: 80, popular: false },
  { credits: 5000, price: 350, popular: false },
]

export function CreditsPackages() {
  const [loadingPkg, setLoadingPkg] = useState<number | null>(null)
  const router = useRouter()

  const handleBuy = async (pkg: { credits: number, price: number }) => {
    try {
      setLoadingPkg(pkg.credits)
      
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pkg),
      })

      const data = await response.json()

      if (data.url) {
        // Redireciona para o Mercado Pago
        window.location.href = data.url
      } else {
        alert("Erro ao iniciar pagamento")
      }
    } catch (error) {
      console.error("Erro:", error)
      alert("Erro de conexão")
    } finally {
      setLoadingPkg(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {creditPackages.map((pkg) => (
        <Card
          key={pkg.credits}
          className={`p-6 space-y-6 bg-card/50 backdrop-blur border-border/50 relative ${
            pkg.popular ? "border-primary ring-2 ring-primary/20" : ""
          }`}
        >
          {pkg.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-primary to-accent px-3 py-1 rounded-full text-xs font-semibold text-primary-foreground">
                Mais Popular
              </span>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-center">
              <Zap className={`w-12 h-12 ${pkg.popular ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <h3 className="text-3xl font-bold text-center">{pkg.credits}</h3>
            <p className="text-center text-muted-foreground text-sm">créditos</p>
          </div>

          <div className="text-center">
            <span className="text-4xl font-bold">R$ {pkg.price}</span>
            <p className="text-sm text-muted-foreground mt-1">
              R$ {(pkg.price / pkg.credits).toFixed(2)} por crédito
            </p>
          </div>

          <Button
            className={`w-full ${
              pkg.popular
                ? "bg-gradient-to-r from-primary to-accent hover:opacity-90"
                : "bg-secondary hover:bg-secondary/80"
            }`}
            onClick={() => handleBuy(pkg)}
            disabled={loadingPkg === pkg.credits}
          >
            {loadingPkg === pkg.credits ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Comprar"
            )}
          </Button>
        </Card>
      ))}
    </div>
  )
}

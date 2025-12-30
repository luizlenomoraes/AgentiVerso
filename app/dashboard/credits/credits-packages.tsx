"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Zap } from "lucide-react"

const creditPackages = [
  { credits: 100, price: 10, popular: false },
  { credits: 500, price: 45, popular: true },
  { credits: 1000, price: 80, popular: false },
  { credits: 5000, price: 350, popular: false },
]

export function CreditsPackages() {
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
            onClick={() => {
              alert("Integração com Mercado Pago será implementada aqui")
            }}
          >
            Comprar
          </Button>
        </Card>
      ))}
    </div>
  )
}

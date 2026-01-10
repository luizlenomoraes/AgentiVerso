"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Zap, Loader2, Check, Sparkles } from "lucide-react"

type Package = {
  id: string
  name: string
  amount: number
  price: number
  popular?: boolean
}

export function CreditsPackages({ packages }: { packages: any[] }) {
  const displayPackages = packages.length > 0 ? packages.map((pkg: any) => ({
    id: pkg.id,
    credits: pkg.amount,
    price: pkg.price,
    popular: pkg.name.toLowerCase().includes("popular") || pkg.name.toLowerCase().includes("plus"),
    name: pkg.name
  })) : []

  const [loadingPkg, setLoadingPkg] = useState<number | null>(null)

  const handleBuy = async (pkg: { id: string, credits: number, price: number }) => {
    try {
      setLoadingPkg(pkg.credits)

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id }),
      })

      const data = await response.json()

      if (data.pix?.qrCodeText) {
        // Appmax PIX - mostrar QR Code (pode redirecionar para página de pagamento)
        alert("PIX gerado! Copie o código: " + data.pix.qrCodeText)
      } else if (data.url) {
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

  if (displayPackages.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed border-primary/30 rounded-xl">
        <Zap className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">Nenhum pacote disponível no momento.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap justify-center gap-6">
      {displayPackages.map((pkg, index) => (
        <Card
          key={pkg.credits}
          className={`
                        relative w-full max-w-[280px] p-6 space-y-6 
                        bg-card/50 backdrop-blur transition-all duration-300
                        hover:shadow-[0_0_40px_rgba(0,255,249,0.15)] hover:-translate-y-1
                        animate-fade-in-up
                        ${pkg.popular
              ? "border-primary/50 ring-2 ring-primary/20 shadow-[0_0_30px_rgba(0,255,249,0.1)]"
              : "border-border/50 hover:border-primary/30"
            }
                    `}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* Popular Badge */}
          {pkg.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="flex items-center gap-1 bg-gradient-to-r from-primary to-accent px-4 py-1 rounded-full text-xs font-bold text-background shadow-lg">
                <Sparkles className="w-3 h-3" />
                Mais Popular
              </span>
            </div>
          )}

          {/* Credits Icon */}
          <div className="flex justify-center pt-2">
            <div className={`
                            p-4 rounded-2xl transition-all
                            ${pkg.popular
                ? "bg-primary/20 text-primary"
                : "bg-muted/30 text-muted-foreground"
              }
                        `}>
              <Zap className="w-10 h-10" />
            </div>
          </div>

          {/* Credits Amount */}
          <div className="text-center space-y-1">
            <h3 className={`text-4xl font-bold font-orbitron ${pkg.popular ? "text-primary" : ""}`}>
              {pkg.credits}
            </h3>
            <p className="text-muted-foreground text-sm uppercase tracking-wider">créditos</p>
          </div>

          {/* Price */}
          <div className="text-center space-y-1">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-muted-foreground text-lg">R$</span>
              <span className="text-4xl font-bold">{pkg.price}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              R$ {(pkg.price / pkg.credits).toFixed(2)} por crédito
            </p>
          </div>

          {/* Features */}
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-muted-foreground">
              <Check className="w-4 h-4 text-green-500" />
              Acesso a todos os agentes
            </li>
            <li className="flex items-center gap-2 text-muted-foreground">
              <Check className="w-4 h-4 text-green-500" />
              Sem prazo de validade
            </li>
            {pkg.popular && (
              <li className="flex items-center gap-2 text-primary font-medium">
                <Check className="w-4 h-4 text-primary" />
                Melhor custo-benefício
              </li>
            )}
          </ul>

          {/* Buy Button */}
          <Button
            className={`
                            w-full h-12 font-bold transition-all
                            ${pkg.popular
                ? "bg-gradient-to-r from-primary to-accent hover:opacity-90 text-background shadow-lg hover:shadow-primary/30"
                : "bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-background"
              }
                        `}
            onClick={() => handleBuy(pkg)}
            disabled={loadingPkg === pkg.credits}
          >
            {loadingPkg === pkg.credits ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Comprar Agora"
            )}
          </Button>
        </Card>
      ))}
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Package,
    Gift,
    Sparkles,
    Timer,
    Loader2,
    Copy,
    Check,
    QrCode,
    X
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Combo {
    id: string
    name: string
    description: string | null
    price: number
    original_price: number | null
    bonus_credits: number
    is_active: boolean
    valid_until: string | null
    agents: {
        id: string
        name: string
        photo_url: string | null
    }[]
}

interface CombosShowcaseProps {
    combos: Combo[]
}

export function CombosShowcase({ combos }: CombosShowcaseProps) {
    const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null)
    const [loading, setLoading] = useState(false)
    const [pixData, setPixData] = useState<{
        qrCode: string
        qrCodeText: string
        expiresAt: string
    } | null>(null)
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState("")

    // Filtrar apenas combos ativos e não expirados
    const activeCombos = combos.filter(c => {
        if (!c.is_active) return false
        if (c.valid_until && new Date(c.valid_until) < new Date()) return false
        return true
    })

    if (activeCombos.length === 0) return null

    const handlePurchase = async (combo: Combo) => {
        setLoading(true)
        setError("")
        setSelectedCombo(combo)

        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "combo",
                    comboId: combo.id,
                    paymentMethod: "pix",
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Erro ao processar compra")
            }

            if (data.pix) {
                setPixData(data.pix)
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleCopyPix = async () => {
        if (pixData?.qrCodeText) {
            await navigator.clipboard.writeText(pixData.qrCodeText)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleCloseModal = () => {
        setSelectedCombo(null)
        setPixData(null)
        setError("")
    }

    const getTimeRemaining = (validUntil: string) => {
        const now = new Date()
        const end = new Date(validUntil)
        const diff = end.getTime() - now.getTime()

        if (diff <= 0) return null

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

        if (days > 0) return `${days}d ${hours}h`
        return `${hours}h restantes`
    }

    return (
        <>
            <section className="space-y-4 animate-fade-in-up">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                    <h2 className="text-xl font-bold font-orbitron">
                        Promoções Especiais
                    </h2>
                    <Badge className="bg-accent/20 text-accent border-accent/30 animate-pulse">
                        🔥 Tempo Limitado
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeCombos.map((combo) => (
                        <Card
                            key={combo.id}
                            className="p-5 bg-gradient-to-br from-card/80 to-accent/5 border-accent/30 hover:border-accent/50 transition-all space-y-4 group"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <Package className="w-5 h-5 text-accent" />
                                    <h3 className="font-bold">{combo.name}</h3>
                                </div>
                                {combo.valid_until && (
                                    <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-500">
                                        <Timer className="w-3 h-3 mr-1" />
                                        {getTimeRemaining(combo.valid_until)}
                                    </Badge>
                                )}
                            </div>

                            {/* Description */}
                            {combo.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {combo.description}
                                </p>
                            )}

                            {/* Agents Preview */}
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {combo.agents.slice(0, 4).map((agent) => (
                                        <div
                                            key={agent.id}
                                            className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-sm border-2 border-background"
                                            title={agent.name}
                                        >
                                            {agent.photo_url || "🤖"}
                                        </div>
                                    ))}
                                    {combo.agents.length > 4 && (
                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs border-2 border-background">
                                            +{combo.agents.length - 4}
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {combo.agents.length} agentes inclusos
                                </span>
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-3">
                                {combo.original_price && (
                                    <span className="text-muted-foreground line-through text-sm">
                                        R$ {combo.original_price.toFixed(2)}
                                    </span>
                                )}
                                <span className="text-2xl font-bold text-accent">
                                    R$ {combo.price.toFixed(2)}
                                </span>
                                {combo.bonus_credits > 0 && (
                                    <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                                        <Gift className="w-3 h-3 mr-1" />
                                        +{combo.bonus_credits}
                                    </Badge>
                                )}
                            </div>

                            {/* CTA */}
                            <Button
                                onClick={() => handlePurchase(combo)}
                                disabled={loading && selectedCombo?.id === combo.id}
                                className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90"
                            >
                                {loading && selectedCombo?.id === combo.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <Sparkles className="w-4 h-4 mr-2" />
                                )}
                                Aproveitar Oferta
                            </Button>
                        </Card>
                    ))}
                </div>
            </section>

            {/* PIX Modal */}
            {selectedCombo && pixData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        onClick={handleCloseModal}
                    />

                    <Card className="relative z-10 w-full max-w-md p-6 bg-card border-accent/30 space-y-6 animate-fade-in-up">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4"
                            onClick={handleCloseModal}
                        >
                            <X className="w-4 h-4" />
                        </Button>

                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                                <QrCode className="w-8 h-8 text-green-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Pague com PIX</h2>
                                <p className="text-muted-foreground text-sm">
                                    {selectedCombo.name}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <div className="p-4 bg-white rounded-xl">
                                <img
                                    src={pixData.qrCode}
                                    alt="QR Code PIX"
                                    className="w-48 h-48"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground text-center">
                                Ou copie o código Pix Copia e Cola:
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={pixData.qrCodeText}
                                    readOnly
                                    className="flex-1 px-3 py-2 rounded-lg bg-muted/50 border text-xs font-mono truncate"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleCopyPix}
                                    className={cn(
                                        "transition-colors",
                                        copied && "text-green-500 border-green-500"
                                    )}
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>

                        <p className="text-xs text-center text-muted-foreground">
                            Após o pagamento, você receberá acesso a {selectedCombo.agents.length} agentes
                            {selectedCombo.bonus_credits > 0 && (
                                <> e <span className="text-green-500 font-bold">+{selectedCombo.bonus_credits}</span> créditos bônus</>
                            )}!
                        </p>

                        <Button
                            variant="outline"
                            onClick={handleCloseModal}
                            className="w-full"
                        >
                            Fechar
                        </Button>
                    </Card>
                </div>
            )}

            {/* Error Modal */}
            {selectedCombo && error && !pixData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        onClick={handleCloseModal}
                    />
                    <Card className="relative z-10 w-full max-w-sm p-6 bg-card space-y-4 animate-fade-in-up">
                        <div className="text-center">
                            <p className="text-destructive">{error}</p>
                        </div>
                        <Button onClick={handleCloseModal} className="w-full">
                            Fechar
                        </Button>
                    </Card>
                </div>
            )}
        </>
    )
}

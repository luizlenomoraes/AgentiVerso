"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AgentAvatar } from "@/components/agent-avatar"
import {
    X,
    Lock,
    Gift,
    Sparkles,
    Loader2,
    Copy,
    Check,
    QrCode
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Agent {
    id: string
    name: string
    description: string
    photo_url: string | null
    price?: number
    bonus_credits?: number
    categories?: { name: string } | null
}

interface AgentPurchaseModalProps {
    agent: Agent
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

export function AgentPurchaseModal({
    agent,
    isOpen,
    onClose,
    onSuccess
}: AgentPurchaseModalProps) {
    const [loading, setLoading] = useState(false)
    const [pixData, setPixData] = useState<{
        qrCode: string
        qrCodeText: string
        expiresAt: string
    } | null>(null)
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState("")

    if (!isOpen) return null

    const handlePurchase = async () => {
        setLoading(true)
        setError("")

        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "agent",
                    agentId: agent.id,
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

    const handleClose = () => {
        setPixData(null)
        setError("")
        onClose()
    }

    const price = agent.price || 0
    const bonusCredits = agent.bonus_credits || 0

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <Card className="relative z-10 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto p-5 md:p-6 bg-card border-accent/30 space-y-6 animate-fade-in-up shadow-2xl shadow-black/50">
                {/* Close button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 md:top-4 md:right-4 z-20"
                    onClick={handleClose}
                >
                    <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                </Button>

                {!pixData ? (
                    <>
                        {/* Header */}
                        <div className="text-center space-y-3 md:space-y-4 mt-2">
                            <div className="flex justify-center">
                                <AgentAvatar
                                    name={agent.name}
                                    emoji={agent.photo_url}
                                    size="xl"
                                    locked
                                />
                            </div>
                            <div>
                                <h2 className="text-lg md:text-xl font-bold flex items-center justify-center gap-2">
                                    <Lock className="w-5 h-5 text-accent" />
                                    Desbloquear Agente
                                </h2>
                                <p className="text-muted-foreground text-sm mt-1">
                                    {agent.name}
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground text-center line-clamp-3">
                            {agent.description}
                        </p>

                        {/* Price Card */}
                        <div className="p-4 rounded-xl bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-sm md:text-base">Acesso permanente</span>
                                <span className="text-xl md:text-2xl font-bold text-accent">
                                    R$ {price.toFixed(2)}
                                </span>
                            </div>

                            {bonusCredits > 0 && (
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                                    <Gift className="w-5 h-5 text-green-500 shrink-0" />
                                    <span className="text-green-500 font-medium text-xs md:text-sm">
                                        +{bonusCredits} créditos de bônus!
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Benefits */}
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                                Acesso ilimitado ao agente
                            </li>
                            <li className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                                Sem data de expiração
                            </li>
                            {bonusCredits > 0 && (
                                <li className="flex items-center gap-2">
                                    <Gift className="w-4 h-4 text-green-500 shrink-0" />
                                    {bonusCredits} créditos para começar
                                </li>
                            )}
                        </ul>

                        {/* Error */}
                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center">
                                {error}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col-reverse md:flex-row gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                className="flex-1"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handlePurchase}
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 h-11"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <QrCode className="w-4 h-4 mr-2" />
                                )}
                                Pagar com PIX
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="space-y-6 pt-2">
                        {/* PIX Payment View */}
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 mx-auto rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
                                <QrCode className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Pague com PIX</h2>
                                <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">
                                    Escaneie o QR Code abaixo com o app do seu banco
                                </p>
                            </div>
                        </div>

                        {/* QR Code Display */}
                        <div className="flex justify-center">
                            <div className="p-2 md:p-4 bg-white rounded-xl shadow-inner max-w-full">
                                <img
                                    src={pixData.qrCode}
                                    alt="QR Code PIX"
                                    className="w-48 h-48 md:w-56 md:h-56 object-contain mx-auto"
                                />
                            </div>
                        </div>

                        {/* Copy Code */}
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground text-center uppercase tracking-wider font-semibold">
                                Pix Copia e Cola
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={pixData.qrCodeText}
                                    readOnly
                                    className="flex-1 px-3 py-3 rounded-lg bg-muted/50 border text-xs font-mono text-muted-foreground w-full min-w-0"
                                    onClick={(e) => e.currentTarget.select()}
                                />
                                <Button
                                    size="icon"
                                    onClick={handleCopyPix}
                                    className={cn(
                                        "shrink-0 transition-all active:scale-95",
                                        copied ? "bg-green-500 hover:bg-green-600" : ""
                                    )}
                                >
                                    {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>

                        {/* Instructions footer */}
                        <div className="p-3 rounded-lg bg-accent/5 border border-accent/10 text-center space-y-1">
                            <p className="text-xs text-muted-foreground">
                                Após o pagamento, o acesso é liberado em segundos.
                            </p>
                            <p className="text-xs font-medium text-green-400">
                                +{bonusCredits} créditos de bônus inclusos
                            </p>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}

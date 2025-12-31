"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Loader2, Plus, Trash2, CreditCard } from "lucide-react"
import Link from "next/link"

export default function PlansAdminPage() {
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [packages, setPackages] = useState<any[]>([])

    useEffect(() => {
        async function fetchPlans() {
            try {
                const response = await fetch("/api/admin/packages")
                const data = await response.json()
                setPackages(data)
            } catch (error) {
                console.error("Erro ao carregar planos")
            } finally {
                setFetching(false)
            }
        }
        fetchPlans()
    }, [])

    const addPackage = () => {
        setPackages([...packages, { id: Date.now().toString(), name: "Novo Plano", amount: 100, price: 50.00 }])
    }

    const removePackage = (id: string) => {
        setPackages(packages.filter(p => p.id !== id))
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/admin/packages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(packages),
            })

            if (response.ok) {
                alert("Pacotes atualizados com sucesso!")
            } else {
                alert("Erro ao salvar pacotes. Verifique se a tabela 'credit_packages' existe no Supabase.")
            }
        } catch (error) {
            alert("Erro de conexão")
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border/40 bg-card/30 backdrop-blur-xl">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/admin">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                        Gestão de Planos e Preços
                    </h1>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold">Pacotes de Créditos</h2>
                            <p className="text-sm text-muted-foreground">Estes pacotes aparecerão para os usuários comprarem via Mercado Pago.</p>
                        </div>
                        <Button onClick={addPackage} variant="outline" className="border-primary/50 text-primary">
                            <Plus className="w-4 h-4 mr-2" /> Adicionar Pacote
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {packages.map((pkg, index) => (
                            <Card key={pkg.id} className="p-6 bg-card/50 backdrop-blur border-border/50">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase text-muted-foreground">Nome do Plano</label>
                                        <Input
                                            value={pkg.name}
                                            onChange={(e) => {
                                                const newPkgs = [...packages];
                                                newPkgs[index].name = e.target.value;
                                                setPackages(newPkgs);
                                            }}
                                            placeholder="Ex: Start"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase text-muted-foreground">Créditos</label>
                                        <Input
                                            type="number"
                                            value={pkg.amount}
                                            onChange={(e) => {
                                                const newPkgs = [...packages];
                                                newPkgs[index].amount = e.target.value;
                                                setPackages(newPkgs);
                                            }}
                                            placeholder="Ex: 100"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase text-muted-foreground">Preço (R$)</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={pkg.price}
                                            onChange={(e) => {
                                                const newPkgs = [...packages];
                                                newPkgs[index].price = e.target.value;
                                                setPackages(newPkgs);
                                            }}
                                            placeholder="Ex: 49.90"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="destructive" size="icon" onClick={() => removePackage(pkg.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="flex justify-end pt-6">
                        <Button
                            onClick={handleSave}
                            disabled={loading}
                            className="w-full md:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 px-8"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Salvar Alterações
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    )
}

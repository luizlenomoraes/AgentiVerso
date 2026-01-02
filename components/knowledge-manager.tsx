"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, FileText, Trash2, Loader2, Database, Sparkles } from "lucide-react"
import Link from "next/link"

type Document = {
    id: string
    content: string
    metadata: { title: string }
    created_at: string
}

type Props = {
    agent: any
    initialDocuments: Document[]
}

export function KnowledgeManager({ agent, initialDocuments }: Props) {
    const router = useRouter()
    const [documents, setDocuments] = useState<Document[]>(initialDocuments)
    const [uploading, setUploading] = useState(false)
    const [extracting, setExtracting] = useState(false)
    const [dragActive, setDragActive] = useState(false)

    const [form, setForm] = useState({
        title: "",
        content: "",
    })

    // Upload de arquivo
    const handleFileUpload = async (file: File) => {
        setExtracting(true)
        try {
            const formData = new FormData()
            formData.append("file", file)

            const response = await fetch("/api/admin/extract-text", {
                method: "POST",
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) throw new Error(data.error)

            setForm({
                title: file.name.replace(/\.[^/.]+$/, ""),
                content: data.text,
            })
        } catch (error: any) {
            alert(error.message)
        } finally {
            setExtracting(false)
        }
    }

    // Drag & Drop
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0])
        }
    }

    // Salvar documento
    const handleSave = async () => {
        if (!form.content.trim()) {
            alert("Conteúdo não pode estar vazio")
            return
        }

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append("agentId", agent.id)
            formData.append("content", form.content)
            formData.append("title", form.title || "Documento sem título")

            const response = await fetch("/api/admin/knowledge", {
                method: "POST",
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) throw new Error(data.error)

            setDocuments([data.document, ...documents])
            setForm({ title: "", content: "" })
            alert("✅ Documento adicionado com sucesso!")
        } catch (error: any) {
            alert("❌ " + error.message)
        } finally {
            setUploading(false)
        }
    }

    // Deletar documento
    const handleDelete = async (docId: string) => {
        if (!confirm("Tem certeza que deseja deletar este documento?")) return

        try {
            const response = await fetch(`/api/admin/knowledge?id=${docId}`, {
                method: "DELETE",
            })

            if (!response.ok) throw new Error("Erro ao deletar")

            setDocuments(documents.filter((d) => d.id !== docId))
        } catch (error: any) {
            alert(error.message)
        }
    }

    return (
        <div className="min-h-screen bg-background relative">
            <div className="cyber-grid" />

            <header className="border-b border-border/40 bg-card/30 backdrop-blur-xl sticky top-0 z-50 relative">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href={`/admin/agents/${agent.id}`}>
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold font-orbitron bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Base de Conhecimento
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {agent.name} • {documents.length} documentos
                        </p>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

                    {/* UPLOAD AREA */}
                    <Card className="glass-panel neon-border p-4 sm:p-6 space-y-4 sm:space-y-6">
                        <div className="flex items-center gap-3 text-primary">
                            <Upload className="w-6 h-6" />
                            <h2 className="text-xl font-bold font-orbitron">Adicionar Conhecimento</h2>
                        </div>

                        {/* Drag & Drop Zone */}
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${dragActive
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                                }`}
                        >
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                accept=".pdf,.docx,.txt,.md"
                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <FileText className="w-12 h-12 mx-auto mb-4 text-primary" />
                                <p className="font-bold text-foreground mb-2">
                                    Arraste arquivos ou clique para selecionar
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    PDF, DOCX, TXT, MD (máx. 10MB)
                                </p>
                            </label>
                        </div>

                        {extracting && (
                            <div className="flex items-center justify-center gap-2 text-primary">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Extraindo texto...</span>
                            </div>
                        )}

                        {/* Form */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-primary mb-2">Título</label>
                                <Input
                                    placeholder="Ex: Manual do Produto X"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="bg-background/50 border-primary/30 focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-primary mb-2">Conteúdo</label>
                                <Textarea
                                    placeholder="Cole ou escreva o conteúdo do conhecimento..."
                                    rows={12}
                                    value={form.content}
                                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                                    className="bg-background/50 border-primary/30 focus:border-primary font-mono text-sm"
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                    {form.content.length} caracteres
                                </p>
                            </div>

                            <Button
                                onClick={handleSave}
                                disabled={uploading || !form.content}
                                className="w-full cyber-button bg-primary/10 hover:bg-primary text-primary hover:text-background border border-primary"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        seeds Adicionar à Base
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>

                    {/* LISTA DE DOCUMENTOS */}
                    <Card className="glass-panel neon-border p-6 space-y-6">
                        <div className="flex items-center gap-3 text-accent">
                            <Database className="w-6 h-6" />
                            <h2 className="text-xl font-bold font-orbitron">Documentos Indexados</h2>
                        </div>

                        {documents.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Database className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p>Nenhum documento na base ainda</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                {documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 transition-all group"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-foreground truncate">
                                                    {doc.metadata.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                    {doc.content.substring(0, 150)}...
                                                </p>
                                                <p className="text-xs text-muted-foreground/70 mt-2">
                                                    {new Date(doc.created_at).toLocaleDateString("pt-BR")} •{" "}
                                                    {doc.content.length} chars
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(doc.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </main>
        </div>
    )
}

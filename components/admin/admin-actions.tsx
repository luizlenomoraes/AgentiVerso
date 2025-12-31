"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Loader2, Trash2, Edit, Pencil } from "lucide-react"

// --- AÇÕES DE AGENTE ---

export function AgentActions({ agentId }: { agentId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este agente?")) return

    setLoading(true)
    const { error } = await supabase.from("agents").delete().eq("id", agentId)

    if (error) {
      alert("Erro ao excluir: " + error.message)
    } else {
      router.refresh() // Recarrega a lista
    }
    setLoading(false)
  }

  return (
    <div className="flex gap-2">
      <Button 
        size="sm" 
        variant="outline" 
        className="flex-1 bg-transparent"
        onClick={() => router.push(`/admin/agents/${agentId}`)} // Rota de Edição
      >
        <Edit className="w-4 h-4 mr-2" /> Editar
      </Button>
      <Button 
        size="sm" 
        variant="destructive" 
        className="flex-1"
        onClick={handleDelete}
        disabled={loading}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />} 
        Excluir
      </Button>
    </div>
  )
}

// --- AÇÕES DE USUÁRIO ---

export function UserActions({ userId }: { userId: string }) {
  const router = useRouter()
  
  return (
    <div className="flex gap-2">
      <Button 
        size="sm" 
        variant="outline" 
        className="text-xs bg-transparent"
        onClick={() => router.push(`/admin/users/${userId}`)}
      >
        <Pencil className="w-3 h-3 mr-1" /> Editar
      </Button>
    </div>
  )
}

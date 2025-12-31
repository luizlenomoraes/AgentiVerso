"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Users, Bot, Settings, Loader2, CreditCard } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { AgentActions, UserActions } from "@/components/admin/admin-actions"

type Agent = {
  id: string
  name: string
  description: string
  photo_url: string | null
  is_public: boolean
  categories: { name: string } | null
}

type Profile = {
  id: string
  full_name: string | null
  total_credits: number
  used_credits: number
  is_admin: boolean
}

export default function AdminPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [agents, setAgents] = useState<Agent[]>([])
  const [users, setUsers] = useState<Profile[]>([])

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      // Verificar se o usuário está logado e é admin
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single()

      if (!profile?.is_admin) {
        router.push("/dashboard")
        return
      }

      setIsAdmin(true)

      // Buscar agentes
      const { data: agentsData } = await supabase
        .from("agents")
        .select("*, categories(name)")
        .order("created_at", { ascending: false })

      if (agentsData) setAgents(agentsData)

      // Buscar usuários
      const { data: usersData } = await supabase
        .from("profiles")
        .select("*")

      if (usersData) setUsers(usersData)

      setLoading(false)
    }

    checkAdminAndFetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Painel Admin
            </h1>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="bg-transparent">
              <Link href="/admin/plans">
                <CreditCard className="w-4 h-4 mr-2" />
                Planos
              </Link>
            </Button>
            <Button asChild variant="outline" className="bg-transparent">
              <Link href="/admin/settings">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList className="bg-card/50 backdrop-blur border border-border/50">
            <TabsTrigger value="agents" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Agentes
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Usuários
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Gerenciar Agentes</h2>
                <p className="text-muted-foreground">Crie e gerencie agentes de IA</p>
              </div>
              <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Link href="/admin/agents/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Agente
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Card
                  key={agent.id}
                  className="p-6 space-y-4 bg-card/50 backdrop-blur border-border/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl flex-shrink-0">
                      {agent.photo_url || "🤖"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{agent.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {agent.categories && (
                          <Badge variant="secondary" className="text-xs">
                            {agent.categories.name}
                          </Badge>
                        )}
                        <Badge variant={agent.is_public ? "default" : "outline"} className="text-xs">
                          {agent.is_public ? "Público" : "Privado"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{agent.description}</p>
                  <AgentActions agentId={agent.id} />
                </Card>
              ))}

              {agents.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Bot className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum agente cadastrado ainda.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
              <p className="text-muted-foreground">Veja e edite usuários da plataforma</p>
            </div>

            <Card className="bg-card/50 backdrop-blur border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left p-4 font-medium">Usuário</th>
                      <th className="text-left p-4 font-medium">Créditos</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-right p-4 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-t border-border/50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{user.full_name || "Sem nome"}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-primary">
                            {user.total_credits - user.used_credits}
                          </span>
                          <span className="text-muted-foreground text-sm"> / {user.total_credits}</span>
                        </td>
                        <td className="p-4">
                          {user.is_admin ? (
                            <Badge className="bg-primary/20 text-primary border-primary/30">Admin</Badge>
                          ) : (
                            <Badge variant="secondary">Usuário</Badge>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <UserActions userId={user.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

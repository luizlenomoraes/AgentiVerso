import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, MessageSquare, Zap, Bot } from "lucide-react"

export default async function AdminPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile?.is_admin) {
    redirect("/dashboard")
  }

  // Get statistics
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { count: totalAgents } = await supabase.from("agents").select("*", { count: "exact", head: true })

  const { count: totalMessages } = await supabase.from("messages").select("*", { count: "exact", head: true })

  const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  const totalCreditsDistributed = profiles?.reduce((sum, p) => sum + p.total_credits, 0) || 0
  const totalCreditsUsed = profiles?.reduce((sum, p) => sum + p.used_credits, 0) || 0

  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(10)

  const { data: agents } = await supabase
    .from("agents")
    .select("*, categories(name)")
    .order("created_at", { ascending: false })

  const { data: usageLogs } = await supabase
    .from("usage_logs")
    .select("*, profiles(full_name), agents(name)")
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/admin"
            className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
          >
            AgentiVerso Admin
          </Link>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/dashboard">Ver como Usuário</Link>
            </Button>
            <form
              action={async () => {
                "use server"
                const supabase = await getSupabaseServerClient()
                await supabase.auth.signOut()
                redirect("/login")
              }}
            >
              <Button variant="ghost" type="submit">
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gerencie agentes, usuários e monitore o sistema</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 space-y-2 bg-card/50 backdrop-blur border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total de Usuários</span>
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold">{totalUsers || 0}</p>
            </Card>

            <Card className="p-6 space-y-2 bg-card/50 backdrop-blur border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total de Agentes</span>
                <Bot className="w-5 h-5 text-accent" />
              </div>
              <p className="text-3xl font-bold">{totalAgents || 0}</p>
            </Card>

            <Card className="p-6 space-y-2 bg-card/50 backdrop-blur border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Mensagens Enviadas</span>
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold">{totalMessages || 0}</p>
            </Card>

            <Card className="p-6 space-y-2 bg-card/50 backdrop-blur border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Créditos Usados</span>
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <p className="text-3xl font-bold">{totalCreditsUsed}</p>
              <p className="text-xs text-muted-foreground">de {totalCreditsDistributed} distribuídos</p>
            </Card>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="bg-card/50 backdrop-blur border border-border/50">
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="agents">Agentes</TabsTrigger>
              <TabsTrigger value="logs">Logs de Auditoria</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Gerenciar Usuários</h2>
              </div>

              <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-4 pb-2 border-b border-border/50 text-sm font-medium text-muted-foreground">
                    <div>Nome</div>
                    <div>Email</div>
                    <div>Créditos Totais</div>
                    <div>Créditos Usados</div>
                    <div>Ações</div>
                  </div>

                  {recentUsers && recentUsers.length > 0 ? (
                    recentUsers.map((user) => (
                      <div
                        key={user.id}
                        className="grid grid-cols-5 gap-4 items-center py-2 border-b border-border/50 last:border-0"
                      >
                        <div className="font-medium truncate">{user.full_name || "Sem nome"}</div>
                        <div className="text-sm text-muted-foreground truncate">{user.id.substring(0, 20)}...</div>
                        <div className="text-sm">{user.total_credits}</div>
                        <div className="text-sm">{user.used_credits}</div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-xs bg-transparent">
                            Editar
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado</p>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="agents" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Gerenciar Agentes</h2>
                <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  <Link href="/admin/agents/new">Criar Novo Agente</Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents && agents.length > 0 ? (
                  agents.map((agent) => (
                    <Card
                      key={agent.id}
                      className="p-6 space-y-4 bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl flex-shrink-0">
                          {agent.photo_url || "🤖"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">{agent.name}</h3>
                          {agent.categories && (
                            <span className="text-xs text-muted-foreground">{agent.categories.name}</span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{agent.description}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          Editar
                        </Button>
                        <Button size="sm" variant="destructive" className="flex-1">
                          Excluir
                        </Button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">Nenhum agente criado ainda</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Logs de Auditoria</h2>
              </div>

              <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 pb-2 border-b border-border/50 text-sm font-medium text-muted-foreground">
                    <div>Usuário</div>
                    <div>Agente</div>
                    <div>Créditos Usados</div>
                    <div>Data</div>
                  </div>

                  {usageLogs && usageLogs.length > 0 ? (
                    usageLogs.map((log) => (
                      <div
                        key={log.id}
                        className="grid grid-cols-4 gap-4 items-center py-2 border-b border-border/50 last:border-0"
                      >
                        <div className="text-sm truncate">{log.profiles?.full_name || "Usuário desconhecido"}</div>
                        <div className="text-sm truncate">{log.agents?.name || "Agente desconhecido"}</div>
                        <div className="text-sm">{log.tokens_used} créditos</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(log.created_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">Nenhum log encontrado</p>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

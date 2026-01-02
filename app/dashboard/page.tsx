import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button" // Certifique-se de importar o Button
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditStats } from "@/components/credit-stats"
import { ConversationHistory } from "@/components/conversation-history"
import { ShieldAlert } from "lucide-react" // Ícone para o botão de admin

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: agents } = await supabase
    .from("agents")
    .select("*, categories(name, slug)")
    .eq("is_public", true)
    .order("created_at", { ascending: false })

  const { data: categories } = await supabase.from("categories").select("*").order("name")

  // Get user's conversations
  const { data: conversations } = await supabase
    .from("conversations")
    .select("*, agent_id, agents(name, photo_url)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(10)

  // Get usage logs for stats
  const { data: usageLogs } = await supabase
    .from("usage_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  const calculatedCredits = (profile?.total_credits || 0) - (profile?.used_credits || 0)
  const availableCredits = Math.max(0, calculatedCredits)

  return (
    <div className="min-h-screen bg-background relative">
      {/* Grid de fundo cyberpunk */}
      <div className="cyber-grid" />

      <header className="border-b border-border/40 bg-card/30 backdrop-blur-xl sticky top-0 z-50 relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

        <div className="container mx-auto px-2 sm:px-4 py-3 flex items-center justify-between gap-2">
          <Link
            href="/dashboard"
            className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent font-orbitron"
          >
            AgentiVerso
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">

            {/* Botão Admin */}
            {profile?.is_admin && (
              <Button asChild variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10 transition-all hide-mobile">
                <Link href="/admin" className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              </Button>
            )}

            {/* BOTÃO DE CRÉDITOS MELHORADO */}
            <Link href="/dashboard/credits" className="relative">
              <div className="credits-badge flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all cursor-pointer attention-pulse">
                <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">Créditos:</span>
                <span className="text-xs sm:text-sm md:text-base font-bold text-primary">{availableCredits}</span>
              </div>
            </Link>

            <form
              action={async () => {
                "use server"
                const supabase = await getSupabaseServerClient()
                await supabase.auth.signOut()
                redirect("/login")
              }}
            >
              <Button variant="ghost" type="submit" size="sm" className="hover:text-destructive transition-colors text-xs sm:text-sm">
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="agents" className="space-y-8">
          <TabsList className="bg-card/50 backdrop-blur border border-border/50">
            <TabsTrigger value="agents">Agentes</TabsTrigger>
            <TabsTrigger value="conversations">Conversas</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">Bem-vindo, {profile?.full_name || "Usuário"}</h1>
              <p className="text-muted-foreground">Escolha um agente de IA para começar a conversar</p>
            </div>

            {categories && categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors">
                  Todos
                </Badge>
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 transition-colors"
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents && agents.length > 0 ? (
                agents.map((agent) => (
                  <Card
                    key={agent.id}
                    className="p-6 space-y-4 bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl flex-shrink-0">
                        {agent.photo_url || "🤖"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{agent.name}</h3>
                        {agent.categories && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {agent.categories.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{agent.description}</p>
                    <Button asChild className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                      <Link href={`/chat/${agent.id}`}>Conversar</Link>
                    </Button>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">Nenhum agente disponível no momento.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="conversations">
            <ConversationHistory conversations={conversations || []} />
          </TabsContent>

          <TabsContent value="stats">
            <CreditStats profile={profile} usageLogs={usageLogs || []} availableCredits={availableCredits} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

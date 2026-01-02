import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditStats } from "@/components/credit-stats"
import { ConversationHistory } from "@/components/conversation-history"

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
    <div className="container mx-auto px-4 py-8">
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
    </div>
  )
}

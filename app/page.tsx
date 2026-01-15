import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card } from "@/components/ui/card"
import { AgentCarousel } from "@/components/agent-carousel"
import { Check, Sparkles, Brain, Lock, Zap, ArrowRight, User } from "lucide-react"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export default async function HomePage() {
  // Fetch public agents for the carousel
  const supabase = await getSupabaseServerClient()
  const { data: agents, error } = await supabase
    .from("agents")
    .select("id, name, description")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(10)

  // Debug logging
  console.log("[Landing Page] Agents fetched:", agents?.length || 0, "Error:", error?.message || "none")

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden font-sans selection:bg-primary/30">
      <SiteHeader />

      {/* Cyber Background */}
      <div className="cyber-grid fixed inset-0 z-0 opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background z-0 pointer-events-none" />

      <main className="flex-1 relative z-10 pt-20">

        {/* HERO / HEADLINE */}
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-24">
          <div className="container mx-auto px-4 text-center max-w-4xl space-y-8">
            <div className="inline-block px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-4 animate-fade-in-up">
              <span className="text-sm font-bold text-primary tracking-[0.2em] uppercase">
                Uma Carta Aberta Para Todo Empreendedor
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] font-orbitron drop-shadow-[0_0_25px_rgba(0,255,249,0.3)] animate-fade-in-up stagger-1">
              Descubra como acessar a nova geração de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Agentes de Elite</span> com "Memória Infinita"
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed animate-fade-in-up stagger-2">
              Sem pagar mensalidades absurdas e sem precisar repetir suas instruções a cada 10 minutos.
            </p>

            <div className="animate-fade-in-up stagger-3 pt-4">
              <Button asChild className="h-16 px-8 text-xl font-bold bg-gradient-to-r from-primary to-accent !text-zinc-950 hover:opacity-90 shadow-[0_0_30px_rgba(0,255,249,0.3)] hover:scale-105 transition-all rounded-xl">
                <Link href="/signup" className="flex items-center gap-2">
                  QUERO ACESSAR AGORA <ArrowRight className="w-6 h-6" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* LETTER BODY */}
        <section className="pb-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto bg-card/30 backdrop-blur-xl border border-primary/10 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
              {/* Decorative Line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

              {/* Sender Info */}
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border/40">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong className="text-foreground">De:</strong> Luiz / Fundador do AgentiVerso</p>
                  <p><strong className="text-foreground">Assunto:</strong> O fim do "Ctrl+C, Ctrl+V" nos seus prompts.</p>
                </div>
              </div>

              {/* Letter Content */}
              <div className="prose prose-invert prose-lg max-w-none text-muted-foreground leading-relaxed space-y-6">
                <p>Caro colega,</p>

                <p>Se você usa Inteligência Artificial para trabalhar, você conhece essa dor.</p>

                <p>Você começa uma conversa com o ChatGPT ou Gemini. Você gasta 15 minutos "ensinando" o robô. Você cola seus PDFs, explica o tom de voz da sua marca, define as regras do jogo. O robô parece um gênio. As respostas são incríveis.</p>

                <p className="font-semibold text-foreground border-l-4 border-primary pl-4 py-1 bg-primary/5">
                  Você sente que finalmente tem um "sócio" digital.
                </p>

                <p>Mas então, acontece o inevitável.</p>

                <p>Você faz a décima pergunta e... <span className="text-red-400 font-bold">o robô "emburrece".</span></p>

                <p>Ele esquece o que você disse no começo. Ele começa a alucinar. Ele perde o contexto. E lá vai você, frustrado, ter que colar todo o "Prompt do Sistema" novamente.</p>

                <p>É como contratar um estagiário que tem a memória de um peixinho dourado.</p>

                <p>Isso me deixava louco. Eu sabia que a tecnologia (LLMs) era poderosa, mas a "interface" estava quebrada. As empresas cobram caro por mensalidades e te entregam uma janela de contexto que, na prática, te obriga a trabalhar dobrado.</p>

                <p>Foi por isso que eu parei tudo o que estava fazendo para construir o <strong>AgentiVerso</strong>.</p>

                <h3 className="text-2xl font-bold text-white pt-6 font-orbitron">O Segredo Que As Grandes Empresas de IA Não Te Contam</h3>

                <p>O problema não é a inteligência do modelo. O problema é o <strong>Custo de Memória</strong>.</p>

                <p>Toda vez que você fala com uma IA, ela precisa "reler" todo o histórico da conversa. Isso custa uma fortuna em processamento. Por isso, as interfaces comuns "cortam" a memória do seu robô para economizar o dinheiro deles.</p>

                <p>Eu decidi jogar um jogo diferente.</p>

                <p>Eu implementei uma nova tecnologia chamada <strong>Dynamic Context Caching (Cache de Contexto Dinâmico)</strong> usando os modelos mais avançados do planeta: a Série 5 da OpenAI e a Série 3 do Google.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CAROUSEL / SOLUTION */}
        <section className="py-16 relative bg-card/20 border-y border-primary/10 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10 pointer-events-none" />

          <div className="container mx-auto px-4 text-center mb-10 relative z-20">
            <h2 className="text-3xl md:text-5xl font-bold font-orbitron mb-4">Apresentando: <span className="text-primary">O AgentiVerso</span></h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Não somos mais um "wrapper". Somos um ecossistema de inteligência de elite onde absorvemos o custo da memória para você.
            </p>
          </div>

          <AgentCarousel agents={agents || []} />

          <div className="container mx-auto px-4 text-center mt-10 relative z-20">
            <p className="text-xl font-medium text-white max-w-3xl mx-auto">
              "Um Agente que nunca esquece, que fica mais inteligente a cada interação, e que custa centavos para operar."
            </p>
          </div>
        </section>

        {/* FEATURES / BENEFITS */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <Feature
                icon={<Brain className="w-8 h-8 text-primary" />}
                title="A Elite da IA"
                desc="GPT-5 (Omni Series) e Gemini 3 Pro. Modelos com Raciocínio Avançado capazes de resolver problemas que fariam o GPT-4 chorar."
              />
              <Feature
                icon={<Zap className="w-8 h-8 text-yellow-400" />}
                title="Sistema Justo (Pay-as-you-go)"
                desc="Odeia assinar algo por R$ 100/mês e não usar? Eu também. Seus créditos nunca expiram. Você paga apenas pelo que consome."
              />
              <Feature
                icon={<Lock className="w-8 h-8 text-accent" />}
                title="Múltiplas Personalidades"
                desc="Pare de pular de aba em aba. Tenha seu mentor de negócios e seu dev sênior na mesma dashboard, compartilhando contexto."
              />
            </div>
          </div>
        </section>

        {/* PRICING / OFFER */}
        <section className="py-24 relative overflow-hidden" id="pricing">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto bg-card/60 backdrop-blur-xl border border-primary/30 rounded-3xl p-8 md:p-16 text-center shadow-[0_0_50px_rgba(0,255,249,0.15)]">
              <h2 className="text-3xl md:text-5xl font-bold font-orbitron mb-6">Mas, quanto custa essa brincadeira?</h2>

              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed mb-10">
                <p>Se você fosse assinar o ChatGPT Plus, o Claude Pro e o Gemini Advanced, gastaria mais de <strong className="text-white">R$ 350,00 todos os meses.</strong></p>
                <p>No AgentiVerso, eu quis fazer uma oferta tão absurda que você se sentiria estúpido em dizer não.</p>
              </div>

              {/* OFFER BOX */}
              <div className="bg-gradient-to-b from-primary/10 to-transparent border border-primary/50 rounded-2xl p-8 mb-10 transform hover:scale-[1.02] transition-transform duration-300">
                <h3 className="text-2xl font-bold text-white mb-2">Pacote Starter</h3>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-5xl font-black text-primary font-orbitron">R$ 27</span>
                  <span className="text-sm text-muted-foreground text-left leading-tight">Pagamento<br />Único</span>
                </div>
                <ul className="text-left max-w-xs mx-auto space-y-3 mb-8">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> 300 Créditos Iniciais</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> Acesso a GPT-5 e Gemini 3</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> Memória Infinita (Grátis)</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> Créditos nunca expiram</li>
                </ul>
                <Button asChild size="lg" className="w-full h-14 text-lg font-bold bg-primary !text-zinc-950 hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(0,255,249,0.5)]">
                  <Link href="/signup">GARANTIR MEU ACESSO AGORA</Link>
                </Button>
              </div>

              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                <strong>Gatilho da Transparência:</strong> Eu estou subsidiando o custo da memória porque sei que você vai viciar na produtividade. Mas meus servidores têm limite físico. Aproveite antes que a fila de espera ative.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER NOTE */}
        <section className="pb-24 pt-10 text-center">
          <div className="container mx-auto px-4 max-w-2xl text-muted-foreground">
            <p className="italic">
              "P.S.: Muita gente pergunta sobre a diferença entre o modelo 'Mini' e o 'Pro'. O Mini resolve 90% das tarefas. O Pro é para raciocínio pesado. Aqui você alterna com um clique."
            </p>
            <p className="mt-8 font-bold text-primary">Te vejo do outro lado,<br />Luiz</p>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  )
}

function Feature({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <Card className="p-8 bg-card/40 border-primary/10 hover:border-primary/30 transition-all hover:-translate-y-1">
      <div className="w-14 h-14 rounded-2xl bg-background/50 flex items-center justify-center mb-6 border border-white/5">
        {icon}
      </div>
      <h3 className="text-xl font-bold font-orbitron mb-3 text-white">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </Card>
  )
}

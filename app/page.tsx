import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ArrowRight, Brain, Database, ShieldCheck, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden font-sans">
      <SiteHeader />

      {/* Background Effects */}
      <div className="cyber-grid fixed inset-0 z-0 pointer-events-none opacity-40" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0 pointer-events-none" />

      <main className="flex-1 relative z-10 pt-20">
        {/* HERO SECTION */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="container mx-auto px-4 text-center space-y-8 relative z-10">
            <div className="inline-block p-1 rounded-full bg-primary/10 border border-primary/30 mb-4 animate-fade-in-up">
              <span className="px-3 py-1 text-xs md:text-sm font-semibold text-primary uppercase tracking-widest">
                🚀 A Próxima Geração de IA
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white font-orbitron drop-shadow-[0_0_15px_rgba(0,255,249,0.3)]">
              INTELIGÊNCIA <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-accent animate-gradient-x">
                DESCENTRALIZADA
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Acesse uma rede de agentes especializados com memória persistente e acesso
              aos seus documentos privados. O futuro do trabalho começa aqui.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button asChild className="cyber-button text-lg h-14 px-8 min-w-[200px] hover:scale-105 transition-transform duration-300">
                <Link href="/signup">
                  INICIAR ACESSO <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="text-lg h-14 px-8 min-w-[200px] border-primary/30 hover:bg-primary/10 hover:text-primary transition-all">
                <Link href="/login">JÁ SOU MEMBRO</Link>
              </Button>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[120px] translate-y-1/3 translate-x-1/3" />
        </section>

        {/* FEATURES GRID */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold font-orbitron">Tecnologia de Ponta</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Nossa arquitetura combina os modelos mais avançados com segurança de nível empresarial.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={<Brain className="w-10 h-10 text-primary" />}
                title="Multi-LLM Core"
                description="Alterne instantaneamente entre Gemini 2.5, GPT-4, Claude 3.5 e Grok. O melhor modelo para cada tarefa."
              />
              <FeatureCard
                icon={<Database className="w-10 h-10 text-accent" />}
                title="RAG Avançado"
                description="Upload de PDFs e Docs. Seus agentes leem e respondem com base na sua própria base de conhecimento."
              />
              <FeatureCard
                icon={<Zap className="w-10 h-10 text-yellow-400" />}
                title="Memória Persistente"
                description="Seus agentes lembram de conversas passadas. Contexto infinito para continuidade perfeita."
              />
              <FeatureCard
                icon={<ShieldCheck className="w-10 h-10 text-green-400" />}
                title="Segurança Total"
                description="Dados criptografados e isolados. Seus documentos nunca treinam modelos públicos."
              />
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 backdrop-blur-sm" />
          <div className="container mx-auto px-4 relative z-10 text-center space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold font-orbitron text-white">
              Pronto para o <span className="text-primary">Upgrade?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Junte-se a milhares de profissionais que já estão utilizando inteligência artificial para multiplicar sua produtividade.
            </p>
            <div className="inline-block p-[2px] rounded-lg bg-gradient-to-r from-primary via-white to-primary animate-pulse">
              <Button asChild className="bg-background text-foreground hover:bg-card text-xl h-16 px-12 rounded-md font-bold transition-all hover:scale-[1.02]">
                <Link href="/signup">
                  CRIAR CONTA GRATUITA
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              * Inclui 20 créditos iniciais sem compromisso.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-card/40 backdrop-blur-md border border-primary/10 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,249,0.1)] group">
      <div className="mb-4 p-3 rounded-lg bg-background/50 w-fit group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 font-orbitron">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  )
}

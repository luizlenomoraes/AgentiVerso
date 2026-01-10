import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ArrowRight, Brain, Database, ShieldCheck, Zap, Sparkles, Bot, Cpu } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden font-sans">
      <SiteHeader />

      {/* Background Effects */}
      <div className="cyber-grid fixed inset-0 z-0 pointer-events-none opacity-40" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0 pointer-events-none" />

      <main className="flex-1 relative z-10 pt-20">
        {/* HERO SECTION */}
        <section className="relative py-24 md:py-40 overflow-hidden">
          <div className="container mx-auto px-4 text-center space-y-8 relative z-10">
            {/* Floating Badge */}
            <div className="inline-flex items-center gap-2 p-1 px-4 rounded-full bg-primary/10 border border-primary/30 animate-fade-in-up">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary uppercase tracking-widest">
                A Próxima Geração de IA
              </span>
            </div>

            {/* Main Title with Gradient */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white font-orbitron drop-shadow-[0_0_30px_rgba(0,255,249,0.4)] animate-fade-in-up stagger-1">
              INTELIGÊNCIA <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-accent animate-gradient-x">
                DESCENTRALIZADA
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in-up stagger-2">
              Acesse uma rede de <span className="text-primary font-semibold">agentes especializados</span> com memória persistente e acesso
              aos seus documentos privados. O futuro do trabalho começa aqui.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 animate-fade-in-up stagger-3">
              <Button
                asChild
                className="text-lg h-14 px-8 min-w-[220px] bg-gradient-to-r from-primary to-accent text-background font-bold hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(0,255,249,0.4)] animate-glow-pulse"
              >
                <Link href="/signup" className="flex items-center gap-2">
                  INICIAR ACESSO <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="text-lg h-14 px-8 min-w-[200px] border-primary/30 bg-primary/5 hover:bg-primary/20 hover:border-primary hover:text-primary transition-all"
              >
                <Link href="/login">JÁ SOU MEMBRO</Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 pt-8 animate-fade-in-up stagger-4">
              <TrustBadge icon={<ShieldCheck className="w-4 h-4" />} text="Dados Criptografados" />
              <TrustBadge icon={<Zap className="w-4 h-4" />} text="Resposta Instantânea" />
              <TrustBadge icon={<Bot className="w-4 h-4" />} text="Multi-Agentes" />
            </div>
          </div>

          {/* Floating Decorative Elements */}
          <div className="absolute top-1/4 left-10 w-20 h-20 rounded-full bg-primary/30 blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-10 w-32 h-32 rounded-full bg-accent/30 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/4 w-2 h-2 rounded-full bg-primary animate-ping" />
          <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-accent animate-ping" style={{ animationDelay: '0.5s' }} />
        </section>

        {/* FEATURES GRID */}
        <section className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold font-orbitron">
                Tecnologia de <span className="text-primary">Ponta</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Nossa arquitetura combina os modelos mais avançados com segurança de nível empresarial.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={<Brain className="w-10 h-10" />}
                title="Multi-LLM Core"
                description="Alterne entre Gemini 2.5, GPT-4, Claude 3.5 e Grok. O melhor modelo para cada tarefa."
                color="primary"
                delay={0}
              />
              <FeatureCard
                icon={<Database className="w-10 h-10" />}
                title="RAG Avançado"
                description="Upload de PDFs e Docs. Seus agentes respondem com base na sua base de conhecimento."
                color="accent"
                delay={0.1}
              />
              <FeatureCard
                icon={<Cpu className="w-10 h-10" />}
                title="Memória Persistente"
                description="Seus agentes lembram de conversas passadas. Contexto infinito para continuidade."
                color="yellow"
                delay={0.2}
              />
              <FeatureCard
                icon={<ShieldCheck className="w-10 h-10" />}
                title="Segurança Total"
                description="Dados criptografados e isolados. Seus documentos nunca treinam modelos públicos."
                color="green"
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-transparent" />
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px]" />
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold font-orbitron text-white">
              Pronto para o <span className="text-primary animate-glow-pulse inline-block">Upgrade?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Junte-se a milhares de profissionais que já estão utilizando inteligência artificial para multiplicar sua produtividade.
            </p>

            <div className="relative inline-block group">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity animate-gradient-x" />

              <Button
                asChild
                className="relative bg-background text-foreground hover:bg-card text-xl h-16 px-12 rounded-xl font-bold transition-all hover:scale-[1.02] border border-primary/50"
              >
                <Link href="/signup" className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  CRIAR CONTA GRATUITA
                </Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              ✨ Inclui <span className="text-primary font-semibold">20 créditos</span> iniciais sem compromisso.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  color,
  delay
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: "primary" | "accent" | "yellow" | "green"
  delay: number
}) {
  const colorClasses = {
    primary: "text-primary bg-primary/20 group-hover:bg-primary/30",
    accent: "text-accent bg-accent/20 group-hover:bg-accent/30",
    yellow: "text-yellow-400 bg-yellow-400/20 group-hover:bg-yellow-400/30",
    green: "text-green-400 bg-green-400/20 group-hover:bg-green-400/30",
  }

  const borderClasses = {
    primary: "group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(0,255,249,0.15)]",
    accent: "group-hover:border-accent/50 group-hover:shadow-[0_0_30px_rgba(255,0,193,0.15)]",
    yellow: "group-hover:border-yellow-400/50 group-hover:shadow-[0_0_30px_rgba(250,204,21,0.15)]",
    green: "group-hover:border-green-400/50 group-hover:shadow-[0_0_30px_rgba(74,222,128,0.15)]",
  }

  return (
    <div
      className={`
        group p-6 rounded-2xl bg-card/40 backdrop-blur-md 
        border border-primary/10 transition-all duration-500
        hover:-translate-y-2 animate-fade-in-up
        ${borderClasses[color]}
      `}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className={`mb-4 p-4 rounded-xl w-fit transition-all duration-300 ${colorClasses[color]}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 font-orbitron group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  )
}

function TrustBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <div className="text-primary">{icon}</div>
      <span className="text-sm">{text}</span>
    </div>
  )
}

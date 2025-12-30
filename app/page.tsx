import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f08_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f08_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />

      {/* Header */}
      <header className="relative z-10 border-b border-border/40 bg-card/30 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            AgentiVerso
          </h1>
          <div className="flex gap-4">
            <Button asChild variant="ghost">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
              <Link href="/signup">Começar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 py-20 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-7xl font-bold text-balance">
              Bem-vindo ao{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Futuro da IA
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-balance">
              Converse com agentes de IA especializados, potencializados por bases de conhecimento privadas
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8">
              <Link href="/signup">Começar Gratuitamente</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 bg-transparent">
              <Link href="/login">Já tenho conta</Link>
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-16">
            <div className="p-6 rounded-xl bg-card/50 backdrop-blur border border-border/50 space-y-2">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-2xl">
                🤖
              </div>
              <h3 className="text-xl font-semibold">Agentes Especializados</h3>
              <p className="text-muted-foreground">Acesse agentes de IA treinados em domínios específicos</p>
            </div>

            <div className="p-6 rounded-xl bg-card/50 backdrop-blur border border-border/50 space-y-2">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center text-accent text-2xl">
                📚
              </div>
              <h3 className="text-xl font-semibold">Base de Conhecimento RAG</h3>
              <p className="text-muted-foreground">Respostas precisas baseadas em documentos privados</p>
            </div>

            <div className="p-6 rounded-xl bg-card/50 backdrop-blur border border-border/50 space-y-2">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-2xl">
                💳
              </div>
              <h3 className="text-xl font-semibold">Sistema de Créditos</h3>
              <p className="text-muted-foreground">20 créditos grátis para começar, depois pague conforme usa</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

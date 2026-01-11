import Link from "next/link"

export function SiteFooter() {
    return (
        <footer className="border-t border-border/40 bg-card/20 backdrop-blur-sm pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl font-bold font-orbitron tracking-wider">
                                AGENTI<span className="text-primary">VERSO</span>
                            </span>
                        </Link>
                        <p className="text-muted-foreground max-w-sm">
                            A plataforma definitiva para interação com Agentes de Inteligência Artificial especializados.
                            Potencialize seus resultados com RAG e conhecimento dedicado.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-lg text-primary">Plataforma</h3>
                        <ul className="space-y-2">
                            <li><Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">Login</Link></li>
                            <li><Link href="/signup" className="text-muted-foreground hover:text-primary transition-colors">Criar Conta</Link></li>
                            <li><Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">Dashboard</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-lg text-primary">Legal</h3>
                        <ul className="space-y-2">
                            <li><Link href="/legal/terms" className="text-muted-foreground hover:text-primary transition-colors">Termos de Uso</Link></li>
                            <li><Link href="/legal/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacidade</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-border/20 text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} AgentiVerso. Todos os direitos reservados no multiverso.</p>
                </div>
            </div>
        </footer>
    )
}

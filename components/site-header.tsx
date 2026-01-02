import Link from "next/link"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
    return (
        <header className="fixed top-0 left-0 w-full z-50 border-b border-primary/20 bg-background/80 backdrop-blur-md">
            {/* Linha Neon Superior */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />

            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/50 group-hover:border-primary transition-colors">
                        <span className="text-xl">🌌</span>
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold font-orbitron tracking-wider text-foreground">
                        AGENTI<span className="text-primary">VERSO</span>
                    </h1>
                </Link>

                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" className="hover:text-primary transition-colors font-medium hidden sm:inline-flex">
                        <Link href="/login">ENTRAR</Link>
                    </Button>
                    <Button asChild className="cyber-button font-bold tracking-wide">
                        <Link href="/signup">
                            COMEÇAR AGORA
                        </Link>
                    </Button>
                </div>
            </div>
        </header>
    )
}

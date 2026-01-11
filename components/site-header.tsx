import Link from "next/link"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
    return (
        <header className="fixed top-0 left-0 w-full z-50 border-b border-primary/20 bg-background/80 backdrop-blur-md">
            {/* Linha Neon Superior */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />

            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-1.5 group shrink-0">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/50 group-hover:border-primary transition-colors">
                        <span className="text-lg md:text-xl">🌌</span>
                    </div>
                    <h1 className="text-sm xs:text-base md:text-2xl font-bold font-orbitron tracking-wide text-foreground flex items-center">
                        AGENTI<span className="text-primary">VERSO</span>
                    </h1>
                </Link>

                <div className="flex items-center gap-2 md:gap-4">
                    <Button asChild variant="ghost" className="hover:text-primary transition-colors font-medium hidden sm:inline-flex">
                        <Link href="/login">ENTRAR</Link>
                    </Button>
                    <Button asChild className="cyber-button font-bold tracking-wide h-8 px-3 text-xs md:text-sm md:h-10 md:px-6">
                        <Link href="/signup">
                            <span className="md:hidden">ENTRAR</span>
                            <span className="hidden md:inline">COMEÇAR AGORA</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </header>
    )
}

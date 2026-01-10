import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert, LogOut, Sparkles, Home } from "lucide-react"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

type DashboardHeaderProps = {
    profile: any
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
    const availableCredits = Math.max(0, (profile?.total_credits || 0) - (profile?.used_credits || 0))
    const isLowCredits = availableCredits < 10

    return (
        <header className="border-b border-primary/20 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />

            <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
                {/* Logo with icon */}
                <div className="flex items-center gap-3">
                    <Link href="/" className="p-2 rounded-lg hover:bg-primary/10 transition-colors" title="Ir para Home">
                        <Home className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                    </Link>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 group"
                    >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Sparkles className="w-5 h-5 text-background" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary via-white to-accent bg-clip-text text-transparent font-orbitron hidden sm:block">
                            AgentiVerso
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    {/* Admin Button */}
                    {profile?.is_admin && (
                        <Button asChild variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10 transition-all hidden sm:flex">
                            <Link href="/admin" className="flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4" />
                                <span>Admin</span>
                            </Link>
                        </Button>
                    )}

                    {/* Credits Button with glow effect */}
                    <Link href="/dashboard/credits" className="group">
                        <div className={`
                            relative flex items-center gap-2 px-4 py-2 rounded-xl
                            border transition-all duration-300
                            ${isLowCredits
                                ? 'bg-destructive/10 border-destructive/30 hover:bg-destructive/20 hover:border-destructive/50'
                                : 'bg-primary/10 border-primary/30 hover:bg-primary/20 hover:border-primary/50'
                            }
                        `}>
                            <span className="text-sm text-muted-foreground hidden sm:inline group-hover:text-foreground transition-colors">
                                Créditos:
                            </span>
                            <span className={`font-bold font-orbitron text-lg ${isLowCredits ? 'text-destructive' : 'text-primary'}`}>
                                {availableCredits}
                            </span>
                            <div className={`w-2 h-2 rounded-full ${isLowCredits ? 'bg-destructive' : 'bg-green-500'} animate-pulse`} />

                            {/* Glow effect */}
                            {isLowCredits && (
                                <div className="absolute inset-0 rounded-xl bg-destructive/20 blur-lg -z-10 animate-pulse" />
                            )}
                        </div>
                    </Link>

                    {/* Logout Button */}
                    <form
                        action={async () => {
                            "use server"
                            const supabase = await getSupabaseServerClient()
                            await supabase.auth.signOut()
                            redirect("/login")
                        }}
                    >
                        <Button
                            variant="ghost"
                            type="submit"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                            title="Sair"
                        >
                            <LogOut className="w-5 h-5" />
                        </Button>
                    </form>
                </div>
            </div>
        </header>
    )
}

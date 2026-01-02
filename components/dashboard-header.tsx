import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert, LogOut } from "lucide-react"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

type DashboardHeaderProps = {
    profile: any
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
    const availableCredits = Math.max(0, (profile?.total_credits || 0) - (profile?.used_credits || 0))

    return (
        <header className="border-b border-border/40 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

            <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
                <Link
                    href="/dashboard"
                    className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent font-orbitron hover:opacity-80 transition-opacity"
                >
                    AgentiVerso
                </Link>

                <div className="flex items-center gap-4">
                    {/* Botão Admin */}
                    {profile?.is_admin && (
                        <Button asChild variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10 transition-all hidden sm:flex">
                            <Link href="/admin" className="flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4" />
                                <span>Admin</span>
                            </Link>
                        </Button>
                    )}

                    {/* Botão de Créditos */}
                    <Link href="/dashboard/credits" className="group">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 group-hover:bg-primary/20 transition-all cursor-pointer">
                            <span className="text-sm text-muted-foreground hidden sm:inline group-hover:text-primary transition-colors">Créditos:</span>
                            <span className="font-bold text-primary font-orbitron">{availableCredits}</span>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-1" />
                        </div>
                    </Link>

                    {/* Botão Sair */}
                    <form
                        action={async () => {
                            "use server"
                            const supabase = await getSupabaseServerClient()
                            await supabase.auth.signOut()
                            redirect("/login")
                        }}
                    >
                        <Button variant="ghost" type="submit" size="icon" className="text-muted-foreground hover:text-destructive transition-colors" title="Sair">
                            <LogOut className="w-5 h-5" />
                        </Button>
                    </form>
                </div>
            </div>
        </header>
    )
}

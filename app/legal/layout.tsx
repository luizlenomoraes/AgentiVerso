import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <SiteHeader />
            <main className="flex-1 pt-24 pb-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="mb-8">
                        <Button variant="ghost" asChild className="pl-0 hover:text-primary">
                            <Link href="/">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voltar para Home
                            </Link>
                        </Button>
                    </div>

                    <div className="prose prose-invert prose-lg max-w-none bg-card/30 backdrop-blur-sm p-6 md:p-10 rounded-2xl border border-border/50 shadow-xl">
                        {children}
                    </div>
                </div>
            </main>
            <SiteFooter />
        </div>
    )
}

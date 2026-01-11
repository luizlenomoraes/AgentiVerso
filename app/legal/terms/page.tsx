
export const metadata = {
    title: "Termos de Uso - AgentiVerso",
    description: "Termos de uso e condições gerais da plataforma AgentiVerso.",
}

export default function TermsPage() {
    return (
        <div className="space-y-6 text-foreground/90">
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-6">
                Termos de Uso
            </h1>
            <p className="text-sm text-muted-foreground">
                Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>

            <section className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mt-8">1. Aceitação dos Termos</h2>
                <p>
                    Ao acessar e usar a plataforma AgentiVerso ("Serviço"), você concorda em cumprir e estar vinculado aos seguintes termos e condições ("Termos de Uso"). Se você não concordar com qualquer parte destes termos, você não deve usar nosso Serviço.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mt-8">2. Descrição do Serviço</h2>
                <p>
                    O AgentiVerso fornece acesso a agentes de inteligência artificial especializados. Nossos serviços são fornecidos "como estão" e "conforme disponibilidade".
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mt-8">3. Contas de Usuário</h2>
                <p>
                    Para acessar certos recursos, você deve criar uma conta. Você é responsável por manter a confidencialidade de suas credenciais. O AgentiVerso não será responsável por qualquer perda ou dano decorrente do seu fracasso em cumprir esta obrigação de segurança.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mt-8">4. Uso Aceitável</h2>
                <p>Você concorda em não usar o Serviço para:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Violar quaisquer leis ou regulamentos aplicáveis.</li>
                    <li>Transmitir qualquer conteúdo que seja ilegal, ofensivo ou prejudicial.</li>
                    <li>Tentar obter acesso não autorizado aos nossos sistemas ou dados.</li>
                    <li>Usar os agentes para gerar conteúdo malicioso ou fraudulento.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mt-8">5. Pagamentos e Reembolsos</h2>
                <p>
                    Nossos serviços podem ser oferecidos mediante pagamento. Todas as transações são finais e não reembolsáveis, exceto conforme exigido por lei ou explicitamente declarado em nossa política de reembolso. O processamento de pagamentos é realizado por terceiros (Mercado Pago, Appmax).
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mt-8">6. Propriedade Intelectual</h2>
                <p>
                    O Serviço e seu conteúdo original, recursos e funcionalidades são de propriedade do AgentiVerso e são protegidos por leis de direitos autorais, marcas registradas e outras leis de propriedade intelectual.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mt-8">7. Limitação de Responsabilidade</h2>
                <p>
                    Em nenhum caso o AgentiVerso será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo, sem limitação, perda de lucros, dados, uso, boa vontade ou outras perdas intangíveis.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mt-8">8. Alterações nos Termos</h2>
                <p>
                    Reservamo-nos o direito de modificar ou substituir estes Termos a qualquer momento. Se uma revisão for material, tentaremos fornecer um aviso com pelo menos 30 dias de antecedência antes que quaisquer novos termos entrem em vigor.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mt-8">9. Contato</h2>
                <p>
                    Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco através do suporte na plataforma.
                </p>
            </section>
        </div>
    )
}

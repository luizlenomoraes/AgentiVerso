
export const metadata = {
    title: "Política de Privacidade - AgentiVerso",
    description: "Política de privacidade e tratamento de dados do AgentiVerso.",
}

export default function PrivacyPage() {
    return (
        <div className="space-y-6 text-foreground/90">
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-6">
                Política de Privacidade
            </h1>
            <p className="text-sm text-muted-foreground">
                Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>

            <section className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mt-8">1. Introdução</h2>
                <p>
                    O AgentiVerso ("nós", "nosso") respeita a sua privacidade e está comprometido em proteger os dados pessoais que você compartilha conosco. Esta política descreve como coletamos, usamos e protegemos suas informações.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mt-8">2. Dados que Coletamos</h2>
                <p>Coletamos informações que você nos fornece diretamente:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Informações da Conta:</strong> Nome, e-mail e senha.</li>
                    <li><strong>Dados de Pagamento:</strong> Processados de forma segura por nossos parceiros (Mercado Pago, Appmax). Não armazenamos detalhes completos do cartão de crédito.</li>
                    <li><strong>Conteúdo do Usuário:</strong> Mensagens e interações com os agentes de IA.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mt-8">3. Cookies e Tecnologias de Rastreamento (Pixels)</h2>
                <p>
                    Utilizamos cookies e tecnologias similares (como Pixels do Meta, Google Analytics, TikTok, etc.) para melhorar sua experiência, analisar o tráfego e personalizar publicidade.
                </p>
                <p>
                    Essas ferramentas podem coletar dados como seu endereço IP, tipo de navegador, páginas visitadas e ações realizadas na plataforma. Você pode gerenciar suas preferências de cookies através das configurações do seu navegador.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mt-8">4. Como Usamos seus Dados</h2>
                <p>Utilizamos suas informações para:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Fornecer, manter e melhorar nossos serviços.</li>
                    <li>Processar transações e enviar notificações relacionadas.</li>
                    <li>Responder a seus comentários e solicitações de suporte.</li>
                    <li>Monitorar tendências de uso e atividade.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mt-8">5. Compartilhamento de Dados</h2>
                <p>
                    Não vendemos seus dados pessoais. Podemos compartilhar informações com prestadores de serviços terceirizados que nos ajudam a operar nossa plataforma (hospedagem, análise de dados, processamento de pagamentos), sob estritas obrigações de confidencialidade.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mt-8">6. Segurança de Dados</h2>
                <p>
                    Implementamos medidas de segurança técnicas e organizacionais adequadas para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mt-8">7. Seus Direitos (LGPD)</h2>
                <p>
                    Você tem o direito de acessar, corrigir, excluir ou portar seus dados pessoais. Para exercer esses direitos, entre em contato conosco.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mt-8">8. Alterações nesta Política</h2>
                <p>
                    Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre quaisquer alterações materiais publicando a nova política nesta página.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mt-8">9. Contato</h2>
                <p>
                    Para dúvidas sobre esta política, entre em contato através do nosso suporte.
                </p>
            </section>
        </div>
    )
}

"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Zap, TrendingUp, Clock, MessageSquare } from "lucide-react"

type Profile = {
  total_credits: number
  used_credits: number
}

type UsageLog = {
  id: string
  created_at: string
  tokens_used: number
  agent_id: string
}

type CreditStatsProps = {
  profile: Profile | null
  usageLogs: UsageLog[]
  availableCredits: number
}

export function CreditStats({ profile, usageLogs, availableCredits }: CreditStatsProps) {
  const totalCredits = profile?.total_credits || 0
  const usedCredits = profile?.used_credits || 0
  const usagePercentage = totalCredits > 0 ? (usedCredits / totalCredits) * 100 : 0

  // Calculate stats from usage logs
  const totalMessages = usageLogs.length
  const thisWeekMessages = usageLogs.filter((log) => {
    const logDate = new Date(log.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return logDate >= weekAgo
  }).length

  // Get most used agent
  const agentUsage = usageLogs.reduce(
    (acc, log) => {
      acc[log.agent_id] = (acc[log.agent_id] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const mostUsedCount = Math.max(...Object.values(agentUsage), 0)

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Estatísticas de Uso</h2>
        <p className="text-muted-foreground">Acompanhe seu consumo de créditos e atividade</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 space-y-2 bg-card/50 backdrop-blur border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Créditos Disponíveis</span>
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-primary">{availableCredits}</p>
          <p className="text-xs text-muted-foreground">de {totalCredits} totais</p>
        </Card>

        <Card className="p-6 space-y-2 bg-card/50 backdrop-blur border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Créditos Usados</span>
            <TrendingUp className="w-5 h-5 text-accent" />
          </div>
          <p className="text-3xl font-bold">{usedCredits}</p>
          <p className="text-xs text-muted-foreground">{usagePercentage.toFixed(1)}% do total</p>
        </Card>

        <Card className="p-6 space-y-2 bg-card/50 backdrop-blur border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Mensagens Enviadas</span>
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold">{totalMessages}</p>
          <p className="text-xs text-muted-foreground">Total de interações</p>
        </Card>

        <Card className="p-6 space-y-2 bg-card/50 backdrop-blur border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Esta Semana</span>
            <Clock className="w-5 h-5 text-accent" />
          </div>
          <p className="text-3xl font-bold">{thisWeekMessages}</p>
          <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
        </Card>
      </div>

      <Card className="p-6 space-y-4 bg-card/50 backdrop-blur border-border/50">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Uso de Créditos</h3>
            <span className="text-sm text-muted-foreground">
              {usedCredits} / {totalCredits}
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
        </div>
        <p className="text-sm text-muted-foreground">
          {availableCredits > 10
            ? "Você tem créditos suficientes para continuar conversando."
            : availableCredits > 0
              ? "Seus créditos estão acabando. Considere comprar mais."
              : "Você não tem créditos disponíveis. Compre mais para continuar."}
        </p>
      </Card>

      <Card className="p-6 space-y-4 bg-card/50 backdrop-blur border-border/50">
        <h3 className="font-semibold">Histórico Recente</h3>
        <div className="space-y-2">
          {usageLogs.slice(0, 10).map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {new Date(log.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <span className="text-sm font-medium">-{(log.tokens_used / 1000).toFixed(2)} créditos</span>
            </div>
          ))}
          {usageLogs.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade ainda</p>
          )}
        </div>
      </Card>
    </div>
  )
}

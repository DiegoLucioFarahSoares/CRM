"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, FileDown, Users, Briefcase, TrendingUp, Clock } from "lucide-react"
import { StatsCard } from "@/components/crm/stats-card"
import { AnalyticsChart } from "@/components/crm/analytics-chart"
import { Reminders } from "@/components/crm/reminders"
import { DealsList } from "@/components/crm/deals-list"
import { TeamCollaboration } from "@/components/crm/team-collaboration"
import { ProgressChart } from "@/components/crm/progress-chart"
import { TimeTracker } from "@/components/crm/time-tracker"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

interface DashboardPageProps {
  onNavigate?: (page: string) => void
}

interface Stats {
  totalClientes: number
  negociosFechados: number
  emNegociacao: number
  pendentes: number
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [stats, setStats] = useState<Stats>({
    totalClientes: 0,
    negociosFechados: 0,
    emNegociacao: 0,
    pendentes: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    const [clientesRes, negociosRes] = await Promise.all([
      supabase.from("clientes").select("id", { count: "exact", head: true }),
      supabase.from("negocios").select("etapa"),
    ])

    const negocios = negociosRes.data ?? []
    setStats({
      totalClientes: clientesRes.count ?? 0,
      negociosFechados: negocios.filter((n) => n.etapa === "fechado").length,
      emNegociacao: negocios.filter((n) =>
        ["proposta", "negociacao"].includes(n.etapa)
      ).length,
      pendentes: negocios.filter((n) =>
        ["prospeccao", "qualificacao"].includes(n.etapa)
      ).length,
    })
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Planeje, priorize e gerencie seus negócios com facilidade.
          </p>
        </div>
        <div className="flex gap-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button className="gap-2" onClick={() => onNavigate?.("negocios")}>
              <Plus className="w-4 h-4" />
              Novo Negócio
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="outline" className="gap-2" onClick={() => onNavigate?.("clientes")}>
              <FileDown className="w-4 h-4" />
              Ver Clientes
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total de Clientes"
          value={stats.totalClientes}
          change="Clientes cadastrados"
          trend="up"
          icon={Users}
          variant="primary"
          delay={0}
        />
        <StatsCard
          title="Negócios Fechados"
          value={stats.negociosFechados}
          change="Etapa: Fechado"
          trend="up"
          icon={Briefcase}
          delay={0.1}
        />
        <StatsCard
          title="Em Negociação"
          value={stats.emNegociacao}
          change="Proposta / Negociação"
          trend="up"
          icon={TrendingUp}
          delay={0.2}
        />
        <StatsCard
          title="Pendentes"
          value={stats.pendentes}
          change="Prospecção / Qualificação"
          trend="neutral"
          icon={Clock}
          delay={0.3}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnalyticsChart />
            <Reminders onNavigate={onNavigate} />
          </div>
          <TeamCollaboration />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <DealsList />
          <ProgressChart />
          <TimeTracker />
        </div>
      </div>
    </div>
  )
}

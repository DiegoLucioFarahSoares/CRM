"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  Target,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Line,
} from "recharts"
import { Button } from "@/components/ui/button"
import { type Negocio, type Cliente, formatCurrency, getEtapaLabel } from "@/lib/crm-data"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

const COLORS = ["#16a34a", "#22c55e", "#4ade80", "#86efac", "#bbf7d0", "#dc2626"]

const activityData = [
  { dia: "Seg", reunioes: 8, ligacoes: 15, emails: 24 },
  { dia: "Ter", reunioes: 5, ligacoes: 12, emails: 18 },
  { dia: "Qua", reunioes: 10, ligacoes: 20, emails: 30 },
  { dia: "Qui", reunioes: 7, ligacoes: 18, emails: 22 },
  { dia: "Sex", reunioes: 4, ligacoes: 10, emails: 15 },
]

const funnelData = [
  { etapa: "Leads", valor: 250, percent: 100 },
  { etapa: "Qualificados", valor: 180, percent: 72 },
  { etapa: "Propostas", valor: 95, percent: 38 },
  { etapa: "Negociação", valor: 52, percent: 21 },
  { etapa: "Fechados", valor: 42, percent: 17 },
]

export function RelatoriosPage() {
  const [period, setPeriod] = useState<"semana" | "mes" | "ano">("mes")
  const [negocios, setNegocios] = useState<Negocio[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [negRes, cliRes] = await Promise.all([
        supabase.from("negocios").select("*").order("created_at", { ascending: false }),
        supabase.from("clientes").select("*").order("valor", { ascending: false }),
      ])
      setNegocios((negRes.data as Negocio[]) ?? [])
      setClientes((cliRes.data as Cliente[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const etapas: Negocio["etapa"][] = [
    "prospeccao",
    "qualificacao",
    "proposta",
    "negociacao",
    "fechado",
    "perdido",
  ]

  const pipelineData = etapas.map((e) => ({
    name: getEtapaLabel(e),
    value: negocios.filter((n) => n.etapa === e).length,
  }))

  const topClientes = [...clientes].slice(0, 5)

  const totalRevenue = negocios
    .filter((n) => n.etapa === "fechado")
    .reduce((sum, n) => sum + n.valor, 0)

  const totalPipeline = negocios
    .filter((n) => !["fechado", "perdido"].includes(n.etapa))
    .reduce((sum, n) => sum + n.valor * (n.probabilidade / 100), 0)

  const conversionRate = Math.round(
    (negocios.filter((n) => n.etapa === "fechado").length /
      Math.max(negocios.length, 1)) *
      100
  )

  const avgDealSize =
    negocios.filter((n) => n.etapa === "fechado").length > 0
      ? totalRevenue / negocios.filter((n) => n.etapa === "fechado").length
      : 0

  const stats = [
    {
      title: "Receita Total",
      value: formatCurrency(totalRevenue),
      change: "+0%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Pipeline Ponderado",
      value: formatCurrency(totalPipeline),
      change: "+0%",
      trend: "up",
      icon: Target,
    },
    {
      title: "Taxa de Conversão",
      value: `${conversionRate}%`,
      change: "+0%",
      trend: "up",
      icon: TrendingUp,
    },
    {
      title: "Ticket Médio",
      value: formatCurrency(avgDealSize),
      change: "+0%",
      trend: "up",
      icon: Briefcase,
    },
  ]

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground mt-1">
            Analise o desempenho do seu time de vendas.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-secondary rounded-lg p-1">
            {(["semana", "mes", "ano"] as const).map((p) => (
              <Button
                key={p}
                variant={period === p ? "default" : "ghost"}
                size="sm"
                onClick={() => setPeriod(p)}
                className="capitalize"
              >
                {p === "semana" ? "Semana" : p === "mes" ? "Mês" : "Ano"}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Carregando relatórios...</div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl p-5 border border-border"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span
                    className={cn(
                      "flex items-center gap-1 text-sm font-medium",
                      stat.trend === "up" ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {stat.trend === "up" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Pipeline Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl p-6 border border-border"
            >
              <div className="mb-6">
                <h3 className="font-semibold text-foreground">Distribuição do Pipeline</h3>
                <p className="text-sm text-muted-foreground">Por etapa de venda</p>
              </div>
              <div className="h-[280px] flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pipelineData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pipelineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 min-w-[140px]">
                  {pipelineData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index] }}
                      />
                      <span className="text-sm text-muted-foreground">{item.name}</span>
                      <span className="text-sm font-medium text-foreground ml-auto">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Activity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-card rounded-xl p-6 border border-border"
            >
              <div className="mb-6">
                <h3 className="font-semibold text-foreground">Atividades da Semana</h3>
                <p className="text-sm text-muted-foreground">Reuniões, ligações e emails</p>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="dia" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="reunioes" fill="#16a34a" radius={[4, 4, 0, 0]} name="Reuniões" />
                    <Bar dataKey="ligacoes" fill="#22c55e" radius={[4, 4, 0, 0]} name="Ligações" />
                    <Bar dataKey="emails" fill="#86efac" radius={[4, 4, 0, 0]} name="Emails" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Conversion Funnel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl p-6 border border-border"
            >
              <div className="mb-6">
                <h3 className="font-semibold text-foreground">Funil de Conversão</h3>
                <p className="text-sm text-muted-foreground">Taxa de conversão por etapa</p>
              </div>
              <div className="space-y-4">
                {funnelData.map((item, index) => (
                  <motion.div
                    key={item.etapa}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-foreground">{item.etapa}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.valor} ({item.percent}%)
                      </span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percent}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: COLORS[Math.min(index, COLORS.length - 1)],
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Deals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-card rounded-xl p-6 border border-border"
            >
              <div className="mb-6">
                <h3 className="font-semibold text-foreground">Negócios Recentes</h3>
                <p className="text-sm text-muted-foreground">Últimas atualizações</p>
              </div>
              <div className="space-y-4">
                {negocios.slice(0, 5).map((negocio, index) => (
                  <motion.div
                    key={negocio.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + index * 0.05 }}
                    className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{negocio.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        {negocio.clientes?.nome || negocio.responsavel || "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {formatCurrency(negocio.valor)}
                      </p>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          negocio.etapa === "fechado"
                            ? "bg-green-100 text-green-700"
                            : negocio.etapa === "perdido"
                            ? "bg-red-100 text-red-700"
                            : negocio.etapa === "negociacao"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                        )}
                      >
                        {getEtapaLabel(negocio.etapa)}
                      </span>
                    </div>
                  </motion.div>
                ))}
                {negocios.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum negócio cadastrado.
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Top Clients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <div className="mb-6">
              <h3 className="font-semibold text-foreground">Top 5 Clientes</h3>
              <p className="text-sm text-muted-foreground">Por valor total</p>
            </div>
            {topClientes.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhum cliente cadastrado.
              </p>
            ) : (
              <div className="space-y-4">
                {topClientes.map((cliente, index) => (
                  <motion.div
                    key={cliente.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{cliente.nome}</p>
                      <p className="text-sm text-muted-foreground truncate">{cliente.empresa}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {formatCurrency(cliente.valor ?? 0)}
                      </p>
                      <p
                        className={cn(
                          "text-xs",
                          cliente.status === "ativo"
                            ? "text-green-600"
                            : cliente.status === "prospecto"
                            ? "text-blue-600"
                            : "text-gray-600"
                        )}
                      >
                        {cliente.status === "ativo"
                          ? "Ativo"
                          : cliente.status === "prospecto"
                          ? "Prospecto"
                          : "Inativo"}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  )
}

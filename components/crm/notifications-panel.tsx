"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  Calendar,
  Briefcase,
  Clock,
  X,
  CheckCheck,
  ChevronRight,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface Notificacao {
  id: string
  tipo: "evento_hoje" | "evento_proximo" | "negocio_urgente"
  titulo: string
  descricao: string
  pagina: "calendario" | "negocios"
  lida: boolean
}

interface NotificationsPanelProps {
  onClose: () => void
  onNavigate: (page: string) => void
  onCountChange: (count: number) => void
}

export function NotificationsPanel({ onClose, onNavigate, onCountChange }: NotificationsPanelProps) {
  const [items, setItems] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)
  const [lidas, setLidas] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("crm_notif_lidas")
      return new Set(stored ? JSON.parse(stored) as string[] : [])
    } catch {
      return new Set()
    }
  })

  useEffect(() => {
    loadNotificacoes()
  }, [])

  useEffect(() => {
    const naoLidas = items.filter((i) => !lidas.has(i.id)).length
    onCountChange(naoLidas)
  }, [items, lidas, onCountChange])

  async function loadNotificacoes() {
    const today = new Date()
    const todayStr = today.toISOString().split("T")[0]
    const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]
    const in3Days = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]

    const [eventosRes, negociosRes] = await Promise.all([
      supabase
        .from("eventos")
        .select("id, titulo, data, hora_inicio, tipo")
        .gte("data", todayStr)
        .lte("data", in3Days)
        .eq("concluido", false)
        .order("data")
        .order("hora_inicio")
        .limit(10),
      supabase
        .from("negocios")
        .select("id, titulo, data_fechamento, etapa, valor")
        .lte("data_fechamento", in7Days)
        .gte("data_fechamento", todayStr)
        .not("etapa", "in", '("fechado","perdido")')
        .order("data_fechamento")
        .limit(5),
    ])

    const novos: Notificacao[] = []

    for (const ev of eventosRes.data ?? []) {
      const isHoje = ev.data === todayStr
      novos.push({
        id: `ev-${ev.id}`,
        tipo: isHoje ? "evento_hoje" : "evento_proximo",
        titulo: isHoje ? `Hoje: ${ev.titulo}` : `Em breve: ${ev.titulo}`,
        descricao: isHoje
          ? `Às ${ev.hora_inicio}`
          : `${new Date(ev.data + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })} · ${ev.hora_inicio}`,
        pagina: "calendario",
        lida: false,
      })
    }

    for (const neg of negociosRes.data ?? []) {
      const diasRestantes = Math.ceil(
        (new Date(neg.data_fechamento).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )
      novos.push({
        id: `neg-${neg.id}`,
        tipo: "negocio_urgente",
        titulo: `Negócio vencendo: ${neg.titulo}`,
        descricao:
          diasRestantes === 0
            ? "Vence hoje!"
            : `Vence em ${diasRestantes} dia${diasRestantes > 1 ? "s" : ""}`,
        pagina: "negocios",
        lida: false,
      })
    }

    setItems(novos)
    setLoading(false)
  }

  function marcarLida(id: string) {
    const novasLidas = new Set([...lidas, id])
    setLidas(novasLidas)
    localStorage.setItem("crm_notif_lidas", JSON.stringify([...novasLidas]))
  }

  function marcarTodasLidas() {
    const todas = new Set(items.map((i) => i.id))
    setLidas(todas)
    localStorage.setItem("crm_notif_lidas", JSON.stringify([...todas]))
  }

  const naoLidas = items.filter((i) => !lidas.has(i.id)).length

  const tipoConfig = {
    evento_hoje: { icon: Clock, cor: "bg-blue-100 text-blue-700" },
    evento_proximo: { icon: Calendar, cor: "bg-purple-100 text-purple-700" },
    negocio_urgente: { icon: Briefcase, cor: "bg-amber-100 text-amber-700" },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-foreground" />
          <span className="font-semibold text-sm text-foreground">Notificações</span>
          {naoLidas > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
              {naoLidas}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {naoLidas > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1"
              onClick={marcarTodasLidas}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Marcar lidas
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[420px] overflow-y-auto">
        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center">
            <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma notificação.</p>
          </div>
        ) : (
          <AnimatePresence>
            {items.map((item, index) => {
              const cfg = tipoConfig[item.tipo]
              const Icon = cfg.icon
              const isLida = lidas.has(item.id)
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => {
                    marcarLida(item.id)
                    onNavigate(item.pagina)
                    onClose()
                  }}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0",
                    isLida && "opacity-50"
                  )}
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", cfg.cor)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium text-foreground", isLida && "font-normal")}>
                      {item.titulo}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.descricao}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {!isLida && <span className="w-2 h-2 rounded-full bg-primary mt-1" />}
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                  </div>
                </motion.button>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="px-4 py-2.5 border-t border-border bg-secondary/30">
          <button
            onClick={() => { onNavigate("calendario"); onClose() }}
            className="text-xs text-primary hover:underline font-medium"
          >
            Ver calendário completo →
          </button>
        </div>
      )}
    </motion.div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock, Users, Phone, CheckSquare, Bell, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

interface Reminder {
  id: string
  titulo: string
  horaInicio: string
  horaFim: string
  tipo: "reuniao" | "ligacao" | "tarefa" | "lembrete"
}

const tipoIcons = {
  reuniao: Users,
  ligacao: Phone,
  tarefa: CheckSquare,
  lembrete: Bell,
}

const tipoColors = {
  reuniao: "bg-blue-100 text-blue-700",
  ligacao: "bg-green-100 text-green-700",
  tarefa: "bg-amber-100 text-amber-700",
  lembrete: "bg-purple-100 text-purple-700",
}

const tipoLabels = {
  reuniao: "Reunião",
  ligacao: "Ligação",
  tarefa: "Tarefa",
  lembrete: "Lembrete",
}

interface RemindersProps {
  onNavigate?: (page: string) => void
}

export function Reminders({ onNavigate }: RemindersProps) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    supabase
      .from("eventos")
      .select("id, titulo, hora_inicio, hora_fim, tipo")
      .eq("data", today)
      .eq("concluido", false)
      .order("hora_inicio")
      .limit(3)
      .then(({ data }) => {
        setReminders(
          (data ?? []).map((r: Record<string, string>) => ({
            id: r.id,
            titulo: r.titulo,
            horaInicio: r.hora_inicio,
            horaFim: r.hora_fim,
            tipo: r.tipo as Reminder["tipo"],
          }))
        )
        setLoading(false)
      })
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">Hoje</CardTitle>
          {onNavigate && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => onNavigate("calendario")}
            >
              <Calendar className="w-3 h-3" />
              Ver calendário
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="py-4 flex justify-center">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reminders.length === 0 ? (
            <div className="py-6 text-center">
              <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum evento hoje.</p>
              {onNavigate && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-1 text-xs"
                  onClick={() => onNavigate("calendario")}
                >
                  Adicionar evento
                </Button>
              )}
            </div>
          ) : (
            reminders.map((reminder, index) => {
              const Icon = tipoIcons[reminder.tipo]
              return (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-default"
                >
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", tipoColors[reminder.tipo])}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{reminder.titulo}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{reminder.horaInicio} – {reminder.horaFim}</span>
                      <span className={cn("ml-1 px-1.5 py-0.5 rounded text-xs font-medium", tipoColors[reminder.tipo])}>
                        {tipoLabels[reminder.tipo]}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

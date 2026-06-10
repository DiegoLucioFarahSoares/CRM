"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  Users,
  Phone,
  CheckSquare,
  Bell,
  ChevronDown,
  Edit,
  Trash2,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { type Evento, getTipoEventoColor } from "@/lib/crm-data"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

const tipoEventoIcons = {
  reuniao: Users,
  ligacao: Phone,
  tarefa: CheckSquare,
  lembrete: Bell,
}

const tipoEventoLabels = {
  reuniao: "Reunião",
  ligacao: "Ligação",
  tarefa: "Tarefa",
  lembrete: "Lembrete",
}

type DbEvento = {
  id: string
  titulo: string
  descricao: string
  data: string
  hora_inicio: string
  hora_fim: string
  tipo: Evento["tipo"]
  cliente_id: string | null
  concluido: boolean
  clientes: { nome: string } | null
}

function dbToEvento(row: DbEvento): Evento {
  return {
    id: row.id,
    titulo: row.titulo,
    descricao: row.descricao ?? "",
    data: row.data,
    horaInicio: row.hora_inicio,
    horaFim: row.hora_fim,
    tipo: row.tipo,
    clienteId: row.cliente_id ?? undefined,
    cliente: row.clientes?.nome ?? undefined,
    concluido: row.concluido,
  }
}

export function CalendarioPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [clientes, setClientes] = useState<{ id: string; nome: string; empresa: string }[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    data: "",
    horaInicio: "09:00",
    horaFim: "10:00",
    tipo: "reuniao" as Evento["tipo"],
    clienteId: "",
  })

  useEffect(() => {
    loadEventos()
    supabase
      .from("clientes")
      .select("id, nome, empresa")
      .order("nome")
      .then(({ data }) => setClientes(data ?? []))
  }, [])

  async function loadEventos() {
    const { data } = await supabase
      .from("eventos")
      .select("*, clientes(nome)")
      .order("data")
      .order("hora_inicio")
    setEventos((data as DbEvento[] ?? []).map(dbToEvento))
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const getDayEvents = (day: number, monthOffset = 0) => {
    const date = new Date(year, month + monthOffset, day)
    const dateStr = date.toISOString().split("T")[0]
    return eventos.filter((e) => e.data === dateStr)
  }

  const handleDayClick = (day: number, monthOffset = 0) => {
    setSelectedDate(new Date(year, month + monthOffset, day))
  }

  const handleAddEvento = (date?: Date) => {
    setIsEditing(false)
    setFormData({
      titulo: "",
      descricao: "",
      data: date ? date.toISOString().split("T")[0] : "",
      horaInicio: "09:00",
      horaFim: "10:00",
      tipo: "reuniao",
      clienteId: "",
    })
    setShowModal(true)
  }

  const handleEditEvento = (evento: Evento) => {
    setIsEditing(true)
    setSelectedEvento(evento)
    setFormData({
      titulo: evento.titulo,
      descricao: evento.descricao,
      data: evento.data,
      horaInicio: evento.horaInicio,
      horaFim: evento.horaFim,
      tipo: evento.tipo,
      clienteId: evento.clienteId || "",
    })
    setShowEventModal(false)
    setShowModal(true)
  }

  const handleDeleteEvento = async (evento: Evento) => {
    await supabase.from("eventos").delete().eq("id", evento.id)
    setShowEventModal(false)
    setSelectedEvento(null)
    loadEventos()
  }

  const handleToggleConcluido = async (evento: Evento) => {
    await supabase
      .from("eventos")
      .update({ concluido: !evento.concluido })
      .eq("id", evento.id)
    // Update selectedEvento if open
    if (selectedEvento?.id === evento.id) {
      setSelectedEvento({ ...evento, concluido: !evento.concluido })
    }
    loadEventos()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      titulo: formData.titulo,
      descricao: formData.descricao,
      data: formData.data,
      hora_inicio: formData.horaInicio,
      hora_fim: formData.horaFim,
      tipo: formData.tipo,
      cliente_id: formData.clienteId || null,
    }

    if (isEditing && selectedEvento) {
      await supabase.from("eventos").update(payload).eq("id", selectedEvento.id)
    } else {
      await supabase.from("eventos").insert(payload)
    }

    setSaving(false)
    setShowModal(false)
    setSelectedEvento(null)
    loadEventos()
  }

  const handleEventClick = (evento: Evento) => {
    setSelectedEvento(evento)
    setShowEventModal(true)
  }

  const today = new Date()
  const isToday = (day: number, monthOffset = 0) =>
    day === today.getDate() &&
    month + monthOffset === today.getMonth() &&
    year === today.getFullYear()

  const isSelected = (day: number, monthOffset = 0) => {
    if (!selectedDate) return false
    return (
      day === selectedDate.getDate() &&
      month + monthOffset === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    )
  }

  const calendarDays: { day: number; monthOffset: number }[] = []
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({ day: daysInPrevMonth - i, monthOffset: -1 })
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, monthOffset: 0 })
  }
  const remainingDays = 42 - calendarDays.length
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({ day: i, monthOffset: 1 })
  }

  const selectedDateEvents = selectedDate
    ? eventos.filter((e) => e.data === selectedDate.toISOString().split("T")[0])
    : []

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendário</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus compromissos e tarefas.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={goToToday}>Hoje</Button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={() => handleAddEvento(selectedDate || undefined)} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Evento
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-card rounded-xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              {meses[month]} {year}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {diasSemana.map((dia) => (
              <div key={dia} className="text-center text-sm font-medium text-muted-foreground py-2">
                {dia}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ day, monthOffset }, index) => {
              const dayEvents = getDayEvents(day, monthOffset)
              const isCurrentMonth = monthOffset === 0
              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDayClick(day, monthOffset)}
                  className={cn(
                    "relative h-24 p-2 rounded-lg border transition-all text-left flex flex-col",
                    isCurrentMonth
                      ? "bg-background border-border hover:border-primary/50"
                      : "bg-secondary/30 border-transparent text-muted-foreground",
                    isToday(day, monthOffset) && "ring-2 ring-primary",
                    isSelected(day, monthOffset) && "bg-primary/10 border-primary"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isToday(day, monthOffset) &&
                        "w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                    )}
                  >
                    {day}
                  </span>
                  <div className="flex-1 overflow-hidden mt-1 space-y-0.5">
                    {dayEvents.slice(0, 2).map((evento) => {
                      const Icon = tipoEventoIcons[evento.tipo]
                      return (
                        <div
                          key={evento.id}
                          onClick={(e) => { e.stopPropagation(); handleEventClick(evento) }}
                          className={cn(
                            "text-xs px-1.5 py-0.5 rounded truncate flex items-center gap-1 cursor-pointer hover:opacity-80",
                            getTipoEventoColor(evento.tipo),
                            evento.concluido && "opacity-50 line-through"
                          )}
                        >
                          <Icon className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="truncate">{evento.titulo}</span>
                        </div>
                      )
                    })}
                    {dayEvents.length > 2 && (
                      <span className="text-xs text-muted-foreground">+{dayEvents.length - 2} mais</span>
                    )}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Events Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">
              {selectedDate
                ? selectedDate.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })
                : "Selecione uma data"}
            </h3>
            {selectedDate && (
              <Button variant="ghost" size="sm" onClick={() => handleAddEvento(selectedDate)}>
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>

          {selectedDateEvents.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Nenhum evento para esta data.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {selectedDateEvents
                  .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
                  .map((evento, index) => {
                    const Icon = tipoEventoIcons[evento.tipo]
                    return (
                      <motion.div
                        key={evento.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleEventClick(evento)}
                        className={cn(
                          "p-4 rounded-lg border border-border bg-background cursor-pointer hover:shadow-md transition-shadow",
                          evento.concluido && "opacity-60"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", getTipoEventoColor(evento.tipo))}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={cn("font-medium text-foreground truncate", evento.concluido && "line-through")}>
                              {evento.titulo}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {evento.horaInicio} - {evento.horaFim}
                            </p>
                            {evento.cliente && (
                              <p className="text-xs text-muted-foreground mt-1">{evento.cliente}</p>
                            )}
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleConcluido(evento) }}
                            className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                              evento.concluido
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-muted-foreground/30 hover:border-primary"
                            )}
                          >
                            {evento.concluido && <Check className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
              </AnimatePresence>
            </div>
          )}

          {/* Upcoming Events */}
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="font-semibold text-foreground mb-4">Próximos Eventos</h3>
            <div className="space-y-3">
              {eventos
                .filter((e) => e.data >= today.toISOString().split("T")[0] && !e.concluido)
                .sort((a, b) => a.data.localeCompare(b.data) || a.horaInicio.localeCompare(b.horaInicio))
                .slice(0, 5)
                .map((evento) => {
                  const Icon = tipoEventoIcons[evento.tipo]
                  return (
                    <div
                      key={evento.id}
                      onClick={() => handleEventClick(evento)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                    >
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", getTipoEventoColor(evento.tipo))}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{evento.titulo}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(evento.data + "T00:00:00").toLocaleDateString("pt-BR", {
                            day: "numeric",
                            month: "short",
                          })}{" "}
                          · {evento.horaInicio}
                        </p>
                      </div>
                    </div>
                  )
                })}
              {eventos.filter((e) => e.data >= today.toISOString().split("T")[0] && !e.concluido).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">Sem eventos futuros.</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-xl p-4 sm:p-6 w-full max-w-lg mx-4 sm:mx-0 border border-border shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  {isEditing ? "Editar Evento" : "Novo Evento"}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Título</label>
                  <Input
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ex: Reunião com cliente"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Descrição</label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Detalhes do evento..."
                    className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-foreground resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Data</label>
                    <Input
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Tipo</label>
                    <div className="relative">
                      <select
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value as Evento["tipo"] })}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground appearance-none cursor-pointer"
                      >
                        <option value="reuniao">Reunião</option>
                        <option value="ligacao">Ligação</option>
                        <option value="tarefa">Tarefa</option>
                        <option value="lembrete">Lembrete</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Hora Início</label>
                    <Input
                      type="time"
                      value={formData.horaInicio}
                      onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Hora Fim</label>
                    <Input
                      type="time"
                      value={formData.horaFim}
                      onChange={(e) => setFormData({ ...formData, horaFim: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Cliente (opcional)</label>
                  <div className="relative">
                    <select
                      value={formData.clienteId}
                      onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground appearance-none cursor-pointer"
                    >
                      <option value="">Selecione um cliente</option>
                      {clientes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome}{c.empresa ? ` - ${c.empresa}` : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={saving}>
                    {saving ? "Salvando..." : isEditing ? "Salvar" : "Criar Evento"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {showEventModal && selectedEvento && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEventModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-xl p-4 sm:p-6 w-full max-w-md mx-4 sm:mx-0 border border-border shadow-xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", getTipoEventoColor(selectedEvento.tipo))}>
                    {(() => { const Icon = tipoEventoIcons[selectedEvento.tipo]; return <Icon className="w-6 h-6" /> })()}
                  </div>
                  <span className={cn("px-2 py-0.5 rounded text-xs font-medium", getTipoEventoColor(selectedEvento.tipo))}>
                    {tipoEventoLabels[selectedEvento.tipo]}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowEventModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <h2 className={cn("text-xl font-bold text-foreground mb-2", selectedEvento.concluido && "line-through opacity-60")}>
                {selectedEvento.titulo}
              </h2>
              {selectedEvento.descricao && (
                <p className="text-muted-foreground mb-4">{selectedEvento.descricao}</p>
              )}

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {new Date(selectedEvento.data + "T00:00:00").toLocaleDateString("pt-BR", {
                      weekday: "long", day: "numeric", month: "long",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{selectedEvento.horaInicio} - {selectedEvento.horaFim}</span>
                </div>
                {selectedEvento.cliente && (
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{selectedEvento.cliente}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => handleEditEvento(selectedEvento)}>
                  <Edit className="w-4 h-4" />
                  Editar
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => handleToggleConcluido(selectedEvento)}>
                  <Check className="w-4 h-4" />
                  {selectedEvento.concluido ? "Reabrir" : "Concluir"}
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDeleteEvento(selectedEvento)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

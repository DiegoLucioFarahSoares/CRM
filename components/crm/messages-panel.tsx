"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mail,
  Plus,
  X,
  Trash2,
  Check,
  Send,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Mensagem {
  id: string
  titulo: string
  conteudo: string
  lida: boolean
  created_at: string
}

interface MessagesPanelProps {
  onClose: () => void
  onCountChange: (count: number) => void
}

export function MessagesPanel({ onClose, onCountChange }: MessagesPanelProps) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCompose, setShowCompose] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [conteudo, setConteudo] = useState("")
  const [sending, setSending] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    loadMensagens()
  }, [])

  useEffect(() => {
    const naoLidas = mensagens.filter((m) => !m.lida).length
    onCountChange(naoLidas)
  }, [mensagens, onCountChange])

  async function loadMensagens() {
    const { data } = await supabase
      .from("mensagens")
      .select("*")
      .order("created_at", { ascending: false })
    setMensagens((data as Mensagem[]) ?? [])
    setLoading(false)
  }

  async function marcarLida(id: string) {
    await supabase.from("mensagens").update({ lida: true }).eq("id", id)
    setMensagens((prev) =>
      prev.map((m) => (m.id === id ? { ...m, lida: true } : m))
    )
  }

  async function marcarTodasLidas() {
    await supabase.from("mensagens").update({ lida: true }).eq("lida", false)
    setMensagens((prev) => prev.map((m) => ({ ...m, lida: true })))
  }

  async function excluir(id: string) {
    await supabase.from("mensagens").delete().eq("id", id)
    setMensagens((prev) => prev.filter((m) => m.id !== id))
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) return
    setSending(true)
    const { data } = await supabase
      .from("mensagens")
      .insert({ titulo: titulo.trim(), conteudo: conteudo.trim() })
      .select()
      .single()
    if (data) {
      setMensagens((prev) => [data as Mensagem, ...prev])
    }
    setTitulo("")
    setConteudo("")
    setShowCompose(false)
    setSending(false)
  }

  function handleExpand(id: string) {
    setExpanded((prev) => (prev === id ? null : id))
    const msg = mensagens.find((m) => m.id === id)
    if (msg && !msg.lida) marcarLida(id)
  }

  const naoLidas = mensagens.filter((m) => !m.lida).length

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHrs = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHrs / 24)
    if (diffMins < 1) return "Agora"
    if (diffMins < 60) return `${diffMins}min`
    if (diffHrs < 24) return `${diffHrs}h`
    if (diffDays === 1) return "Ontem"
    return d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })
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
          <Mail className="w-4 h-4 text-foreground" />
          <span className="font-semibold text-sm text-foreground">Mensagens</span>
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
              <Check className="w-3.5 h-3.5" />
              Todas lidas
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-primary"
            onClick={() => setShowCompose((v) => !v)}
            title="Nova mensagem"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Compose */}
      <AnimatePresence>
        {showCompose && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-border overflow-hidden"
          >
            <form onSubmit={enviar} className="p-3 space-y-2">
              <Input
                placeholder="Título da mensagem"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="h-8 text-sm"
                required
                autoFocus
              />
              <textarea
                placeholder="Conteúdo (opcional)..."
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-md border border-input bg-background text-foreground resize-none min-h-[60px] max-h-[100px]"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setShowCompose(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="h-7 px-3 text-xs gap-1" disabled={sending}>
                  <Send className="w-3 h-3" />
                  {sending ? "Enviando..." : "Enviar"}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="max-h-[380px] overflow-y-auto">
        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : mensagens.length === 0 ? (
          <div className="py-10 text-center">
            <Mail className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma mensagem.</p>
            <Button
              variant="link"
              size="sm"
              className="mt-1 text-xs"
              onClick={() => setShowCompose(true)}
            >
              Criar primeira mensagem
            </Button>
          </div>
        ) : (
          mensagens.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className={cn(
                "border-b border-border/50 last:border-0",
                !msg.lida && "bg-primary/3"
              )}
            >
              <button
                onClick={() => handleExpand(msg.id)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-primary/10 text-primary text-xs font-bold"
                )}>
                  {msg.titulo[0]?.toUpperCase() ?? "M"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn(
                      "text-sm truncate",
                      msg.lida ? "text-foreground font-normal" : "text-foreground font-semibold"
                    )}>
                      {msg.titulo}
                    </p>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                  {msg.conteudo && expanded !== msg.id && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {msg.conteudo}
                    </p>
                  )}
                </div>
                {!msg.lida && (
                  <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                )}
              </button>

              {/* Expanded content */}
              <AnimatePresence>
                {expanded === msg.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3">
                      {msg.conteudo && (
                        <p className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3 mb-2">
                          {msg.conteudo}
                        </p>
                      )}
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                          onClick={() => excluir(msg.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}

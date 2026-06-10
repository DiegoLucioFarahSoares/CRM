"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Users,
  Briefcase,
  Calendar,
  ArrowRight,
  Clock,
  Phone,
  CheckSquare,
  Bell,
} from "lucide-react"
import {
  type Cliente,
  type Negocio,
  formatCurrency,
  getEtapaLabel,
} from "@/lib/crm-data"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: string
  type: "cliente" | "negocio" | "evento"
  title: string
  subtitle: string
  meta?: string
  tipoEvento?: string
}

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (page: string) => void
}

const eventoTipoIcons = {
  reuniao: Users,
  ligacao: Phone,
  tarefa: CheckSquare,
  lembrete: Bell,
}

const eventoTipoLabels: Record<string, string> = {
  reuniao: "Reunião",
  ligacao: "Ligação",
  tarefa: "Tarefa",
  lembrete: "Lembrete",
}

export function GlobalSearch({ isOpen, onClose, onNavigate }: GlobalSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searching, setSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setQuery("")
      setResults([])
      setSelectedIndex(0)
    }
  }, [isOpen])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)

      const [clientesRes, negociosRes, eventosRes] = await Promise.all([
        supabase
          .from("clientes")
          .select("id, nome, empresa, valor, status")
          .or(`nome.ilike.%${query}%,email.ilike.%${query}%,empresa.ilike.%${query}%`)
          .limit(3),
        supabase
          .from("negocios")
          .select("id, titulo, valor, etapa, responsavel")
          .ilike("titulo", `%${query}%`)
          .limit(3),
        supabase
          .from("eventos")
          .select("id, titulo, data, hora_inicio, tipo, concluido")
          .ilike("titulo", `%${query}%`)
          .order("data", { ascending: false })
          .limit(3),
      ])

      const newResults: SearchResult[] = []

      ;(clientesRes.data ?? []).forEach(
        (c: Partial<Cliente> & { id: string; nome: string }) => {
          newResults.push({
            id: c.id,
            type: "cliente",
            title: c.nome,
            subtitle: c.empresa ?? "",
            meta: formatCurrency(c.valor ?? 0),
          })
        }
      )

      ;(negociosRes.data ?? []).forEach(
        (n: Partial<Negocio> & { id: string; titulo: string }) => {
          newResults.push({
            id: n.id,
            type: "negocio",
            title: n.titulo,
            subtitle: n.responsavel ?? getEtapaLabel(n.etapa as Negocio["etapa"]),
            meta: formatCurrency(n.valor ?? 0),
          })
        }
      )

      ;(eventosRes.data ?? []).forEach(
        (e: { id: string; titulo: string; data: string; hora_inicio: string; tipo: string; concluido: boolean }) => {
          const dateLabel = new Date(e.data + "T00:00:00").toLocaleDateString("pt-BR", {
            day: "numeric",
            month: "short",
          })
          newResults.push({
            id: e.id,
            type: "evento",
            title: e.titulo,
            subtitle: `${dateLabel} · ${e.hora_inicio}`,
            meta: eventoTipoLabels[e.tipo] ?? e.tipo,
            tipoEvento: e.tipo,
          })
        }
      )

      setResults(newResults)
      setSelectedIndex(0)
      setSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex])
    } else if (e.key === "Escape") {
      onClose()
    }
  }

  const handleSelect = (result: SearchResult) => {
    const pageMap = { cliente: "clientes", negocio: "negocios", evento: "calendario" }
    onNavigate(pageMap[result.type])
    onClose()
  }

  function getTypeIcon(result: SearchResult) {
    if (result.type === "cliente") return Users
    if (result.type === "negocio") return Briefcase
    if (result.type === "evento") {
      return eventoTipoIcons[result.tipoEvento as keyof typeof eventoTipoIcons] ?? Calendar
    }
    return Calendar
  }

  function getTypeLabel(type: SearchResult["type"]) {
    if (type === "cliente") return "Cliente"
    if (type === "negocio") return "Negócio"
    return "Evento"
  }

  function getTypeColor(type: SearchResult["type"]) {
    if (type === "cliente") return "bg-blue-100 text-blue-700"
    if (type === "negocio") return "bg-green-100 text-green-700"
    return "bg-purple-100 text-purple-700"
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-[15vh]"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-2xl overflow-hidden"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar clientes, negócios, eventos..."
              className="flex-1 bg-transparent text-foreground text-lg outline-none placeholder:text-muted-foreground"
            />
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <kbd className="px-1.5 py-0.5 bg-secondary rounded border border-border">ESC</kbd>
              <span>para fechar</span>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {query.length < 2 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground">
                  Digite pelo menos 2 caracteres para buscar
                </p>
                <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> Clientes
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" /> Negócios
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> Eventos
                  </span>
                </div>
              </div>
            ) : searching ? (
              <div className="p-8 text-center">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-muted-foreground mt-3 text-sm">Buscando...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">
                  Nenhum resultado para &ldquo;{query}&rdquo;
                </p>
              </div>
            ) : (
              <div className="py-2">
                {results.map((result, index) => {
                  const Icon = getTypeIcon(result)
                  return (
                    <motion.button
                      key={`${result.type}-${result.id}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => handleSelect(result)}
                      className={cn(
                        "w-full flex items-center gap-4 px-4 py-3 text-left transition-colors",
                        selectedIndex === index ? "bg-primary/10" : "hover:bg-secondary/50"
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", getTypeColor(result.type))}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground truncate">{result.title}</p>
                          <span className={cn("px-2 py-0.5 rounded text-xs font-medium flex-shrink-0", getTypeColor(result.type))}>
                            {getTypeLabel(result.type)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {result.type === "evento" && <Clock className="w-3 h-3 inline mr-1" />}
                          {result.subtitle}
                        </p>
                      </div>
                      {result.meta && (
                        <span className="text-sm font-medium text-foreground flex-shrink-0">
                          {result.meta}
                        </span>
                      )}
                      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </motion.button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {results.length > 0 && (
            <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-secondary rounded border border-border">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-secondary rounded border border-border">↓</kbd>
                  navegar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-secondary rounded border border-border">Enter</kbd>
                  abrir
                </span>
              </div>
              <span>{results.length} resultado(s)</span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

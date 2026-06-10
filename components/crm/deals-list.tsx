"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Plus,
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
  ChevronDown,
  X,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { type Negocio, formatCurrency, formatDate, getEtapaLabel } from "@/lib/crm-data"
import { AnimatePresence } from "framer-motion"

const STAGE_ICONS = [FileText, TrendingUp, DollarSign, FileText, TrendingUp]
const STAGE_COLORS = [
  "bg-blue-500",
  "bg-primary",
  "bg-amber-500",
  "bg-purple-500",
  "bg-teal-500",
]

const etapas: Negocio["etapa"][] = [
  "prospeccao",
  "qualificacao",
  "proposta",
  "negociacao",
  "fechado",
  "perdido",
]

export function DealsList() {
  const [negocios, setNegocios] = useState<Negocio[]>([])
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [clientes, setClientes] = useState<{ id: string; nome: string }[]>([])
  const [formData, setFormData] = useState({
    titulo: "",
    clienteId: "",
    valor: "",
    etapa: "prospeccao" as Negocio["etapa"],
  })

  async function fetchNegocios() {
    const { data } = await supabase
      .from("negocios")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5)
    setNegocios((data as Negocio[]) ?? [])
  }

  async function fetchClientes() {
    const { data } = await supabase
      .from("clientes")
      .select("id, nome")
      .order("nome")
    setClientes(data ?? [])
  }

  useEffect(() => {
    fetchNegocios()
  }, [])

  function openModal() {
    fetchClientes()
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    await supabase.from("negocios").insert({
      titulo: formData.titulo,
      cliente_id: formData.clienteId || null,
      valor: Number(formData.valor) || 0,
      etapa: formData.etapa,
    })

    setSaving(false)
    setShowModal(false)
    setFormData({ titulo: "", clienteId: "", valor: "", etapa: "prospeccao" })
    fetchNegocios()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">Negócios</CardTitle>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1"
              onClick={openModal}
            >
              <Plus className="w-3 h-3" />
              Novo
            </Button>
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-3">
          {negocios.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum negócio cadastrado.
            </p>
          ) : (
            negocios.map((negocio, index) => {
              const Icon = STAGE_ICONS[index % STAGE_ICONS.length]
              const color = STAGE_COLORS[index % STAGE_COLORS.length]
              return (
                <motion.div
                  key={negocio.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{
                    x: 4,
                    backgroundColor: "hsl(var(--muted) / 0.5)",
                  }}
                  className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors"
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      color
                    )}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{negocio.titulo}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {negocio.data_fechamento ? (
                        <>
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(negocio.data_fechamento)}</span>
                        </>
                      ) : (
                        <span>{getEtapaLabel(negocio.etapa)}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {formatCurrency(negocio.valor)}
                  </span>
                </motion.div>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* Quick Add Modal */}
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
              className="bg-card rounded-xl p-6 w-full max-w-md border border-border shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Novo Negócio</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Título *
                  </label>
                  <Input
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ex: Proposta TechCorp"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Valor (R$)
                    </label>
                    <Input
                      type="number"
                      value={formData.valor}
                      onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Etapa
                    </label>
                    <div className="relative">
                      <select
                        value={formData.etapa}
                        onChange={(e) =>
                          setFormData({ ...formData, etapa: e.target.value as Negocio["etapa"] })
                        }
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground appearance-none cursor-pointer text-sm"
                      >
                        {etapas.map((e) => (
                          <option key={e} value={e}>
                            {getEtapaLabel(e)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>
                {clientes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Cliente
                    </label>
                    <div className="relative">
                      <select
                        value={formData.clienteId}
                        onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground appearance-none cursor-pointer text-sm"
                      >
                        <option value="">Sem cliente</option>
                        {clientes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nome}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={saving}>
                    {saving ? "Salvando..." : "Criar"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

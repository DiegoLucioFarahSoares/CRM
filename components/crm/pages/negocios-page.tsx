"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  MoreHorizontal,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  X,
  ChevronDown,
  LayoutGrid,
  List,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  type Negocio,
  type Cliente,
  formatCurrency,
  formatDate,
  getEtapaColor,
  getEtapaLabel,
} from "@/lib/crm-data"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

const etapas: Negocio["etapa"][] = [
  "prospeccao",
  "qualificacao",
  "proposta",
  "negociacao",
  "fechado",
  "perdido",
]

const defaultForm = {
  titulo: "",
  clienteId: "",
  valor: "",
  etapa: "prospeccao" as Negocio["etapa"],
  probabilidade: "20",
  dataFechamento: "",
  responsavel: "",
  notas: "",
}

export function NegociosPage() {
  const [negocios, setNegocios] = useState<Negocio[]>([])
  const [clientes, setClientes] = useState<Pick<Cliente, "id" | "nome" | "empresa">[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"kanban" | "lista">("kanban")
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedNegocio, setSelectedNegocio] = useState<Negocio | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showDropdown, setShowDropdown] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState(defaultForm)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [negociosRes, clientesRes] = await Promise.all([
      supabase
        .from("negocios")
        .select("*, clientes(id, nome, empresa)")
        .order("created_at", { ascending: false }),
      supabase.from("clientes").select("id, nome, empresa").order("nome"),
    ])

    const data = (negociosRes.data ?? []).map((n: Negocio & { clientes?: { id: string; nome: string; empresa: string } | null }) => ({
      ...n,
      cliente: n.clientes?.empresa || n.clientes?.nome || "",
    }))

    setNegocios(data as Negocio[])
    setClientes((clientesRes.data as Pick<Cliente, "id" | "nome" | "empresa">[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getNegociosByEtapa = (etapa: Negocio["etapa"]) =>
    negocios.filter((n) => n.etapa === etapa)

  const getTotalByEtapa = (etapa: Negocio["etapa"]) =>
    getNegociosByEtapa(etapa).reduce((sum, n) => sum + n.valor, 0)

  const handleAddNegocio = (etapa?: Negocio["etapa"]) => {
    setIsEditing(false)
    setFormData({ ...defaultForm, etapa: etapa || "prospeccao" })
    setShowModal(true)
  }

  const handleEditNegocio = (negocio: Negocio) => {
    setIsEditing(true)
    setSelectedNegocio(negocio)
    setFormData({
      titulo: negocio.titulo,
      clienteId: negocio.cliente_id ?? "",
      valor: String(negocio.valor),
      etapa: negocio.etapa,
      probabilidade: String(negocio.probabilidade),
      dataFechamento: negocio.data_fechamento ?? "",
      responsavel: negocio.responsavel ?? "",
      notas: negocio.notas ?? "",
    })
    setShowModal(true)
    setShowDropdown(null)
  }

  const handleDeleteNegocio = (negocio: Negocio) => {
    setSelectedNegocio(negocio)
    setShowDeleteModal(true)
    setShowDropdown(null)
  }

  const confirmDelete = async () => {
    if (!selectedNegocio) return
    await supabase.from("negocios").delete().eq("id", selectedNegocio.id)
    setShowDeleteModal(false)
    setSelectedNegocio(null)
    fetchData()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      titulo: formData.titulo,
      cliente_id: formData.clienteId || null,
      valor: Number(formData.valor) || 0,
      etapa: formData.etapa,
      probabilidade: Number(formData.probabilidade) || 20,
      data_fechamento: formData.dataFechamento || null,
      responsavel: formData.responsavel || null,
      notas: formData.notas || null,
    }

    if (isEditing && selectedNegocio) {
      await supabase.from("negocios").update(payload).eq("id", selectedNegocio.id)
    } else {
      await supabase.from("negocios").insert(payload)
    }

    setSaving(false)
    setShowModal(false)
    setSelectedNegocio(null)
    fetchData()
  }

  const handleDragEnd = async (negocioId: string, newEtapa: Negocio["etapa"]) => {
    const negocio = negocios.find((n) => n.id === negocioId)
    if (!negocio || negocio.etapa === newEtapa) return

    const novaProbabilidade =
      newEtapa === "fechado" ? 100 : newEtapa === "perdido" ? 0 : negocio.probabilidade

    setNegocios((prev) =>
      prev.map((n) =>
        n.id === negocioId
          ? { ...n, etapa: newEtapa, probabilidade: novaProbabilidade }
          : n
      )
    )

    await supabase
      .from("negocios")
      .update({ etapa: newEtapa, probabilidade: novaProbabilidade })
      .eq("id", negocioId)
  }

  const totalPipeline = negocios
    .filter((n) => n.etapa !== "perdido" && n.etapa !== "fechado")
    .reduce((sum, n) => sum + n.valor * (n.probabilidade / 100), 0)

  const totalFechado = negocios
    .filter((n) => n.etapa === "fechado")
    .reduce((sum, n) => sum + n.valor, 0)

  return (
    <div className="p-4 lg:p-6 h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Negócios</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seu pipeline de vendas.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-secondary rounded-lg p-1">
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("kanban")}
              className="gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              Kanban
            </Button>
            <Button
              variant={viewMode === "lista" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("lista")}
              className="gap-2"
            >
              <List className="w-4 h-4" />
              Lista
            </Button>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={() => handleAddNegocio()} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Negócio
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">Total Pipeline</p>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(totalPipeline)}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">Fechados</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalFechado)}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">Em Aberto</p>
          <p className="text-2xl font-bold text-blue-600">
            {negocios.filter((n) => !["fechado", "perdido"].includes(n.etapa)).length}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
          <p className="text-2xl font-bold text-foreground">
            {Math.round(
              (negocios.filter((n) => n.etapa === "fechado").length /
                Math.max(negocios.length, 1)) *
                100
            )}
            %
          </p>
        </div>
      </motion.div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Carregando negócios...</div>
      ) : (
        <>
          {/* Kanban View */}
          {viewMode === "kanban" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4 overflow-x-auto pb-4"
            >
              {etapas.map((etapa, index) => (
                <motion.div
                  key={etapa}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex-shrink-0 w-80"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const negocioId = e.dataTransfer.getData("negocioId")
                    if (negocioId) handleDragEnd(negocioId, etapa)
                  }}
                >
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-medium",
                            getEtapaColor(etapa)
                          )}
                        >
                          {getEtapaLabel(etapa)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({getNegociosByEtapa(etapa).length})
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddNegocio(etapa)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="text-sm text-muted-foreground mb-4">
                      {formatCurrency(getTotalByEtapa(etapa))}
                    </div>

                    <div className="space-y-3 min-h-[200px]">
                      <AnimatePresence>
                        {getNegociosByEtapa(etapa).map((negocio) => (
                          <motion.div
                            key={negocio.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            draggable
                            onDragStart={(e) => {
                              ;(e as unknown as React.DragEvent).dataTransfer.setData(
                                "negocioId",
                                negocio.id
                              )
                            }}
                            className="bg-card rounded-lg p-4 border border-border shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-medium text-foreground text-sm line-clamp-2">
                                {negocio.titulo}
                              </h3>
                              <div className="relative">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() =>
                                    setShowDropdown(
                                      showDropdown === negocio.id ? null : negocio.id
                                    )
                                  }
                                >
                                  <MoreHorizontal className="w-3.5 h-3.5" />
                                </Button>
                                <AnimatePresence>
                                  {showDropdown === negocio.id && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.95 }}
                                      className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-10 min-w-[120px]"
                                    >
                                      <button
                                        onClick={() => handleEditNegocio(negocio)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition-colors"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                        Editar
                                      </button>
                                      <button
                                        onClick={() => handleDeleteNegocio(negocio)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Excluir
                                      </button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>

                            <p className="text-xs text-muted-foreground mb-3">
                              {negocio.cliente}
                            </p>

                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <DollarSign className="w-3 h-3" />
                                <span className="font-medium text-foreground">
                                  {formatCurrency(negocio.valor)}
                                </span>
                              </div>
                              {negocio.data_fechamento && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(negocio.data_fechamento)}
                                </div>
                              )}
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${negocio.probabilidade}%` }}
                                  className={cn(
                                    "h-full rounded-full",
                                    negocio.probabilidade >= 70
                                      ? "bg-green-500"
                                      : negocio.probabilidade >= 40
                                      ? "bg-amber-500"
                                      : "bg-red-500"
                                  )}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {negocio.probabilidade}%
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {getNegociosByEtapa(etapa).length === 0 && (
                        <div className="py-8 text-center text-sm text-muted-foreground/50 border-2 border-dashed border-border rounded-lg">
                          Arraste ou clique em +
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* List View */}
          {viewMode === "lista" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              {negocios.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  Nenhum negócio cadastrado. Clique em &apos;Novo Negócio&apos; para começar.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                          Negócio
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                          Cliente
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                          Valor
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                          Etapa
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                          Probabilidade
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                          Fechamento
                        </th>
                        <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {negocios.map((negocio, index) => (
                        <motion.tr
                          key={negocio.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="hover:bg-secondary/30 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <p className="font-medium text-foreground">{negocio.titulo}</p>
                            {negocio.responsavel && (
                              <p className="text-sm text-muted-foreground">{negocio.responsavel}</p>
                            )}
                          </td>
                          <td className="py-4 px-6 text-foreground">{negocio.cliente}</td>
                          <td className="py-4 px-6 font-medium text-foreground">
                            {formatCurrency(negocio.valor)}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={cn(
                                "px-2.5 py-1 rounded-full text-xs font-medium",
                                getEtapaColor(negocio.etapa)
                              )}
                            >
                              {getEtapaLabel(negocio.etapa)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full",
                                    negocio.probabilidade >= 70
                                      ? "bg-green-500"
                                      : negocio.probabilidade >= 40
                                      ? "bg-amber-500"
                                      : "bg-red-500"
                                  )}
                                  style={{ width: `${negocio.probabilidade}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {negocio.probabilidade}%
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-muted-foreground">
                            {formatDate(negocio.data_fechamento)}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditNegocio(negocio)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNegocio(negocio)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </>
      )}

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
              className="bg-card rounded-xl p-4 sm:p-6 w-full max-w-lg mx-4 sm:mx-0 border border-border shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  {isEditing ? "Editar Negócio" : "Novo Negócio"}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Título do Negócio *
                  </label>
                  <Input
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ex: Implementação ERP"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Cliente
                  </label>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Valor (R$)
                    </label>
                    <Input
                      type="number"
                      value={formData.valor}
                      onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Probabilidade (%)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.probabilidade}
                      onChange={(e) =>
                        setFormData({ ...formData, probabilidade: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Etapa
                    </label>
                    <div className="relative">
                      <select
                        value={formData.etapa}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            etapa: e.target.value as Negocio["etapa"],
                          })
                        }
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground appearance-none cursor-pointer"
                      >
                        {etapas.map((etapa) => (
                          <option key={etapa} value={etapa}>
                            {getEtapaLabel(etapa)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Data de Fechamento
                    </label>
                    <Input
                      type="date"
                      value={formData.dataFechamento}
                      onChange={(e) =>
                        setFormData({ ...formData, dataFechamento: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Responsável
                  </label>
                  <Input
                    value={formData.responsavel}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                    placeholder="Nome do responsável"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Notas
                  </label>
                  <textarea
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    placeholder="Observações sobre o negócio..."
                    className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-foreground resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={saving}>
                    {saving ? "Salvando..." : isEditing ? "Salvar Alterações" : "Criar Negócio"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-xl p-4 sm:p-6 w-full max-w-md mx-4 sm:mx-0 border border-border shadow-xl"
            >
              <h2 className="text-xl font-bold text-foreground mb-2">Excluir Negócio</h2>
              <p className="text-muted-foreground mb-6">
                Tem certeza que deseja excluir{" "}
                <strong>{selectedNegocio?.titulo}</strong>? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancelar
                </Button>
                <Button variant="destructive" className="flex-1" onClick={confirmDelete}>
                  Excluir
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

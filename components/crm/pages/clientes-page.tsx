"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Plus,
  Mail,
  Phone,
  Building2,
  Edit,
  Trash2,
  X,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { type Cliente, formatCurrency, getStatusColor } from "@/lib/crm-data"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

interface ClientesPageProps {
  onNavigate?: (page: string) => void
}

const defaultForm = {
  nome: "",
  email: "",
  telefone: "",
  empresa: "",
  cargo: "",
  status: "prospecto" as Cliente["status"],
}

export function ClientesPage({ onNavigate }: ClientesPageProps) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("todos")
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showDropdown, setShowDropdown] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState(defaultForm)

  const fetchClientes = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from("clientes")
      .select("*")
      .order("created_at", { ascending: false })
    setClientes((data as Cliente[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchClientes()
  }, [fetchClientes])

  const filteredClientes = clientes.filter((cliente) => {
    const matchesSearch =
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cliente.email ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cliente.empresa ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "todos" || cliente.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleAddCliente = () => {
    setIsEditing(false)
    setFormData(defaultForm)
    setShowModal(true)
  }

  const handleEditCliente = (cliente: Cliente) => {
    setIsEditing(true)
    setSelectedCliente(cliente)
    setFormData({
      nome: cliente.nome,
      email: cliente.email ?? "",
      telefone: cliente.telefone ?? "",
      empresa: cliente.empresa ?? "",
      cargo: cliente.cargo ?? "",
      status: cliente.status,
    })
    setShowModal(true)
    setShowDropdown(null)
  }

  const handleDeleteCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setShowDeleteModal(true)
    setShowDropdown(null)
  }

  const confirmDelete = async () => {
    if (!selectedCliente) return
    await supabase.from("clientes").delete().eq("id", selectedCliente.id)
    setShowDeleteModal(false)
    setSelectedCliente(null)
    fetchClientes()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      nome: formData.nome,
      email: formData.email || null,
      telefone: formData.telefone || null,
      empresa: formData.empresa || null,
      cargo: formData.cargo || null,
      status: formData.status,
    }

    if (isEditing && selectedCliente) {
      await supabase.from("clientes").update(payload).eq("id", selectedCliente.id)
    } else {
      await supabase.from("clientes").insert(payload)
    }

    setSaving(false)
    setShowModal(false)
    setSelectedCliente(null)
    fetchClientes()
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

  const statusOptions = [
    { value: "todos", label: "Todos" },
    { value: "ativo", label: "Ativos" },
    { value: "inativo", label: "Inativos" },
    { value: "prospecto", label: "Prospectos" },
  ]

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie sua base de clientes e prospectos.
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={handleAddCliente} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Cliente
          </Button>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              variant={filterStatus === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(option.value)}
              className="transition-all"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-foreground">{clientes.length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">Ativos</p>
          <p className="text-2xl font-bold text-green-600">
            {clientes.filter((c) => c.status === "ativo").length}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">Prospectos</p>
          <p className="text-2xl font-bold text-blue-600">
            {clientes.filter((c) => c.status === "prospecto").length}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">Valor Total</p>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(clientes.reduce((sum, c) => sum + (c.valor ?? 0), 0))}
          </p>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-xl border border-border overflow-hidden"
      >
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            Carregando clientes...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                    Cliente
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                    Contato
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                    Empresa
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                    Valor
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <AnimatePresence>
                  {filteredClientes.map((cliente, index) => (
                    <motion.tr
                      key={cliente.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                            {getInitials(cliente.nome)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{cliente.nome}</p>
                            <p className="text-sm text-muted-foreground">{cliente.cargo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          {cliente.email && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="w-3.5 h-3.5" />
                              {cliente.email}
                            </div>
                          )}
                          {cliente.telefone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="w-3.5 h-3.5" />
                              {cliente.telefone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {cliente.empresa && (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground">{cliente.empresa}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                            getStatusColor(cliente.status)
                          )}
                        >
                          {cliente.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-foreground">
                          {formatCurrency(cliente.valor ?? 0)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end relative">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCliente(cliente)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteCliente(cliente)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredClientes.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              {clientes.length === 0
                ? "Nenhum cliente cadastrado. Clique em 'Novo Cliente' para começar."
                : "Nenhum cliente encontrado."}
            </p>
          </div>
        )}
      </motion.div>

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
                  {isEditing ? "Editar Cliente" : "Novo Cliente"}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Nome completo *
                  </label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Digite o nome"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Telefone
                    </label>
                    <Input
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Empresa
                    </label>
                    <Input
                      value={formData.empresa}
                      onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                      placeholder="Nome da empresa"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Cargo
                    </label>
                    <Input
                      value={formData.cargo}
                      onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                      placeholder="Cargo"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value as Cliente["status"] })
                      }
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground appearance-none cursor-pointer"
                    >
                      <option value="prospecto">Prospecto</option>
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
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
                    {saving ? "Salvando..." : isEditing ? "Salvar Alterações" : "Criar Cliente"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
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
              <h2 className="text-xl font-bold text-foreground mb-2">Excluir Cliente</h2>
              <p className="text-muted-foreground mb-6">
                Tem certeza que deseja excluir <strong>{selectedCliente?.nome}</strong>? Esta
                ação não pode ser desfeita.
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

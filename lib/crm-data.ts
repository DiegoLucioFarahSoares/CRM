// Tipos do CRM
export interface Cliente {
  id: string
  nome: string
  email: string
  telefone: string
  empresa: string
  cargo: string
  avatar?: string
  status: "ativo" | "inativo" | "prospecto"
  valor: number
  ultimo_contato: string | null
  created_at: string
  updated_at: string
}

export interface Negocio {
  id: string
  titulo: string
  cliente?: string
  cliente_id: string | null
  clientes?: { id: string; nome: string; empresa: string } | null
  valor: number
  etapa: "prospeccao" | "qualificacao" | "proposta" | "negociacao" | "fechado" | "perdido"
  probabilidade: number
  data_fechamento: string | null
  responsavel: string | null
  notas: string | null
  created_at: string
  updated_at: string
}

export interface Evento {
  id: string
  titulo: string
  descricao: string
  data: string
  horaInicio: string
  horaFim: string
  tipo: "reuniao" | "ligacao" | "tarefa" | "lembrete"
  clienteId?: string
  cliente?: string
  concluido: boolean
}

// Helper functions
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatDate(date: string | null): string {
  if (!date) return "—"
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

export function getStatusColor(status: Cliente["status"]) {
  switch (status) {
    case "ativo":
      return "bg-green-100 text-green-700"
    case "inativo":
      return "bg-gray-100 text-gray-700"
    case "prospecto":
      return "bg-blue-100 text-blue-700"
  }
}

export function getEtapaColor(etapa: Negocio["etapa"]) {
  switch (etapa) {
    case "prospeccao":
      return "bg-slate-100 text-slate-700"
    case "qualificacao":
      return "bg-blue-100 text-blue-700"
    case "proposta":
      return "bg-purple-100 text-purple-700"
    case "negociacao":
      return "bg-amber-100 text-amber-700"
    case "fechado":
      return "bg-green-100 text-green-700"
    case "perdido":
      return "bg-red-100 text-red-700"
  }
}

export function getEtapaLabel(etapa: Negocio["etapa"]) {
  switch (etapa) {
    case "prospeccao":
      return "Prospecção"
    case "qualificacao":
      return "Qualificação"
    case "proposta":
      return "Proposta"
    case "negociacao":
      return "Negociação"
    case "fechado":
      return "Fechado"
    case "perdido":
      return "Perdido"
  }
}

export function getTipoEventoColor(tipo: Evento["tipo"]) {
  switch (tipo) {
    case "reuniao":
      return "bg-primary text-primary-foreground"
    case "ligacao":
      return "bg-blue-500 text-white"
    case "tarefa":
      return "bg-amber-500 text-white"
    case "lembrete":
      return "bg-purple-500 text-white"
  }
}

export function getTipoEventoIcon(tipo: Evento["tipo"]) {
  switch (tipo) {
    case "reuniao":
      return "Users"
    case "ligacao":
      return "Phone"
    case "tarefa":
      return "CheckSquare"
    case "lembrete":
      return "Bell"
  }
}

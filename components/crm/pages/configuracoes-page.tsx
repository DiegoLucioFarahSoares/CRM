"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  User,
  Building2,
  Bell,
  Lock,
  Palette,
  Globe,
  Mail,
  CreditCard,
  Users,
  Shield,
  Smartphone,
  Moon,
  Sun,
  Check,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type SettingsTab =
  | "perfil"
  | "empresa"
  | "notificacoes"
  | "seguranca"
  | "aparencia"
  | "integrações"

const tabs: { id: SettingsTab; label: string; icon: typeof User }[] = [
  { id: "perfil", label: "Perfil", icon: User },
  { id: "empresa", label: "Empresa", icon: Building2 },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "seguranca", label: "Segurança", icon: Lock },
  { id: "aparencia", label: "Aparência", icon: Palette },
  { id: "integrações", label: "Integrações", icon: Globe },
]

export function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("perfil")
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light")
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    deals: true,
    tasks: false,
    reports: true,
  })

  const [profile, setProfile] = useState({
    nome: "Carlos Silva",
    email: "carlos.silva@empresa.com",
    telefone: "(11) 99999-9999",
    cargo: "Gerente de Vendas",
  })

  const [company, setCompany] = useState({
    nome: "Empresa Exemplo LTDA",
    cnpj: "12.345.678/0001-90",
    endereco: "Av. Paulista, 1000 - São Paulo, SP",
    telefone: "(11) 3333-4444",
  })

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas preferências e configurações da conta.
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-64 flex-shrink-0"
        >
          <nav className="bg-card rounded-xl border border-border p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1"
        >
          {/* Profile Tab */}
          {activeTab === "perfil" && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Informações do Perfil
              </h2>

              <div className="flex items-start gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                  CS
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{profile.nome}</h3>
                  <p className="text-sm text-muted-foreground">{profile.cargo}</p>
                  <Button variant="outline" size="sm" className="mt-3">
                    Alterar Foto
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Nome Completo
                    </label>
                    <Input
                      value={profile.nome}
                      onChange={(e) =>
                        setProfile({ ...profile, nome: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile({ ...profile, email: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Telefone
                    </label>
                    <Input
                      value={profile.telefone}
                      onChange={(e) =>
                        setProfile({ ...profile, telefone: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Cargo
                    </label>
                    <Input
                      value={profile.cargo}
                      onChange={(e) =>
                        setProfile({ ...profile, cargo: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <Button>Salvar Alterações</Button>
                </div>
              </div>
            </div>
          )}

          {/* Company Tab */}
          {activeTab === "empresa" && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Dados da Empresa
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Nome da Empresa
                    </label>
                    <Input
                      value={company.nome}
                      onChange={(e) =>
                        setCompany({ ...company, nome: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      CNPJ
                    </label>
                    <Input
                      value={company.cnpj}
                      onChange={(e) =>
                        setCompany({ ...company, cnpj: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Endereço
                  </label>
                  <Input
                    value={company.endereco}
                    onChange={(e) =>
                      setCompany({ ...company, endereco: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Telefone
                  </label>
                  <Input
                    value={company.telefone}
                    onChange={(e) =>
                      setCompany({ ...company, telefone: e.target.value })
                    }
                  />
                </div>
                <div className="pt-4">
                  <Button>Salvar Alterações</Button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notificacoes" && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Preferências de Notificação
              </h2>

              <div className="space-y-4">
                {[
                  {
                    id: "email",
                    label: "Notificações por Email",
                    description: "Receba atualizações importantes por email",
                    icon: Mail,
                  },
                  {
                    id: "push",
                    label: "Notificações Push",
                    description: "Receba notificações no navegador",
                    icon: Smartphone,
                  },
                  {
                    id: "deals",
                    label: "Atualizações de Negócios",
                    description: "Notificações sobre alterações em negócios",
                    icon: CreditCard,
                  },
                  {
                    id: "tasks",
                    label: "Lembretes de Tarefas",
                    description: "Receba lembretes sobre suas tarefas",
                    icon: Bell,
                  },
                  {
                    id: "reports",
                    label: "Relatórios Semanais",
                    description: "Resumo semanal de desempenho",
                    icon: Building2,
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setNotifications({
                          ...notifications,
                          [item.id]:
                            !notifications[item.id as keyof typeof notifications],
                        })
                      }
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative",
                        notifications[item.id as keyof typeof notifications]
                          ? "bg-primary"
                          : "bg-secondary"
                      )}
                    >
                      <motion.div
                        animate={{
                          x: notifications[item.id as keyof typeof notifications]
                            ? 26
                            : 2,
                        }}
                        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "seguranca" && (
            <div className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">
                  Alterar Senha
                </h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Senha Atual
                    </label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Nova Senha
                    </label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Confirmar Nova Senha
                    </label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <Button>Atualizar Senha</Button>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Autenticação de Dois Fatores
                </h2>
                <p className="text-muted-foreground mb-4">
                  Adicione uma camada extra de segurança à sua conta.
                </p>
                <Button variant="outline" className="gap-2">
                  <Shield className="w-4 h-4" />
                  Configurar 2FA
                </Button>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Sessões Ativas
                </h2>
                <div className="space-y-3">
                  {[
                    { device: "Chrome - Windows", location: "São Paulo, BR", current: true },
                    { device: "Safari - iPhone", location: "São Paulo, BR", current: false },
                  ].map((session, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">
                            {session.device}
                            {session.current && (
                              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                Atual
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {session.location}
                          </p>
                        </div>
                      </div>
                      {!session.current && (
                        <Button variant="ghost" size="sm" className="text-destructive">
                          Encerrar
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === "aparencia" && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Tema
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: "light", label: "Claro", icon: Sun },
                  { id: "dark", label: "Escuro", icon: Moon },
                  { id: "system", label: "Sistema", icon: Smartphone },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setTheme(option.id as typeof theme)}
                    className={cn(
                      "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all",
                      theme === option.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        theme === option.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      <option.icon className="w-6 h-6" />
                    </div>
                    <span className="font-medium text-foreground">{option.label}</span>
                    {theme === option.id && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === "integrações" && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Integrações Disponíveis
              </h2>

              <div className="space-y-4">
                {[
                  {
                    name: "Google Calendar",
                    description: "Sincronize seus eventos automaticamente",
                    connected: true,
                  },
                  {
                    name: "Slack",
                    description: "Receba notificações no Slack",
                    connected: false,
                  },
                  {
                    name: "WhatsApp Business",
                    description: "Integração com WhatsApp para comunicação",
                    connected: false,
                  },
                  {
                    name: "Pipedrive",
                    description: "Importe contatos e negócios do Pipedrive",
                    connected: true,
                  },
                  {
                    name: "HubSpot",
                    description: "Sincronize com HubSpot CRM",
                    connected: false,
                  },
                ].map((integration) => (
                  <div
                    key={integration.name}
                    className="flex items-center justify-between p-4 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                        <Globe className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {integration.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={integration.connected ? "outline" : "default"}
                      size="sm"
                    >
                      {integration.connected ? "Desconectar" : "Conectar"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

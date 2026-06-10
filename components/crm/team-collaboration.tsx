"use client"

import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const team = [
  {
    id: 1,
    name: "Alexandra Deff",
    task: "Prospecção de Novos Clientes",
    status: "completed",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alexandra",
  },
  {
    id: 2,
    name: "Edwin Adenike",
    task: "Negociação Contrato ABC",
    status: "in-progress",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Edwin",
  },
  {
    id: 3,
    name: "Isaac Oluwatemilorun",
    task: "Apresentação para TechCorp",
    status: "pending",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Isaac",
  },
  {
    id: 4,
    name: "David Oshodi",
    task: "Follow-up Clientes Inativos",
    status: "in-progress",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
  },
]

const statusConfig = {
  completed: { label: "Concluído", variant: "default" as const, className: "bg-primary text-primary-foreground" },
  "in-progress": { label: "Em Progresso", variant: "secondary" as const, className: "bg-amber-100 text-amber-700" },
  pending: { label: "Pendente", variant: "outline" as const, className: "bg-muted text-muted-foreground" },
}

export function TeamCollaboration() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">Equipe de Vendas</CardTitle>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <Plus className="w-3 h-3" />
              Add Membro
            </Button>
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-3">
          {team.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              whileHover={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}
              className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors"
            >
              <Avatar className="w-8 h-8 border border-border">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {member.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{member.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  Trabalhando em: <span className="font-medium">{member.task}</span>
                </p>
              </div>
              <Badge
                variant={statusConfig[member.status].variant}
                className={cn("text-xs", statusConfig[member.status].className)}
              >
                {statusConfig[member.status].label}
              </Badge>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}

"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Bell, Mail, Command, LogOut, Menu } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { NotificationsPanel } from "@/components/crm/notifications-panel"
import { MessagesPanel } from "@/components/crm/messages-panel"

interface HeaderProps {
  onSearchOpen: () => void
  onMobileMenuOpen: () => void
  onNavigate?: (page: string) => void
}

export function Header({ onSearchOpen, onMobileMenuOpen, onNavigate }: HeaderProps) {
  const { user, signOut } = useAuth()

  const [showNotifications, setShowNotifications] = useState(false)
  const [showMessages, setShowMessages] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const [msgCount, setMsgCount] = useState(0)

  const notifRef = useRef<HTMLDivElement>(null)
  const msgRef = useRef<HTMLDivElement>(null)

  const nomeUsuario =
    (user?.user_metadata?.nome as string | undefined) ||
    user?.email?.split("@")[0] ||
    "Usuário"
  const iniciais = nomeUsuario
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  // Load initial badge counts on mount
  useEffect(() => {
    async function fetchCounts() {
      const today = new Date()
      const todayStr = today.toISOString().split("T")[0]
      const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]
      const in3Days = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]

      const [msgRes, evRes, negRes] = await Promise.all([
        supabase
          .from("mensagens")
          .select("id", { count: "exact", head: true })
          .eq("lida", false),
        supabase
          .from("eventos")
          .select("id", { count: "exact", head: true })
          .gte("data", todayStr)
          .lte("data", in3Days)
          .eq("concluido", false),
        supabase
          .from("negocios")
          .select("id", { count: "exact", head: true })
          .lte("data_fechamento", in7Days)
          .gte("data_fechamento", todayStr)
          .not("etapa", "in", '("fechado","perdido")'),
      ])

      // Filter out lidas stored in localStorage
      let notifTotal = (evRes.count ?? 0) + (negRes.count ?? 0)
      try {
        const lidas = JSON.parse(localStorage.getItem("crm_notif_lidas") ?? "[]") as string[]
        notifTotal = Math.max(0, notifTotal - lidas.length)
      } catch { /* ignore */ }

      setMsgCount(msgRes.count ?? 0)
      setNotifCount(notifTotal)
    }
    fetchCounts()
  }, [])

  // Close panels on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
      if (msgRef.current && !msgRef.current.contains(e.target as Node)) {
        setShowMessages(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault()
        onSearchOpen()
      }
      if (e.key === "Escape") {
        setShowNotifications(false)
        setShowMessages(false)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onSearchOpen])

  async function handleSignOut() {
    try {
      await signOut()
    } finally {
      // Use full page navigation to ensure middleware sees cleared session
      window.location.href = "/login"
    }
  }

  const handleNotifCountChange = useCallback((count: number) => setNotifCount(count), [])
  const handleMsgCountChange = useCallback((count: number) => setMsgCount(count), [])

  function toggleNotifications() {
    setShowMessages(false)
    setShowNotifications((v) => !v)
  }

  function toggleMessages() {
    setShowNotifications(false)
    setShowMessages((v) => !v)
  }

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors mr-2"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5 text-muted-foreground" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <button
          onClick={onSearchOpen}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-left"
        >
          <Search className="w-4 h-4 text-muted-foreground" />
          <span className="flex-1 text-sm text-muted-foreground">
            Buscar clientes, negócios, eventos...
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-background px-2 py-0.5 rounded border border-border">
            <Command className="w-3 h-3" />
            <span>F</span>
          </div>
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1 ml-4">
        {/* Messages */}
        <div ref={msgRef} className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMessages}
            className={`relative p-2 rounded-lg transition-colors ${showMessages ? "bg-secondary" : "hover:bg-secondary"}`}
            title="Mensagens"
          >
            <Mail className="w-5 h-5 text-muted-foreground" />
            {msgCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 min-w-[14px] h-[14px] rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center px-0.5"
              >
                {msgCount > 9 ? "9+" : msgCount}
              </motion.span>
            )}
          </motion.button>

          <AnimatePresence>
            {showMessages && (
              <MessagesPanel
                onClose={() => setShowMessages(false)}
                onCountChange={handleMsgCountChange}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleNotifications}
            className={`relative p-2 rounded-lg transition-colors ${showNotifications ? "bg-secondary" : "hover:bg-secondary"}`}
            title="Notificações"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {notifCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 min-w-[14px] h-[14px] rounded-full bg-destructive text-white text-[9px] font-bold flex items-center justify-center px-0.5"
              >
                {notifCount > 9 ? "9+" : notifCount}
              </motion.span>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <NotificationsPanel
                onClose={() => setShowNotifications(false)}
                onNavigate={(page) => {
                  onNavigate?.(page)
                  setShowNotifications(false)
                }}
                onCountChange={handleNotifCountChange}
              />
            )}
          </AnimatePresence>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 pl-3 ml-1 border-l border-border">
          <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-3">
            <Avatar className="w-9 h-9 border-2 border-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {iniciais}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-foreground">{nomeUsuario}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSignOut}
            className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </header>
  )
}

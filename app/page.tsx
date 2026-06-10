"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Sidebar } from "@/components/crm/sidebar"
import { Header } from "@/components/crm/header"
import { GlobalSearch } from "@/components/crm/global-search"
import { useAuth } from "@/lib/auth-context"
import { DashboardPage } from "@/components/crm/pages/dashboard-page"
import { ClientesPage } from "@/components/crm/pages/clientes-page"
import { NegociosPage } from "@/components/crm/pages/negocios-page"
import { CalendarioPage } from "@/components/crm/pages/calendario-page"
import { RelatoriosPage } from "@/components/crm/pages/relatorios-page"
import { ConfiguracoesPage } from "@/components/crm/pages/configuracoes-page"

export default function CRMDashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [activeMenuItem, setActiveMenuItem] = useState("dashboard")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const renderPage = () => {
    switch (activeMenuItem) {
      case "dashboard":
        return <DashboardPage onNavigate={setActiveMenuItem} />
      case "clientes":
        return <ClientesPage onNavigate={setActiveMenuItem} />
      case "negocios":
        return <NegociosPage />
      case "calendario":
        return <CalendarioPage />
      case "relatorios":
        return <RelatoriosPage />
      case "configuracoes":
        return <ConfiguracoesPage />
      default:
        return <DashboardPage onNavigate={setActiveMenuItem} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeItem={activeMenuItem}
        onItemClick={(id) => { setActiveMenuItem(id); setIsMobileMenuOpen(false) }}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      <div
        className={
          isSidebarCollapsed
            ? "min-h-screen transition-all duration-300 lg:ml-20"
            : "min-h-screen transition-all duration-300 lg:ml-[280px]"
        }
      >
        <Header
          onSearchOpen={() => setIsSearchOpen(true)}
          onMobileMenuOpen={() => setIsMobileMenuOpen(true)}
          onNavigate={setActiveMenuItem}
        />
        
        <AnimatePresence mode="wait">
          <motion.main
            key={activeMenuItem}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderPage()}
          </motion.main>
        </AnimatePresence>
      </div>

      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(page) => {
          setActiveMenuItem(page)
          setIsSearchOpen(false)
        }}
      />
    </div>
  )
}

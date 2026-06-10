"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Building2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

interface SidebarProps {
  activeItem: string
  onItemClick: (item: string) => void
  isCollapsed: boolean
  onCollapsedChange: (v: boolean) => void
  isMobileOpen: boolean
  onMobileClose: () => void
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "clientes", label: "Clientes", icon: Users, badge: 24 },
  { id: "negocios", label: "Negócios", icon: Briefcase, badge: 8 },
  { id: "calendario", label: "Calendário", icon: Calendar },
  { id: "relatorios", label: "Relatórios", icon: BarChart3 },
]

const generalItems = [
  { id: "configuracoes", label: "Configurações", icon: Settings },
]

export function Sidebar({ activeItem, onItemClick, isCollapsed, onCollapsedChange, isMobileOpen, onMobileClose }: SidebarProps) {
  const { signOut } = useAuth()
  const router = useRouter()

  function handleItemClick(id: string) {
    onItemClick(id)
    onMobileClose()
  }

  async function handleSignOut() {
    onMobileClose()
    await signOut()
    router.push("/login")
  }

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar wrapper — handles mobile slide */}
      <div
        className={cn(
          "fixed left-0 top-0 h-screen z-50 transition-transform duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Inner aside — handles desktop width collapse */}
        <motion.aside
          initial={false}
          animate={{ width: isCollapsed ? 80 : 280 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="h-full bg-card border-r border-border flex flex-col overflow-hidden"
        >
          {/* Logo */}
          <div className="p-6 flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0"
            >
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="font-semibold text-lg text-foreground whitespace-nowrap"
                >
                  CRM Pro
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Collapse Button — desktop only */}
          <motion.button
            onClick={() => onCollapsedChange(!isCollapsed)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 rounded-full bg-card border border-border items-center justify-center shadow-sm hover:bg-secondary transition-colors"
          >
            <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronLeft className="w-3 h-3 text-muted-foreground" />
            </motion.div>
          </motion.button>

          {/* Menu Section */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Menu
                </motion.span>
              )}
            </AnimatePresence>
            <ul className="mt-3 space-y-1">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <motion.button
                    onClick={() => handleItemClick(item.id)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                      activeItem === item.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex-1 text-left text-sm font-medium whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {item.badge && !isCollapsed && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={cn(
                          "px-2 py-0.5 text-xs font-medium rounded-full",
                          activeItem === item.id
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </motion.button>
                </li>
              ))}
            </ul>

            {/* General Section */}
            <div className="mt-8">
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Geral
                  </motion.span>
                )}
              </AnimatePresence>
              <ul className="mt-3 space-y-1">
                {generalItems.map((item) => (
                  <li key={item.id}>
                    <motion.button
                      onClick={() => handleItemClick(item.id)}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="text-sm font-medium whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </li>
                ))}

                {/* Sign Out */}
                <li>
                  <motion.button
                    onClick={handleSignOut}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="text-sm font-medium whitespace-nowrap"
                        >
                          Sair
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </li>
              </ul>
            </div>
          </nav>
        </motion.aside>
      </div>
    </>
  )
}

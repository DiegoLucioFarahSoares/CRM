"use client"

import { motion } from "framer-motion"
import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  trend?: "up" | "down" | "neutral"
  icon?: LucideIcon
  variant?: "primary" | "default"
  delay?: number
}

export function StatsCard({
  title,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  variant = "default",
  delay = 0,
}: StatsCardProps) {
  const isPrimary = variant === "primary"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "relative p-5 rounded-2xl border transition-shadow duration-300",
        isPrimary
          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
          : "bg-card text-card-foreground border-border hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={cn(
              "text-sm font-medium",
              isPrimary ? "text-primary-foreground/80" : "text-muted-foreground"
            )}
          >
            {title}
          </p>
          <motion.p
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: delay + 0.2 }}
            className="text-3xl font-bold mt-2"
          >
            {value}
          </motion.p>
          {change && (
            <div
              className={cn(
                "flex items-center gap-1 mt-2 text-xs font-medium",
                isPrimary
                  ? "text-primary-foreground/80"
                  : trend === "up"
                  ? "text-primary"
                  : trend === "down"
                  ? "text-destructive"
                  : "text-muted-foreground"
              )}
            >
              {trend === "up" && <TrendingUp className="w-3 h-3" />}
              {trend === "down" && <TrendingDown className="w-3 h-3" />}
              <span>{change}</span>
            </div>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "p-2 rounded-lg transition-colors",
            isPrimary
              ? "bg-primary-foreground/20 hover:bg-primary-foreground/30"
              : "bg-secondary hover:bg-secondary/80"
          )}
        >
          {Icon ? (
            <Icon className={cn("w-4 h-4", isPrimary ? "text-primary-foreground" : "text-foreground")} />
          ) : (
            <ArrowUpRight className={cn("w-4 h-4", isPrimary ? "text-primary-foreground" : "text-foreground")} />
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}

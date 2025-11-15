import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { useNotificationStore, type Notification } from "@/store/notificationStore"

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle
}

const colorMap = {
  success: "border-status-verified text-status-verified",
  error: "border-status-failed text-status-failed",
  info: "border-accent-cyan text-accent-cyan",
  warning: "border-status-pending text-status-pending"
}

interface NotificationItemProps {
  notification: Notification
}

const NotificationItem = ({ notification }: NotificationItemProps) => {
  const { removeNotification } = useNotificationStore()
  const Icon = iconMap[notification.type]

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.3 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.2 } }}
      className={cn(
        "relative flex w-full max-w-sm items-start gap-3 rounded-lg border bg-primary-card/90 backdrop-blur-sm p-4 shadow-cyber",
        colorMap[notification.type]
      )}
    >
      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium text-white">{notification.title}</p>
        <p className="text-xs text-slate-400">{notification.message}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-slate-400 hover:text-white"
        onClick={() => removeNotification(notification.id)}
      >
        <X className="h-3 w-3" />
      </Button>
    </motion.div>
  )
}

export const NotificationContainer = () => {
  const { notifications } = useNotificationStore()

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </AnimatePresence>
    </div>
  )
}

export { NotificationItem }
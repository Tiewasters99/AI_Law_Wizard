'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, X, Loader2, FileText, MessageSquare, CheckCircle, XCircle } from 'lucide-react'
import { colors } from '@/app/lib/designSystem'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  type: 'NEW_REQUEST' | 'MESSAGE_RECEIVED' | 'REQUEST_ACCEPTED' | 'REQUEST_REJECTED' | 'REQUEST_CANCELLED'
  title: string
  message: string
  relatedId: string | null
  isRead: boolean
  createdAt: string
}

export function NotificationBell() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?limit=10')
      const data = await response.json()

      if (response.ok) {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notificationIds: [notificationId]
        })
      })

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    setLoading(true)
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          markAllAsRead: true
        })
      })

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)

    // Navigate based on notification type
    if (notification.type === 'NEW_REQUEST' || notification.type === 'REQUEST_ACCEPTED' || notification.type === 'REQUEST_REJECTED') {
      router.push('/directory')
    } else if (notification.type === 'MESSAGE_RECEIVED' && notification.relatedId) {
      router.push(`/inbox?conversationId=${notification.relatedId}`)
    }

    setIsOpen(false)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_REQUEST':
        return <FileText className="w-4 h-4" style={{ color: colors.primary[700] }} />
      case 'MESSAGE_RECEIVED':
        return <MessageSquare className="w-4 h-4" style={{ color: colors.primary[700] }} />
      case 'REQUEST_ACCEPTED':
        return <CheckCircle className="w-4 h-4" style={{ color: colors.success[600] }} />
      case 'REQUEST_REJECTED':
        return <XCircle className="w-4 h-4" style={{ color: colors.error[600] }} />
      default:
        return <Bell className="w-4 h-4" style={{ color: colors.secondary[600] }} />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5" style={{ color: colors.secondary[700] }} />
        {unreadCount > 0 && (
          <span 
            className="absolute top-0 right-0 w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center"
            style={{ backgroundColor: colors.error[500] }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border overflow-hidden z-50"
            style={{ borderColor: colors.secondary[200] }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ 
              backgroundColor: colors.secondary[50],
              borderColor: colors.secondary[200]
            }}>
              <h3 className="font-bold text-sm" style={{ color: colors.text }}>
                Notifications ({unreadCount} unread)
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="text-xs font-semibold hover:underline"
                  style={{ color: colors.primary[700] }}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Mark all read'
                  )}
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-3" style={{ color: colors.secondary[400] }} />
                  <p className="text-sm" style={{ color: colors.secondary[600] }}>
                    No notifications yet
                  </p>
                </div>
              ) : (
                <div>
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b ${!notification.isRead ? 'bg-blue-50' : ''}`}
                      style={{ borderColor: colors.secondary[200] }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-sm truncate" style={{ color: colors.text }}>
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="w-2 h-2 rounded-full flex-shrink-0 ml-2" style={{ backgroundColor: colors.primary[600] }} />
                            )}
                          </div>
                          <p className="text-xs line-clamp-2" style={{ color: colors.secondary[700] }}>
                            {notification.message}
                          </p>
                          <p className="text-xs mt-1" style={{ color: colors.secondary[500] }}>
                            {new Date(notification.createdAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t text-center" style={{ 
                backgroundColor: colors.secondary[50],
                borderColor: colors.secondary[200]
              }}>
                <button
                  onClick={() => {
                    router.push('/directory')
                    setIsOpen(false)
                  }}
                  className="text-xs font-semibold hover:underline"
                  style={{ color: colors.primary[700] }}
                >
                  View all in directory
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


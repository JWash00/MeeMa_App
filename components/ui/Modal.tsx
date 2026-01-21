'use client'

import { ReactNode, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  maxWidth?: string
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  maxWidth = 'max-w-2xl',
}: ModalProps) {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className={`${maxWidth} w-full bg-white dark:bg-meema-slate-900 rounded-2xl shadow-xl pointer-events-auto overflow-hidden`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-meema-slate-200 dark:border-meema-slate-800">
                  <h2 className="text-xl font-semibold text-meema-slate-900 dark:text-meema-slate-50">
                    {title}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-meema-slate-100 dark:hover:bg-meema-slate-800 transition-colors"
                    aria-label="Close modal"
                  >
                    <X size={20} className="text-meema-slate-600 dark:text-meema-slate-300" />
                  </button>
                </div>
              )}

              {/* Content */}
              <div className="max-h-[80vh] overflow-y-auto">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

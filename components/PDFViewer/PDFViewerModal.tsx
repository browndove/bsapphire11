"use client"

import React, { useEffect } from 'react'
import { X, Download, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PDFViewerModalProps {
  isOpen: boolean
  onClose: () => void
  fileId: string
  fileName: string
  originalName: string
}

export default function PDFViewerModal({ 
  isOpen, 
  onClose, 
  fileId, 
  fileName, 
  originalName 
}: PDFViewerModalProps) {
  if (!isOpen) return null

  const pdfUrl = `/api/cv-files/${fileId}?inline=true`

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/cv-files/${fileId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = originalName
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full h-full max-w-7xl max-h-[98vh] bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex-shrink-0">
              <FileText className="h-6 w-6 text-red-500" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {originalName}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                PDF Document • Click and drag to navigate
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 h-full bg-gray-50 dark:bg-gray-800">
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0 bg-white"
            style={{ height: 'calc(100vh - 120px)' }}
            title={`PDF Viewer - ${originalName}`}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  )
}

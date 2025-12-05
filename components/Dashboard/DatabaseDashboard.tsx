"use client"

import React, { useState, useEffect, useMemo } from "react"
import { CandidateDataTable, Column } from "@/components/Dashboard/CandidateDataTable"
import { Download, Users, FileText, Calendar, LogOut, MoreVertical, Eye, Star, Trash2, Mail, Archive } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/app/context/AuthContext"
import CandidateQuestionnaireView from './CandidateQuestionnaireView'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner"

// Types for database data
interface Candidate {
  id: number
  first_name: string
  middle_name?: string
  last_name: string
  email: string
  location: string
  main_framework: string
  ui_structure: string
  git_usage: string
  design_tools: string
  cv_file_id?: string
  created_at: string
  cv_filename?: string
  cv_original_name?: string
  cv_file_size?: number
  cv_mime_type?: string
  is_read?: boolean | number
  is_starred?: boolean | number
  is_archived?: boolean | number
}

interface DashboardStats {
  totalCandidates: number
  candidatesThisMonth: number
  candidatesWithCV: number
  topFramework: string
}


// Helper function to format enum values for display
const formatEnumValue = (value: string): string => {
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Helper function to format location specifically
const formatLocation = (location: string): string => {
  if (location === 'greater_accra') return 'Greater Accra'
  if (location === 'outside_greater_accra') return 'Outside Greater Accra'
  return formatEnumValue(location)
}

// Function to download CV
const downloadCV = async (fileId: string, filename: string) => {
  try {
    const response = await fetch(`/api/cv-files/${fileId}`)
    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
    } else {
      console.error('Failed to download CV')
    }
  } catch (error) {
    console.error('Error downloading CV:', error)
  }
}

export default function DatabaseDashboard() {
  const { user, logout } = useAuth()
  // Using Sonner toast - no hook needed
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalCandidates: 0,
    candidatesThisMonth: 0,
    candidatesWithCV: 0,
    topFramework: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'starred' | 'archived' | 'unread' | 'with_cv'>('all')

  // Action handlers for candidate operations
  const handleMarkAsRead = async (candidate: Candidate) => {
    try {
      const response = await fetch(`/api/candidates/${candidate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read', value: !candidate.is_read })
      });

      if (response.ok) {
        setCandidates(prev => 
          prev.map(c => c.id === candidate.id ? { ...c, is_read: !candidate.is_read } : c)
        );
        toast.success(`${candidate.first_name} ${candidate.last_name} has been ${candidate.is_read ? 'marked as unread' : 'marked as read'}.`);
      } else {
        throw new Error('Failed to update read status');
      }
    } catch (error) {
      toast.error("Failed to update read status. Please try again.");
    }
  }

  const handleStarCandidate = async (candidate: Candidate) => {
    try {
      const response = await fetch(`/api/candidates/${candidate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'star', value: !candidate.is_starred })
      });

      if (response.ok) {
        setCandidates(prev => 
          prev.map(c => c.id === candidate.id ? { ...c, is_starred: !candidate.is_starred } : c)
        );
        toast.success(`${candidate.first_name} ${candidate.last_name} has been ${candidate.is_starred ? 'unstarred' : 'starred'}.`);
      } else {
        throw new Error('Failed to update star status');
      }
    } catch (error) {
      toast.error("Failed to update star status. Please try again.");
    }
  }

  const handleDeleteCandidate = async (candidate: Candidate) => {
    if (confirm(`Are you sure you want to delete ${candidate.first_name} ${candidate.last_name}? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/candidates/${candidate.id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setCandidates(prev => prev.filter(c => c.id !== candidate.id));
          toast.success(`${candidate.first_name} ${candidate.last_name} has been permanently deleted.`);
        } else {
          throw new Error('Failed to delete candidate');
        }
      } catch (error) {
        toast.error("Failed to delete candidate. Please try again.");
      }
    }
  }

  const handleEmailCandidate = (candidate: Candidate) => {
    window.open(`mailto:${candidate.email}`, '_blank')
    toast.success(`Opening email to ${candidate.first_name} ${candidate.last_name}`);
  }

  const handleArchiveCandidate = async (candidate: Candidate) => {
    try {
      const response = await fetch(`/api/candidates/${candidate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive', value: true })
      });

      if (response.ok) {
        setCandidates(prev => prev.filter(c => c.id !== candidate.id));
        toast.success(`${candidate.first_name} ${candidate.last_name} has been archived.`);
      } else {
        throw new Error('Failed to archive candidate');
      }
    } catch (error) {
      toast.error("Failed to archive candidate. Please try again.");
    }
  }

  const handleViewDetails = (candidate: Candidate) => {
    toast.info(`${candidate.first_name} ${candidate.last_name}\nEmail: ${candidate.email} | Framework: ${formatEnumValue(candidate.main_framework)} | Location: ${formatLocation(candidate.location)}`);
  }

  // Table columns configuration
  const columns: Column[] = [
    {
      key: "first_name",
      label: "First Name",
      sortable: true
    },
    {
      key: "last_name", 
      label: "Last Name",
      sortable: true
    },
    {
      key: "email",
      label: "Email",
      sortable: true
    },
    {
      key: "location",
      label: "Location",
      sortable: true,
      render: (value) => formatLocation(value)
    },
    {
      key: "main_framework",
      label: "Framework",
      sortable: true,
      render: (value) => formatEnumValue(value)
    },
    {
      key: "cv_filename",
      label: "CV Status",
      render: (value) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        }`}>
          {value ? 'CV Uploaded' : 'CV Missing'}
        </span>
      )
    },
    {
      key: "created_at",
      label: "Applied Date",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row: Candidate) => (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {row.cv_filename && (
              <button
                onClick={() => downloadCV(row.cv_file_id!, row.cv_original_name || row.cv_filename!)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Download CV
              </button>
            )}
          </div>
          <div className="ml-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1" align="end">
                <div className="space-y-1">
                  <button
                    onClick={() => handleViewDetails(row)}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => handleMarkAsRead(row)}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    {row.is_read ? 'Mark as Unread' : 'Mark as Read'}
                  </button>
                  <button
                    onClick={() => handleStarCandidate(row)}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm transition-colors"
                  >
                    <Star className={`h-4 w-4 ${row.is_starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    {row.is_starred ? 'Unstar' : 'Star'} Candidate
                  </button>
                  <button
                    onClick={() => handleEmailCandidate(row)}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    Send Email
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <button
                    onClick={() => handleArchiveCandidate(row)}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm transition-colors"
                  >
                    <Archive className="h-4 w-4" />
                    Archive
                  </button>
                  <button
                    onClick={() => handleDeleteCandidate(row)}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-left hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-sm transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )
    }
  ]

  // Rest of the component logic (fetch data, etc.)
  const fetchCandidates = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/candidates')
      if (!response.ok) {
        throw new Error('Failed to fetch candidates')
      }
      
      const data = await response.json()
      const candidates = data.candidates || []
      setCandidates(candidates)
      
      // Calculate stats
      const now = new Date()
      const thisMonth = candidates.filter((candidate: Candidate) => {
        const createdDate = new Date(candidate.created_at)
        return createdDate.getMonth() === now.getMonth() && 
               createdDate.getFullYear() === now.getFullYear()
      })
      
      const withCV = candidates.filter((candidate: Candidate) => candidate.cv_filename)
      
      const frameworkCounts = candidates.reduce((acc: any, candidate: Candidate) => {
        acc[candidate.main_framework] = (acc[candidate.main_framework] || 0) + 1
        return acc
      }, {})
      
      const topFramework = Object.keys(frameworkCounts).reduce((a, b) => 
        frameworkCounts[a] > frameworkCounts[b] ? a : b, ''
      )
      
      setStats({
        totalCandidates: candidates.length,
        candidatesThisMonth: thisMonth.length,
        candidatesWithCV: withCV.length,
        topFramework: formatEnumValue(topFramework)
      })
    } catch (error) {
      console.error('Error fetching candidates:', error)
      setError('Failed to load candidates')
    } finally {
      setLoading(false)
    }
  }

  // Filter candidates based on status
  const filteredCandidates = useMemo(() => {
    switch (statusFilter) {
      case 'starred':
        return candidates.filter(c => c.is_starred === true || c.is_starred === 1)
      case 'archived':
        return candidates.filter(c => c.is_archived === true || c.is_archived === 1)
      case 'unread':
        return candidates.filter(c => !c.is_read || c.is_read === 0)
      case 'with_cv':
        return candidates.filter(c => c.cv_filename)
      default:
        return candidates
    }
  }, [candidates, statusFilter])

  useEffect(() => {
    fetchCandidates()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={fetchCandidates}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 relative">
      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-20">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-normal text-gray-500 dark:text-gray-500">Total Candidates</p>
                <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{stats.totalCandidates}</p>
              </div>
              <Users className="h-7 w-7 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-normal text-gray-500 dark:text-gray-500">This Month</p>
                <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{stats.candidatesThisMonth}</p>
              </div>
              <Calendar className="h-7 w-7 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-normal text-gray-500 dark:text-gray-500">With CV</p>
                <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{stats.candidatesWithCV}</p>
              </div>
              <FileText className="h-7 w-7 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-normal text-gray-500 dark:text-gray-500">Top Framework</p>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{stats.topFramework}</p>
              </div>
              <Download className="h-7 w-7 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        </div>

        {/* Subtle Filter Bar */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 mb-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show:</span>
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All', count: candidates.length },
                { key: 'starred', label: 'Starred', count: candidates.filter(c => c.is_starred === true || c.is_starred === 1).length },
                { key: 'unread', label: 'Unread', count: candidates.filter(c => !c.is_read || c.is_read === 0).length },
                { key: 'with_cv', label: 'With CV', count: candidates.filter(c => c.cv_filename).length },
                { key: 'archived', label: 'Archived', count: candidates.filter(c => c.is_archived === true || c.is_archived === 1).length },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setStatusFilter(filter.key as any)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    statusFilter === filter.key
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <CandidateDataTable 
            data={filteredCandidates}
            columns={columns}
            title="Candidate Applications"
            pageSize={10}
            searchable={true}
            exportable={true}
          />
        </div>
      </div>

      {/* Profile Avatar */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="relative"
          >
            <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95">
              <AvatarFallback className="bg-blue-500 dark:bg-gray-800 text-white">
                <Users className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            {/* Online indicator */}
            <div className="absolute -bottom-0 -right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
          </button>
          
          {showProfileMenu && (
            <div className="absolute bottom-14 right-0 w-64 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-lg p-4">
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-500 dark:bg-gray-800 text-white">
                    <Users className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Admin User
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

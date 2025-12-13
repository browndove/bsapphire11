"use client"

import React, { useState, useMemo } from "react"
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export interface Column {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, row: any) => React.ReactNode
}

export interface CandidateDataTableProps {
  data: any[]
  columns: Column[]
  title?: string
  pageSize?: number
  searchable?: boolean
  exportable?: boolean
}

// Helper function to format enum values for display
const formatEnumValue = (value: string): string => {
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function CandidateDataTable({
  data,
  columns,
  title = "Data Table",
  pageSize = 10,
  searchable = true,
  exportable = true,
}: CandidateDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = data

    // Apply search filter
    if (searchTerm) {
      console.log('Search term:', searchTerm)
      console.log('Data length before filter:', data.length)
      console.log('Sample data item:', data[0])
      
      filtered = filtered.filter((row) => {
        const columnMatch = columns.some((column) => {
          const value = row[column.key]
          const match = value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
          if (match) {
            console.log(`Match found in column ${column.key}:`, value)
          }
          return match
        })
        
        const fieldMatch = [row.first_name, row.middle_name, row.last_name, row.email].some(field => {
          const match = field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
          if (match) {
            console.log('Match found in field:', field)
          }
          return match
        })
        
        return columnMatch || fieldMatch
      })
      
      console.log('Data length after filter:', filtered.length)
    }

    return filtered
  }, [data, searchTerm, columns])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [filteredData, sortColumn, sortDirection])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(columnKey)
      setSortDirection("asc")
    }
  }

  const handleExport = () => {
    const csvContent = [
      columns.map((col) => col.label).join(","),
      ...sortedData.map((row) =>
        columns.map((col) => row[col.key] || "").join(",")
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title.replace(/\s+/g, "_").toLowerCase()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }


  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-light tracking-tight text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-light mt-1">
            {filteredData.length} candidate{filteredData.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex items-center gap-3">
          {exportable && (
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <Download className="h-4 w-4" />
              <span className="font-light">Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      {searchable && (
        <div className="space-y-2">
          <Label htmlFor="search-candidates" className="text-sm font-light text-gray-600 dark:text-gray-400">
            Search Candidates
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="search-candidates"
              placeholder="Search by name, email, or other details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-gray-300 dark:focus:border-gray-600"
            />
          </div>
        </div>
      )}


      {/* Desktop Table */}
      <div className="hidden md:block border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={`font-light text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap ${
                      column.sortable
                        ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                        : ""
                    }`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && sortColumn === column.key && (
                        <span className="text-xs text-gray-400">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-12 text-gray-400 dark:text-gray-500 font-light"
                  >
                    No candidates found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, index) => (
                  <TableRow key={index} className="border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-200">
                    {columns.map((column) => (
                      <TableCell key={column.key} className="text-sm text-gray-700 dark:text-gray-300 font-light whitespace-nowrap">
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-4">
        {paginatedData.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500 font-light border border-gray-100 dark:border-gray-800 rounded-xl">
            No candidates found
          </div>
        ) : (
          paginatedData.map((row, index) => (
            <div key={index} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 space-y-3">
              {/* Header with name and actions */}
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
                    {row.first_name} {row.last_name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {row.email}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  {columns.find(col => col.key === 'actions')?.render?.(null, row)}
                </div>
              </div>
              
              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 font-light">Location</span>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {columns.find(col => col.key === 'location')?.render?.(row.location, row) || row.location}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 font-light">Framework</span>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {columns.find(col => col.key === 'main_framework')?.render?.(row.main_framework, row) || row.main_framework}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 font-light">Applied Date</span>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {columns.find(col => col.key === 'created_at')?.render?.(row.created_at, row) || row.created_at}
                  </p>
                </div>
                {row.cv_filename && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 font-light">CV</span>
                    <p className="text-blue-600 dark:text-blue-400 font-medium text-xs">
                      Available for download
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
          <div className="text-sm text-gray-500 dark:text-gray-400 font-light">
            Showing <span className="font-medium text-gray-700 dark:text-gray-300">{(currentPage - 1) * pageSize + 1}</span> to{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">{Math.min(currentPage * pageSize, sortedData.length)}</span> of{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">{sortedData.length}</span> results
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline font-light">Previous</span>
            </button>
            
            {/* Current Page Indicator */}
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <span className="font-medium">{currentPage}</span>
              <span className="text-gray-500 dark:text-gray-400">of</span>
              <span className="font-medium">{totalPages}</span>
            </div>
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <span className="hidden sm:inline font-light">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

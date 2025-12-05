"use client"

import React, { useState, useMemo } from "react"
import { Search, Filter, Download, ChevronLeft, ChevronRight, X } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  
  // Advanced filters for questionnaire answers
  const [frameworkFilter, setFrameworkFilter] = useState<string>("")
  const [uiStructureFilter, setUiStructureFilter] = useState<string>("")
  const [gitUsageFilter, setGitUsageFilter] = useState<string>("")
  const [designToolsFilter, setDesignToolsFilter] = useState<string>("")
  const [locationFilter, setLocationFilter] = useState<string>("")
  const [cvStatusFilter, setCvStatusFilter] = useState<string>("")

  // Get unique values for filter dropdowns
  const uniqueFrameworks = useMemo(() => 
    Array.from(new Set(data.map(row => row.main_framework))).filter(Boolean), [data])
  const uniqueUiStructures = useMemo(() => 
    Array.from(new Set(data.map(row => row.ui_structure))).filter(Boolean), [data])
  const uniqueGitUsage = useMemo(() => 
    Array.from(new Set(data.map(row => row.git_usage))).filter(Boolean), [data])
  const uniqueDesignTools = useMemo(() => 
    Array.from(new Set(data.map(row => row.design_tools))).filter(Boolean), [data])
  const uniqueLocations = useMemo(() => 
    Array.from(new Set(data.map(row => row.location))).filter(Boolean), [data])

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = data

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((row) =>
        columns.some((column) => {
          const value = row[column.key]
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        }) ||
        // Also search in questionnaire fields
        [row.first_name, row.middle_name, row.last_name, row.email].some(field =>
          field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply questionnaire filters
    if (frameworkFilter) {
      filtered = filtered.filter(row => row.main_framework === frameworkFilter)
    }
    if (uiStructureFilter) {
      filtered = filtered.filter(row => row.ui_structure === uiStructureFilter)
    }
    if (gitUsageFilter) {
      filtered = filtered.filter(row => row.git_usage === gitUsageFilter)
    }
    if (designToolsFilter) {
      filtered = filtered.filter(row => row.design_tools === designToolsFilter)
    }
    if (locationFilter) {
      filtered = filtered.filter(row => row.location === locationFilter)
    }
    if (cvStatusFilter) {
      if (cvStatusFilter === 'uploaded') {
        filtered = filtered.filter(row => row.cv_filename)
      } else if (cvStatusFilter === 'missing') {
        filtered = filtered.filter(row => !row.cv_filename)
      }
    }

    return filtered
  }, [data, searchTerm, frameworkFilter, uiStructureFilter, gitUsageFilter, designToolsFilter, locationFilter, cvStatusFilter, columns])

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

  const clearAllFilters = () => {
    setFrameworkFilter("")
    setUiStructureFilter("")
    setGitUsageFilter("")
    setDesignToolsFilter("")
    setLocationFilter("")
    setCvStatusFilter("")
    setSearchTerm("")
  }

  const hasActiveFilters = frameworkFilter || uiStructureFilter || gitUsageFilter || designToolsFilter || locationFilter || cvStatusFilter || searchTerm

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

      {/* Advanced Filters */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-light text-gray-700 dark:text-gray-300">
            Filter by Questionnaire Answers
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="ml-auto flex items-center gap-2 px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <X className="h-3 w-3" />
              <span className="font-light">Clear All</span>
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Framework Filter */}
          <div className="space-y-2">
            <Label htmlFor="framework-filter" className="text-xs font-light text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Framework
            </Label>
            <Select value={frameworkFilter || "all"} onValueChange={(value) => setFrameworkFilter(value === "all" ? "" : value)}>
              <SelectTrigger id="framework-filter" className="h-9">
                <SelectValue placeholder="All Frameworks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frameworks</SelectItem>
                {uniqueFrameworks.map((framework) => (
                  <SelectItem key={framework} value={framework}>
                    {formatEnumValue(framework)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* UI Structure Filter */}
          <div className="space-y-2">
            <Label htmlFor="ui-structure-filter" className="text-xs font-light text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              UI Structure
            </Label>
            <Select value={uiStructureFilter || "all"} onValueChange={(value) => setUiStructureFilter(value === "all" ? "" : value)}>
              <SelectTrigger id="ui-structure-filter" className="h-9">
                <SelectValue placeholder="All UI Structures" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All UI Structures</SelectItem>
                {uniqueUiStructures.map((structure) => (
                  <SelectItem key={structure} value={structure}>
                    {formatEnumValue(structure)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Git Usage Filter */}
          <div className="space-y-2">
            <Label htmlFor="git-usage-filter" className="text-xs font-light text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Git Usage
            </Label>
            <Select value={gitUsageFilter || "all"} onValueChange={(value) => setGitUsageFilter(value === "all" ? "" : value)}>
              <SelectTrigger id="git-usage-filter" className="h-9">
                <SelectValue placeholder="All Git Usage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Git Usage</SelectItem>
                {uniqueGitUsage.map((usage) => (
                  <SelectItem key={usage} value={usage}>
                    {formatEnumValue(usage)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Design Tools Filter */}
          <div className="space-y-2">
            <Label htmlFor="design-tools-filter" className="text-xs font-light text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Design Tools
            </Label>
            <Select value={designToolsFilter || "all"} onValueChange={(value) => setDesignToolsFilter(value === "all" ? "" : value)}>
              <SelectTrigger id="design-tools-filter" className="h-9">
                <SelectValue placeholder="All Design Tools" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Design Tools</SelectItem>
                {uniqueDesignTools.map((tool) => (
                  <SelectItem key={tool} value={tool}>
                    {formatEnumValue(tool)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <Label htmlFor="location-filter" className="text-xs font-light text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Location
            </Label>
            <Select value={locationFilter || "all"} onValueChange={(value) => setLocationFilter(value === "all" ? "" : value)}>
              <SelectTrigger id="location-filter" className="h-9">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location === 'greater_accra' ? 'Greater Accra' : 
                     location === 'outside_greater_accra' ? 'Outside Greater Accra' : 
                     formatEnumValue(location)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* CV Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="cv-status-filter" className="text-xs font-light text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              CV Status
            </Label>
            <Select value={cvStatusFilter || "all"} onValueChange={(value) => setCvStatusFilter(value === "all" ? "" : value)}>
              <SelectTrigger id="cv-status-filter" className="h-9">
                <SelectValue placeholder="All CV Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All CV Status</SelectItem>
                <SelectItem value="uploaded">CV Uploaded</SelectItem>
                <SelectItem value="missing">CV Missing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {hasActiveFilters && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredData.length} of {data.length} candidates
        </div>
      )}

      {/* Table */}
      <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={`font-light text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide ${
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
                    <TableCell key={column.key} className="text-sm text-gray-700 dark:text-gray-300 font-light">
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

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
          <div className="text-sm text-gray-500 dark:text-gray-400 font-light">
            Showing <span className="font-medium text-gray-700 dark:text-gray-300">{(currentPage - 1) * pageSize + 1}</span> to{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">{Math.min(currentPage * pageSize, sortedData.length)}</span> of{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">{sortedData.length}</span> results
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="font-light">Previous</span>
            </button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                      currentPage === pageNum
                        ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <span className="font-light">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

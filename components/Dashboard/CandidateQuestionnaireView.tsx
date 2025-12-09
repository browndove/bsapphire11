"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface CandidateQuestionnaireViewProps {
  candidate: {
    id: number
    first_name: string
    middle_name?: string
    last_name: string
    portfolio_url?: string
    github_url?: string
    email: string
    location: string
    main_framework: string
    ui_structure: string
    git_usage: string
    design_tools: string
    frontend_backend?: string
    salary_expectation?: string
    created_at: string
  }
}

// Helper function to format enum values for display
const formatEnumValue = (value: string): string => {
  if (!value) return 'Not specified'
  
  // Special cases for better readability
  const specialCases: { [key: string]: string } = {
    'greater_accra': 'Greater Accra',
    'outside_greater_accra': 'Outside Greater Accra',
    'react_and_nextjs': 'React & Next.js',
    'other_framework': 'Other Framework',
    'no_framework': 'No Framework (Vanilla)',
    'small_reusable_components': 'Small Reusable Components',
    'larger_sections': 'Larger Sections',
    'single_component': 'Single Component',
    'work_on_existing': 'Work on Existing Codebase',
    'own_repos_regular_commits': 'Own Repos with Regular Commits',
    'collaborative_branches_prs': 'Collaborative (Branches & PRs)',
    'basic_commands_occasional': 'Basic Commands (Occasional)',
    'local_machine_only': 'Local Machine Only',
    'other_tools': 'Other Design Tools',
    'prefer_coding_only': 'Prefer Coding Only',
    'api_calls_tutorials': 'API Calls (Tutorials)',
    'write_api_calls': 'Write API Calls',
    'no_backend_preference': 'No Backend Preference',
    'receive_data_props': 'Receive Data as Props',
    'ghs_1500_2000': 'GHS 1,500 - 2,000',
    'ghs_2000_2500': 'GHS 2,000 - 2,500',
    'ghs_2500_3000': 'GHS 2,500 - 3,000'
  }
  
  return specialCases[value] || value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Helper function to get badge styling based on value (monochrome)
const getBadgeClass = (field: string, value: string): string => {
  if (!value) return "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700"
  
  switch (field) {
    case 'framework':
      if (value.includes('react') || value.includes('nextjs')) return "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100"
      if (value === 'no_framework') return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
      return "bg-gray-700 dark:bg-gray-300 text-white dark:text-gray-900 border-gray-700 dark:border-gray-300"
    case 'git':
      if (value.includes('collaborative') || value.includes('own_repos')) return "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100"
      if (value.includes('basic') || value.includes('local')) return "bg-gray-600 dark:bg-gray-400 text-white dark:text-gray-900 border-gray-600 dark:border-gray-400"
      return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
    case 'design':
      if (value === 'figma') return "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100"
      if (value === 'prefer_coding_only') return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
      return "bg-gray-700 dark:bg-gray-300 text-white dark:text-gray-900 border-gray-700 dark:border-gray-300"
    case 'frontend':
      if (value.includes('write_api_calls')) return "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100"
      if (value.includes('tutorials') || value.includes('no_backend')) return "bg-gray-600 dark:bg-gray-400 text-white dark:text-gray-900 border-gray-600 dark:border-gray-400"
      return "bg-gray-700 dark:bg-gray-300 text-white dark:text-gray-900 border-gray-700 dark:border-gray-300"
    case 'salary':
      if (value.includes('2500_3000')) return "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100"
      if (value.includes('2000_2500')) return "bg-gray-700 dark:bg-gray-300 text-white dark:text-gray-900 border-gray-700 dark:border-gray-300"
      return "bg-gray-600 dark:bg-gray-400 text-white dark:text-gray-900 border-gray-600 dark:border-gray-400"
    default:
      return "bg-gray-700 dark:bg-gray-300 text-white dark:text-gray-900 border-gray-700 dark:border-gray-300"
  }
}

export default function CandidateQuestionnaireView({ candidate }: CandidateQuestionnaireViewProps) {
  const fullName = [candidate.first_name, candidate.middle_name, candidate.last_name]
    .filter(Boolean)
    .join(' ')

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Questionnaire Responses</span>
          <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-600">
            ID: {candidate.id}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Personal Information
            </Label>
            <Separator className="mt-1 mb-3" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="full-name" className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Full Name
              </Label>
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md border">
                <span className="text-sm">{fullName}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Email Address
              </Label>
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md border">
                <span className="text-sm">{candidate.email}</span>
              </div>
            </div>
          </div>

          {(candidate.portfolio_url || candidate.github_url) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidate.portfolio_url && (
                <div className="space-y-1">
                  <Label htmlFor="portfolio-url" className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Portfolio URL
                  </Label>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md border">
                    <a href={candidate.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 underline">
                      {candidate.portfolio_url}
                    </a>
                  </div>
                </div>
              )}
              
              {candidate.github_url && (
                <div className="space-y-1">
                  <Label htmlFor="github-url" className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    GitHub URL
                  </Label>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md border">
                    <a href={candidate.github_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 underline">
                      {candidate.github_url}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="location" className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Location
            </Label>
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md border">
              <div className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${getBadgeClass('location', candidate.location)}`}>
                {formatEnumValue(candidate.location)}
              </div>
            </div>
          </div>
        </div>

        {/* Technical Skills */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Technical Skills & Experience
            </Label>
            <Separator className="mt-1 mb-3" />
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="framework" className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Main Framework
              </Label>
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md border">
                <div className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${getBadgeClass('framework', candidate.main_framework)}`}>
                  {formatEnumValue(candidate.main_framework)}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="ui-structure" className="text-xs font-medium text-gray-600 dark:text-gray-400">
                UI Structure Approach
              </Label>
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md border">
                <div className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${getBadgeClass('ui', candidate.ui_structure)}`}>
                  {formatEnumValue(candidate.ui_structure)}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="git-usage" className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Git Usage Level
              </Label>
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md border">
                <div className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${getBadgeClass('git', candidate.git_usage)}`}>
                  {formatEnumValue(candidate.git_usage)}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="design-tools" className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Design Tools Preference
              </Label>
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md border">
                <div className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${getBadgeClass('design', candidate.design_tools)}`}>
                  {formatEnumValue(candidate.design_tools)}
                </div>
              </div>
            </div>

            {candidate.frontend_backend && (
              <div className="space-y-1">
                <Label htmlFor="frontend-backend" className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Frontend-Backend Interaction
                </Label>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md border">
                  <div className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${getBadgeClass('frontend', candidate.frontend_backend)}`}>
                    {formatEnumValue(candidate.frontend_backend)}
                  </div>
                </div>
              </div>
            )}

            {candidate.salary_expectation && (
              <div className="space-y-1">
                <Label htmlFor="salary-expectation" className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Salary Expectation
                </Label>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md border">
                  <div className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${getBadgeClass('salary', candidate.salary_expectation)}`}>
                    {formatEnumValue(candidate.salary_expectation)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Application Info */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Application Information
            </Label>
            <Separator className="mt-1 mb-3" />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="applied-date" className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Application Date
            </Label>
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md border">
              <span className="text-sm">
                {new Date(candidate.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

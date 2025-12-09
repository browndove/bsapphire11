"use client"

import * as React from "react"

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
  onClose?: () => void
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

export default function CandidateQuestionnaireView({ candidate, onClose }: CandidateQuestionnaireViewProps) {
  const fullName = [candidate.first_name, candidate.middle_name, candidate.last_name]
    .filter(Boolean)
    .join(' ')

  return (
    <main className=" bg-background flex items-center justify-center">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-light text-foreground">Application Summary</h1>
          <p className="text-xs text-muted-foreground mt-1">Candidate information and responses</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Personal Information */}
          <div className="border border-border rounded-md p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Personal</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">First Name</span>
                <span className="text-foreground font-light">{candidate.first_name}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Last Name</span>
                <span className="text-foreground font-light">{candidate.last_name}</span>
              </div>
              {candidate.middle_name && (
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Middle Name</span>
                  <span className="text-foreground font-light">{candidate.middle_name}</span>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Email</span>
                <span className="text-foreground font-light text-xs truncate">{candidate.email}</span>
              </div>
              {candidate.portfolio_url && (
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Portfolio</span>
                  <span className="text-foreground font-light text-xs truncate">{candidate.portfolio_url}</span>
                </div>
              )}
              {candidate.github_url && (
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">GitHub</span>
                  <span className="text-foreground font-light text-xs truncate">{candidate.github_url}</span>
                </div>
              )}
            </div>
          </div>

          {/* Location & Compensation */}
          <div className="space-y-4">
            <div className="border border-border rounded-md p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Location</h2>
              <div className="flex justify-between gap-2 text-sm">
                <span className="text-muted-foreground">Region</span>
                <span className="text-foreground font-light">{formatEnumValue(candidate.location)}</span>
              </div>
            </div>
            <div className="border border-border rounded-md p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Compensation</h2>
              <div className="flex justify-between gap-2 text-sm">
                <span className="text-muted-foreground">Salary</span>
                <span className="text-foreground font-light">
                  {candidate.salary_expectation ? formatEnumValue(candidate.salary_expectation) : 'Not specified'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Experience */}
        <div className="border border-border rounded-md p-4 mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Technical</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Framework</span>
              <span className="text-foreground font-light">{formatEnumValue(candidate.main_framework)}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">UI Structure</span>
              <span className="text-foreground font-light text-xs">{formatEnumValue(candidate.ui_structure)}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Git Usage</span>
              <span className="text-foreground font-light">{formatEnumValue(candidate.git_usage)}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Design Tools</span>
              <span className="text-foreground font-light">{formatEnumValue(candidate.design_tools)}</span>
            </div>
            {candidate.frontend_backend && (
              <div className="col-span-2 flex justify-between gap-2">
                <span className="text-muted-foreground">Frontend-Backend</span>
                <span className="text-foreground font-light">{formatEnumValue(candidate.frontend_backend)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          {onClose && (
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </main>
  )
}

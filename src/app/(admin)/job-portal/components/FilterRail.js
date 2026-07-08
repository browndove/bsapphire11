'use client';

import { PortalStages } from '../PortalContext';
import { IconSearch } from './PortalIcons';
import CustomSelect from '@/components/CustomSelect';
import ScreeningFilterChips from './ScreeningFilterChips';

export default function FilterRail({
  jobs,
  selectedJob,
  onJobChange,
  selectedStage,
  onStageChange,
  stages,
  searchQuery,
  onSearchChange,
  screeningQuestions,
  screeningFilters,
  onScreeningFiltersChange,
  screeningFiltersLoading = false,
  onClear,
}) {
  const jobOptions = [
    { value: '__all', label: 'All jobs' },
    ...jobs.map((j) => ({ value: j.id, label: j.title })),
  ];

  return (
    <aside className="ats-filter-rail">
      <div className="ats-filter-panel ats-form">
        <div className="ats-filter-head">
          <h2>Filters</h2>
        </div>

        <div className="ats-filter-section">
          <label className="ats-field-label" htmlFor="filter-search">Search</label>
          <div className="ats-input-icon">
            <IconSearch className="ats-icon ats-icon-sm" />
            <input
              id="filter-search"
              type="search"
              placeholder="Name, email…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        <div className="ats-filter-section">
          <label className="ats-field-label" htmlFor="filter-job">Job</label>
          <CustomSelect
            id="filter-job"
            value={selectedJob}
            onChange={onJobChange}
            options={jobOptions}
          />
        </div>

        <div className="ats-filter-section">
          <span className="ats-field-label">Stage</span>
          <div className="ats-filter-chips">
            <button
              type="button"
              className={`ats-filter-chip ${selectedStage === '__all' ? 'is-on' : ''}`}
              onClick={() => onStageChange('__all')}
            >
              All
            </button>
            {stages.map((k) => (
              <button
                key={k}
                type="button"
                className={`ats-filter-chip ${selectedStage === k ? 'is-on' : ''}`}
                onClick={() => onStageChange(k)}
              >
                {PortalStages.labels[k] || k}
              </button>
            ))}
          </div>
        </div>

        {selectedJob !== '__all' ? (
          screeningQuestions?.length ? (
            <ScreeningFilterChips
              questions={screeningQuestions}
              selectedFilters={screeningFilters}
              onChange={onScreeningFiltersChange}
            />
          ) : (
            <div className="ats-filter-section">
              <span className="ats-field-label">Screening answers</span>
              {screeningFiltersLoading ? (
                <p className="ats-filter-hint">Loading screening filters…</p>
              ) : (
                <p className="ats-filter-hint">
                  No screening filters yet. Add choice questions on the job posting and enable
                  recruiter filters, or wait for candidates to submit answers.
                </p>
              )}
            </div>
          )
        ) : null}

        <button type="button" className="btn btn-outline btn-sm ats-filter-clear" onClick={onClear}>
          Clear filters
        </button>
      </div>
    </aside>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import BgCanvas from '@/components/BgCanvas';

export default function Careers() {
  const [filter, setFilter] = useState('all');

  const jobs = [
    { id: 1, department: 'Development', role: 'vp-software-engineering', title: 'VP of Software Engineering', location: 'Remote, Ghana' },
    { id: 2, department: 'Development', role: 'default', title: 'Senior Backend Engineer', location: 'Remote, Ghana / Global' },
    { id: 3, department: 'Development', role: 'default', title: 'Frontend Developer', location: 'Remote, Africa' },
    { id: 4, department: 'AI', role: 'default', title: 'AI Engineer', location: 'Remote, SA / Europe' },
    { id: 5, department: 'AI', role: 'default', title: 'Machine Learning Architect', location: 'Remote, US / Ghana' },
    { id: 6, department: 'Business', role: 'default', title: 'Business Development Manager', location: 'Remote, Ghana / Global' },
    { id: 7, department: 'Marketing', role: 'default', title: 'Product Marketing Manager', location: 'Remote, Africa' },
    { id: 8, department: 'Finance', role: 'default', title: 'Accountant', location: 'Remote, Accra, GH' },
  ];

  const filteredJobs = filter === 'all' 
    ? jobs 
    : jobs.filter(job => job.department === filter);

  return (
    <>
      <BgCanvas />
      <main>
        {/* Careers Hero */}
        <header className="section" style={{ paddingTop: '150px', paddingBottom: '50px' }}>
          <div className="container text-center slide-up">
            <h1 className="hero-title" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Open roles at Blvck Sapphire</h1>
            <p className="hero-desc" style={{ maxWidth: '600px', margin: '0 auto' }}>Join the architects of infinite scale. We're looking for visionary thinkers to build the resilient automation layers of tomorrow.</p>
          </div>
        </header>

        {/* Careers Filter & List */}
        <section className="section" style={{ paddingTop: '0' }}>
          <div className="container" style={{ maxWidth: '900px' }}>
            {/* Careers Filter */}
            <div className="careers-filter slide-up delay-2">
              <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All roles</button>
              <button className={`filter-btn ${filter === 'Development' ? 'active' : ''}`} onClick={() => setFilter('Development')}>Development</button>
              <button className={`filter-btn ${filter === 'AI' ? 'active' : ''}`} onClick={() => setFilter('AI')}>AI & Data</button>
              <button className={`filter-btn ${filter === 'Business' ? 'active' : ''}`} onClick={() => setFilter('Business')}>Sales & Business</button>
              <button className={`filter-btn ${filter === 'Marketing' ? 'active' : ''}`} onClick={() => setFilter('Marketing')}>Marketing</button>
              <button className={`filter-btn ${filter === 'Finance' ? 'active' : ''}`} onClick={() => setFilter('Finance')}>Finance</button>
            </div>

            {/* Job Trays */}
            <div className="job-list slide-up delay-3">
              {filteredJobs.map((job) => (
                <Link href={`/job?role=${job.role}`} key={job.id} className="job-tray">
                  <div className="job-tray-info">
                    <span className="job-dept">{job.department}</span>
                    <h3 className="job-title-text">{job.title}</h3>
                    <span className="job-location">{job.location}</span>
                  </div>
                  <div className="job-tray-arrow">&#8594;</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

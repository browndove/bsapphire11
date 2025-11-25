"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { notFound } from "next/navigation";

// Job posting data - in a real app, this would come from a database
const jobPostings = {
  "business-lead": {
    id: "business-lead",
    title: "Business Lead",
    company: "BLVCK SAPPHIRE",
    location: "Accra, Ghana",
    type: "Full-time",
    experience: "2+ Years",
    description: "Join BLVCK SAPPHIRE and drive AI innovation across Ghana",
    summary: "We're looking for a Business Lead to support the growth of BLVCK SAPPHIRE in Ghana. You'll coordinate business development, manage key stakeholder relationships, and drive the day-to-day operations of our innovative AI and cybersecurity solutions.",
    keyPoints: ["Business Development", "Stakeholder Management", "Project Coordination", "Operations Support"],
    responsibilities: [
      "Coordinate activities that support growth and expansion of our products",
      "Identify and assess opportunities for AI and cybersecurity solutions",
      "Lead business development efforts including outreach and demos",
      "Maintain relationships with partners, clients, and stakeholders",
      "Coordinate day-to-day operations including scheduling and documentation",
      "Gather and organize client feedback for product and strategy decisions",
      "Support initiatives that drive project success and client satisfaction",
    ],
    qualifications: [
      "Must currently reside in Accra",
      "Master's degree in Business, Public Admin, Marketing, Computer Science, or related field (or Bachelor's with equivalent experience)",
      "2+ years in business development, marketing, project coordination, or related roles",
      "Strong communication and interpersonal skills",
      "Experience coordinating projects from planning to completion",
      "Proven ability to work towards targets and deliver results",
      "Organized, proactive, comfortable in fast-moving startup environment",
    ],
    benefits: [
      { label: "Base Salary", value: "₵3K - ₵10K/month" },
      { label: "Equity", value: "Possible equity in company" },
      { label: "Commission", value: "Performance-based bonuses" },
      { label: "Flexibility", value: "Primarily remote with in-person stakeholder meetings" },
      { label: "Time Off", value: "Paid leave & parental support" },
      { label: "Learning", value: "Training & conference coverage" },
    ],
    applyEmail: "info@blvcksapphire.com",
    learnMoreUrl: "https://www.linkedin.com/posts/blvck-sapphire_business-lead-role-overview-we-are-seeking-activity-7398777998805577729-pede?utm_source=share&utm_medium=member_ios&rcm=ACoAADVgvSEBi2MDLqmgdSh6i8Un_9O5kAPwTJg"
  }
};

export default function JobPostingPage({ params }: { params: { id: string } }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const jobPosting = jobPostings[params.id as keyof typeof jobPostings];
  
  if (!jobPosting) {
    notFound();
  }

  return (
    <section className="min-h-screen bg-white dark:bg-black py-8 sm:py-12 lg:py-20">
      <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <div className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 sm:px-4 py-1.5 sm:py-2 mb-4">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-400">Urgent Hiring</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">{jobPosting.title}</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              {jobPosting.description}
            </p>
          </div>

          {/* Main Card */}
          <div className="group rounded-xl sm:rounded-2xl border border-white/60 dark:border-gray-700/60 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl overflow-hidden shadow-xl shadow-gray-300/30 dark:shadow-gray-900/30 transition-[background-color,border-color,box-shadow] duration-200 hover:shadow-2xl hover:bg-white/95 dark:hover:bg-gray-900/95 hover:border-white/80 dark:hover:border-gray-700/80">

            {/* Content Section */}
            <div className="p-4 sm:p-6 lg:p-8">
              {/* Quick Summary */}
              <div className="mb-6 sm:mb-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3 sm:p-4">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Experience</div>
                    <div className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{jobPosting.experience}</div>
                  </div>
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3 sm:p-4">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Location</div>
                    <div className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{jobPosting.location}</div>
                  </div>
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3 sm:p-4">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Type</div>
                    <div className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{jobPosting.type}</div>
                  </div>
                </div>

                {/* Core Description */}
                <div className="mb-6 sm:mb-8">
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    {jobPosting.summary}
                  </p>
                </div>

                {/* Key Points */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6 sm:mb-8">
                  {jobPosting.keyPoints.map((point, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/60 dark:border-gray-700/60 p-2 sm:p-3 shadow-sm transition-[background-color,border-color] duration-150"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expandable Section */}
              <div className="border-t border-white/60 dark:border-gray-700/60 pt-4 sm:pt-6">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-[background-color,border-color] duration-150 border border-blue-100 dark:border-blue-800"
                >
                  <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                    {isExpanded ? "Hide Details" : "See Full Job Details"}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-blue-600 dark:text-blue-400 transition-[transform,color] duration-200 ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-6 sm:mt-8 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-up-2">
                    {/* Key Responsibilities */}
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">
                        Key Responsibilities
                      </h4>
                      <ul className="space-y-2 sm:space-y-3">
                        {jobPosting.responsibilities.map((item, idx) => (
                          <li key={idx} className="flex gap-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                            <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Qualifications */}
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">Qualifications</h4>
                      <ul className="space-y-2 sm:space-y-3">
                        {jobPosting.qualifications.map((item, idx) => (
                          <li key={idx} className="flex gap-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                            <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Benefits */}
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">Benefits</h4>
                      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                        {jobPosting.benefits.map((benefit, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 p-3 sm:p-4"
                          >
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{benefit.label}</div>
                            <div className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">{benefit.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <a 
                  href={`mailto:${jobPosting.applyEmail}?subject=${jobPosting.title} Application&body=Hi, I'm interested in applying for the ${jobPosting.title} position at ${jobPosting.company}. Please find my application details below.`}
                  className="flex-1 rounded-full bg-blue-600 dark:bg-blue-700 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-white transition-[background-color,box-shadow] duration-150 hover:bg-blue-700 dark:hover:bg-blue-600 shadow-lg hover:shadow-xl text-center"
                >
                  Apply Now
                </a>
                <a 
                  href={jobPosting.learnMoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 transition-[background-color,border-color,box-shadow] duration-150 hover:bg-white/95 dark:hover:bg-gray-800/95 shadow-md hover:shadow-lg text-center"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

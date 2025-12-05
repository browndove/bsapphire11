"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FrontendDeveloperJob = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <section className="min-h-screen bg-white dark:bg-black py-8 sm:py-12 lg:py-20">
        <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-8 sm:mb-12">
              <div className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-3 sm:px-4 py-1.5 sm:py-2 mb-4">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-400">Entry Level</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">Front-End Developer</h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Join BLVCK SAPPHIRE and build cutting-edge AI/ML tools and cybersecurity solutions
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
                      <div className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">1+ Years</div>
                    </div>
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3 sm:p-4">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Location</div>
                      <div className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Remote</div>
                    </div>
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3 sm:p-4">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Type</div>
                      <div className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Full-time</div>
                    </div>
                  </div>

                  {/* Core Description */}
                  <div className="mb-6 sm:mb-8">
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                      We're looking for a Front-End Developer to support the development of user-facing features for our web applications. 
                      You'll work with modern technologies like React and Next.js to build clean, efficient interfaces for our AI/ML and cybersecurity solutions.
                    </p>
                  </div>

                  {/* Key Points */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6 sm:mb-8">
                    {["React/Next.js", "HTML/CSS/JavaScript", "Git/GitHub", "UI/UX Design"].map(
                      (point, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/60 dark:border-gray-700/60 p-2 sm:p-3 shadow-sm transition-[background-color,border-color] duration-150"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">{point}</span>
                        </div>
                      ),
                    )}
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
                          {[
                            "Develop user-facing features for web applications using React and Next.js",
                            "Translate UI/UX designs into responsive, interactive components",
                            "Collaborate with backend developers to integrate APIs and services",
                            "Ensure cross-browser compatibility and optimal performance",
                            "Write clean, maintainable code following best practices",
                            "Participate in code reviews and contribute to team knowledge sharing",
                            "Support testing and debugging of frontend applications",
                          ].map((item, idx) => (
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
                          {[
                            "Bachelor's degree in Computer Science, Engineering, or related field (or equivalent experience)",
                            "1+ year of hands-on experience in front-end development",
                            "Proficiency in HTML, CSS, and JavaScript",
                            "Experience with React, Vue, or Angular framework",
                            "Understanding of responsive design and web development best practices",
                            "Understanding of how front-end applications interact with back-end services (e.g., RESTful APIs, Browser API and error handling)",
                            "Experience with Git and version control",
                            "Strong problem-solving skills and attention to detail",
                          ].map((item, idx) => (
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
                          {[
                            { label: "Base Salary", value: "Competitive salary based on geographic location" },
                            { label: "Work Style", value: "Fully remote with flexible hours" },
                            { label: "Time Off", value: "Paid leave & family support" },
                            { label: "Learning", value: "Training & conference coverage" },
                          ].map((benefit, idx) => (
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
                <div className="mt-6 sm:mt-8 flex justify-center">
                  <a 
                    href="mailto:info@blvcksapphire.com?subject=Front-End Developer Application&body=Hi, I'm interested in applying for the Front-End Developer position at BLVCK SAPPHIRE. Please find my CV attached.%0D%0A%0D%0ABest regards"
                    className="rounded-full bg-blue-600 dark:bg-blue-700 px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-white transition-[background-color,box-shadow] duration-150 hover:bg-blue-700 dark:hover:bg-blue-600 shadow-lg hover:shadow-xl text-center"
                  >
                    Apply Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
};

export default FrontendDeveloperJob;

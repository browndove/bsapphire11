"use client";

import { useState } from "react";
import QuestionnaireModal from "@/components/QuestionnaireModal";

const FrontendDeveloperJob = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="overflow-hidden pb-20 pt-20 md:pt-25 xl:pb-25 xl:pt-30">
        <div className="mx-auto max-w-c-1390 px-4 md:px-8 2xl:px-0">
          <div className="mx-auto max-w-c-1235">
            {/* Header */}
            <div className="mb-12.5 lg:mb-15 xl:mb-20">
              <div className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-4 py-2 mb-5">
                <span className="font-medium uppercase text-primary">We are hiring</span>
              </div>
              <h1 className="mb-5 text-3xl font-bold text-black dark:text-white xl:text-hero">
                Entry level Front End Developer
              </h1>
              <p className="text-body-color dark:text-bodydark mb-7.5">
                Join our team and help build the future of AI and cybersecurity solutions in Africa and beyond.
              </p>
            </div>

            {/* Job Description */}
            <div className="rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-blacksection p-7.5 xl:p-12.5 shadow-solid-3 dark:shadow-none mb-10">
              <h2 className="text-xl font-semibold text-black dark:text-white xl:text-itemtitle mb-5">About the Role</h2>
              <p className="text-body-color dark:text-bodydark mb-7.5 leading-relaxed">
                We are seeking a motivated and talented Front-End Developer to join our team and support the development of user-facing features for our web applications. The ideal candidate is an entry-level developer with a solid foundation in front-end technologies, at least 1 year of hands-on experience, a passion for clean, efficient code, and a strong background in UX/UI design.
              </p>

              {/* Job Details Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                <div className="rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-blacksection p-7.5 shadow-solid-3 dark:shadow-none">
                  <div className="text-sm text-body-color dark:text-bodydark mb-2">Location</div>
                  <div className="font-semibold text-black dark:text-white">Accra, Ghana</div>
                </div>
                <div className="rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-blacksection p-7.5 shadow-solid-3 dark:shadow-none">
                  <div className="text-sm text-body-color dark:text-bodydark mb-2">Type</div>
                  <div className="font-semibold text-black dark:text-white">Full-time</div>
                </div>
                <div className="rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-blacksection p-7.5 shadow-solid-3 dark:shadow-none">
                  <div className="text-sm text-body-color dark:text-bodydark mb-2">Experience</div>
                  <div className="font-semibold text-black dark:text-white">1+ Years</div>
                </div>
                <div className="rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-blacksection p-7.5 shadow-solid-3 dark:shadow-none">
                  <div className="text-sm text-body-color dark:text-bodydark mb-2">Salary</div>
                  <div className="font-semibold text-black dark:text-white">Competitive</div>
                </div>
              </div>

              {/* Job Details & Benefits */}
              <div className="border-t border-stroke dark:border-strokedark pt-7.5">
                <h3 className="text-lg font-medium text-black dark:text-white mb-7.5">Job Details & Benefits</h3>
                
                <div className="space-y-7.5">
                  {/* Key Responsibilities */}
                  <div className="mb-7.5">
                    <h3 className="text-lg font-medium text-black dark:text-white mb-5">Key Responsibilities:</h3>
                    <ul className="space-y-3 text-body-color dark:text-bodydark">
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Develop responsive web applications using React, Next.js, and modern JavaScript
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Collaborate with designers and backend developers to implement user interfaces
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Optimize applications for maximum speed and scalability
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Ensure cross-browser compatibility and responsive design
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Participate in code reviews and maintain high code quality standards
                      </li>
                    </ul>
                  </div>

                  {/* Qualifications */}
                  <div className="mb-7.5">
                    <h3 className="text-lg font-medium text-black dark:text-white mb-5">Requirements:</h3>
                    <ul className="space-y-3 text-body-color dark:text-bodydark">
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Bachelor's degree in computer science, engineering, or a related field (or equivalent practical experience)
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        1+ year of hands-on experience in front-end development
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Proficiency in HTML, CSS, and JavaScript
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Experience with at least one front-end framework (such as React, Vue, or Angular)
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Understanding of responsive design and general web development best practices
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Strong problem-solving skills and attention to detail
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Good communication skills and ability to work well as part of a team
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Experience using design tools (e.g., Figma, Sketch) to translate designs into code
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Understanding of component-based architecture and simple state management
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Experience using Git or similar version-control tools
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Understanding of how front-end applications interact with back-end services (e.g., RESTful APIs, Browser API and error handling)
                      </li>
                    </ul>
                  </div>

                  {/* Benefits - Updated with flexible hours */}
                  <div className="space-y-5 text-body-color dark:text-bodydark">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {[
                        { label: "Fully Remote", value: "Work from anywhere with flexible schedule" },
                        { label: "Professional Development", value: "Learning & growth opportunities" },
                        { label: "Competitive Salary", value: "Market-rate compensation" },
                        { label: "Time Off", value: "Paid leave & parental support" },
                        { label: "Learning", value: "Training & conference coverage" },
                      ].map((benefit, index) => (
                        <div key={index} className="rounded-lg border border-stroke dark:border-strokedark bg-gray-50 dark:bg-blacksection p-5">
                          <div className="font-medium text-black dark:text-white">{benefit.label}</div>
                          <div className="text-sm text-body-color dark:text-bodydark mt-2">{benefit.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="mt-10 flex justify-center">
                <button 
  onClick={() => setIsModalOpen(true)}
  className="inline-flex items-center gap-2.5 rounded-full bg-primary px-7.5 py-3 font-medium text-white hover:bg-primaryho dark:bg-white dark:text-black dark:hover:bg-gray-100 transition-all duration-300"
>
  Apply Now
</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Questionnaire Modal */}
      <QuestionnaireModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default FrontendDeveloperJob;

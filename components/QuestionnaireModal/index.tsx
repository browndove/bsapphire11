"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Check, Upload, FileText } from "lucide-react";
import { toast } from "sonner";

interface QuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  portfolioUrl: string;
  githubUrl: string;
  location: string;
  mainFramework: string;
  uiStructure: string;
  gitUsage: string;
  designTools: string;
  frontendBackend: string;
  salaryExpectations: string;
  cvFileId?: number;
}

const questions = [
  {
    title: "Personal Information",
    subtitle: "Please provide your basic details",
    fields: [
      { key: "firstName", label: "First Name", placeholder: "Enter your first name", required: true },
      { key: "lastName", label: "Last Name", placeholder: "Enter your last name", required: true },
      { key: "middleName", label: "Middle Name", placeholder: "Enter your middle name (optional)", required: false },
      { key: "email", label: "Email", placeholder: "Enter your email address", required: true },
      { key: "portfolioUrl", label: "Portfolio URL", placeholder: "Enter your portfolio URL", required: false },
      { key: "githubUrl", label: "GitHub URL", placeholder: "Enter your GitHub URL", required: false },
    ]
  },
  {
    title: "Where do you live?",
    field: "location",
    options: [
      { value: "greater_accra", label: "Greater Accra" },
      { value: "outside_greater_accra", label: "Outside of Greater Accra" }
    ]
  },
  {
    title: "Main Framework in Your Biggest Project",
    subtitle: "In the biggest frontend project, you have built so far, which framework did you use for most of the UI? We may ask you to show this project during the interview. (Choose one)",
    field: "mainFramework",
    options: [
      { value: "react", label: "React" },
      { value: "nextjs", label: "Next.js" },
      { value: "both_react_nextjs", label: "Both React and Next.js in the same project" },
      { value: "other_modern", label: "Another modern framework (Vue, Angular, Svelte, etc.)" },
      { value: "no_framework", label: "I didn't use a framework, I used plain HTML/CSS/JavaScript" }
    ]
  },
  {
    title: "How You Normally Structure Your UI",
    subtitle: "When you build a page with several sections (header, filters, list, modals), which of these sounds most like what you actually do? (Choose one)",
    field: "uiStructure",
    options: [
      { value: "few_large_sections", label: "I split the page into a few larger sections (e.g. Header, Content, Footer), but most logic stays in 1–2 main components" },
      { value: "small_reusable_components", label: "I split the page into several small, reusable components (e.g. Header, FilterBar, ItemList, ItemCard) and reuse them across the app" },
      { value: "existing_codebase", label: "I mostly work on small pieces inside an existing codebase and rarely decide the structure myself" },
      { value: "single_component", label: "I usually keep most of the UI and logic in a single main component/file" }
    ]
  },
  {
    title: "How You Use Git & GitHub",
    subtitle: "Which of these situations is closest to how you usually work with Git and GitHub? (Choose one)",
    field: "gitUsage",
    options: [
      { value: "collaborative", label: "I often contribute to repositories that other people also work on, and we use branches and pull requests to share changes" },
      { value: "own_projects", label: "Most of my projects live in a GitHub repository that I set up, and I commit and sync changes there as I work" },
      { value: "local_projects", label: "I usually keep my projects on my own machine and haven't added most of them to GitHub yet" },
      { value: "basic_commands", label: "I have added some projects to GitHub or worked in Git repos that others created, but I only use a few basic commands when I need to" }
    ]
  },
  {
    title: "Design tools",
    subtitle: "Which of the following best describes your preference and experience with design tools?",
    field: "designTools",
    options: [
      { value: "figma", label: "I have experience designing with Figma" },
      { value: "prefer_coding", label: "I prefer coding and implementing designs that I am given." },
      { value: "sketch", label: "I have experience designing with Sketch" },
      { value: "other_tools", label: "I have experience designing with other tools" }
    ]
  },
  {
    title: "Preference for Frontend–Backend Interaction",
    subtitle: "Which of the following is closest to how you usually work when your frontend code needs data from a backend or external service? (Choose one)",
    field: "frontendBackend",
    options: [
      { value: "rarely_api", label: "I have tried API calls by following examples or tutorials, but I rarely do this in any project that I work on" },
      { value: "write_api_calls", label: "I usually write the code that calls RESTful APIs or other backend services from the frontend, and update the UI based on the responses" },
      { value: "prefer_no_backend", label: "I prefer working on parts of an app that don't need data from a backend or external service" },
      { value: "receive_data_props", label: "I usually receive data as props or from state that is already set up, and I focus on displaying it in the UI" }
    ]
  },
  {
    title: "Salary Expectations",
    subtitle: "What salary range would you expect for an entry-level remote position with flexible working hours?",
    field: "salaryExpectations",
    options: [
      { value: "1500_2000", label: "GHS 1,500 – GHS 2,000" },
      { value: "2000_2500", label: "GHS 2,000 – GHS 2,500" },
      { value: "2500_3000", label: "GHS 2,500 – GHS 3,000" }
    ]
  },
  {
    title: "Upload Your CV",
    subtitle: "Please upload your CV/Resume (Required)",
    type: "file"
  }
];

const QuestionnaireModal: React.FC<QuestionnaireModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    portfolioUrl: "",
    githubUrl: "",
    location: "",
    mainFramework: "",
    uiStructure: "",
    gitUsage: "",
    designTools: "",
    frontendBackend: "",
    salaryExpectation: ""
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const isStepValid = () => {
    // Personal Information step - only firstName and lastName are required
    if (currentQuestion.fields) {
      return currentQuestion.fields.every(field => {
        if (!field.required) return true; // Skip validation for optional fields
        const value = formData[field.key as keyof FormData];
        return typeof value === 'string' ? value.trim() !== "" : value !== undefined;
      });
    }
    
    // File upload step - CV is required
    if (currentQuestion.type === "file") {
      return uploadedFile !== null;
    }
    
    // Radio button steps - all are required
    if (currentQuestion.field) {
      const fieldValue = formData[currentQuestion.field as keyof FormData];
      return typeof fieldValue === 'string' ? fieldValue.trim() !== "" : fieldValue !== undefined;
    }
    
    return true;
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('cv', file);

      const response = await fetch('/api/upload-cv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadedFile(file);
        setFormData(prev => ({
          ...prev,
          cvFileId: result.fileId
        }));
      } else {
        console.error('CV upload failed:', result);
        console.error('Upload response status:', response.status);
        toast.error(result.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Application submitted successfully:", result);
        toast.success("Thank you for your interest! We've received your information and will be in touch soon.");
        
        // Reset form and close modal
        setCurrentStep(0);
        setFormData({
          firstName: "",
          lastName: "",
          middleName: "",
          email: "",
          portfolioUrl: "",
          githubUrl: "",
          location: "",
          mainFramework: "",
          uiStructure: "",
          gitUsage: "",
          designTools: "",
          frontendBackend: "",
          salaryExpectation: ""
        });
        setUploadedFile(null);
        onClose();
      } else {
        console.error("Submission failed:", result.error);
        console.error("Response status:", response.status);
        console.error("Full response:", result);
        toast.error(`Submission failed: ${result.error || "Unknown error"}. Please try again.`);
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Network error. Please check your connection and try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              duration: 0.3, 
              ease: "easeOut"
            }}
            className="relative w-full max-w-c-1235 max-h-[85vh] bg-white dark:bg-blacksection rounded-lg border border-stroke dark:border-strokedark shadow-solid-3 dark:shadow-none overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-7.5 border-b border-stroke dark:border-strokedark flex-shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-black dark:text-white xl:text-hero">Let's Get To Know You</h2>
                <p className="text-body-color dark:text-bodydark mt-2">Step {currentStep + 1} of {questions.length}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-body-color hover:text-black dark:text-bodydark dark:hover:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-hoverdark transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Instruction Text */}
            {currentStep === 0 && (
              <div className="px-7.5 py-5 bg-gray-50 dark:bg-blacksection border-b border-stroke dark:border-strokedark">
                <p className="text-body-color dark:text-bodydark leading-relaxed">
                  <span className="font-medium uppercase text-black dark:text-white">INSTRUCTION:</span> Kindly fill out this questionnaire. This is NOT A TEST, and there are no right or wrong answers. We are simply interested in understanding your experience and what you feel most comfortable working with.
                </p>
              </div>
            )}

            {/* Progress */}
            <div className="px-7.5 pt-5 flex-shrink-0">
              <div className="w-full bg-stroke dark:bg-strokedark rounded-full h-2">
                <motion.div
                  className="bg-primary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm text-body-color dark:text-bodydark">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-7.5">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="mb-7.5">
                        <h3 className="text-xl font-semibold text-black dark:text-white xl:text-itemtitle mb-3">
                          {currentQuestion.title}
                        </h3>
                        {currentQuestion.subtitle && (
                          <p className="text-body-color dark:text-bodydark leading-relaxed">
                            {currentQuestion.subtitle}
                          </p>
                        )}
                      </div>

                      {currentQuestion.fields ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {currentQuestion.fields.map((field, index) => (
                            <div 
                              key={field.key}
                              className={field.key === "middleName" ? "md:col-span-2" : ""}
                            >
                              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                              </label>
                              <input
                                type={field.key === "email" ? "email" : field.key === "portfolioUrl" || field.key === "githubUrl" ? "url" : "text"}
                                value={formData[field.key as keyof FormData]}
                                onChange={(e) => handleInputChange(field.key, e.target.value)}
                                placeholder={field.placeholder}
                                className="w-full px-4 py-3 border border-stroke dark:border-strokedark rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-200 bg-transparent dark:bg-blacksection text-black dark:text-white"
                                required={field.required}
                              />
                            </div>
                          ))}
                        </div>
                      ) : currentQuestion.type === "file" ? (
                        <div className="border-2 border-dashed border-stroke dark:border-strokedark rounded-lg p-7.5 text-center bg-gray-50 dark:bg-blacksection">
                          {!uploadedFile ? (
                            <div>
                              <Upload className="mx-auto h-12 w-12 text-body-color dark:text-bodydark mb-4" />
                              <div className="text-body-color dark:text-bodydark mb-4">
                                <label htmlFor="cv-upload" className="cursor-pointer">
                                  <span className="font-medium text-primary hover:text-primaryho">
                                    Click to upload
                                  </span>
                                  <span> or drag and drop</span>
                                </label>
                                <input
                                  id="cv-upload"
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(file);
                                  }}
                                  className="hidden"
                                />
                              </div>
                              <p className="text-sm text-body-color dark:text-bodydark">
                                PDF, DOC, DOCX up to 5MB
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center space-x-3">
                              <FileText className="h-8 w-8 text-green-600" />
                              <div className="text-left">
                                <p className="font-medium text-black dark:text-white">
                                  {uploadedFile.name}
                                </p>
                                <p className="text-sm text-body-color dark:text-bodydark">
                                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setUploadedFile(null);
                                  setFormData(prev => ({
                                    ...prev,
                                    cvFileId: undefined
                                  }));
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                          {isUploading && (
                            <div className="mt-4">
                              <div className="text-primary">Uploading...</div>
                              <div className="w-full bg-stroke dark:bg-strokedark rounded-full h-2 mt-2">
                                <div className="bg-primary h-2 rounded-full animate-pulse w-1/2"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {currentQuestion.options?.map((option, index) => (
                            <label
                              key={option.value}
                              className="flex items-start p-4 border border-stroke dark:border-strokedark rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-hoverdark hover:border-primary transition-all duration-200"
                            >
                              <input
                                type="radio"
                                name={currentQuestion.field}
                                value={option.value}
                                checked={formData[currentQuestion.field as keyof FormData] === option.value}
                                onChange={(e) => handleInputChange(currentQuestion.field!, e.target.value)}
                                className="h-4 w-4 text-primary focus:ring-primary border-stroke dark:border-strokedark mt-0.5 flex-shrink-0"
                              />
                              <span className="ml-3 text-black dark:text-white">
                                {option.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </div>
                </div>

                {/* Navigation */}
               <div className="flex items-center justify-between p-7.5 border-t border-stroke dark:border-strokedark bg-gray-50 dark:bg-blacksection flex-shrink-0">
  <button
    onClick={handlePrevious}
    disabled={currentStep === 0}
    className="px-6 py-3 font-medium text-body-color dark:text-bodydark bg-white dark:bg-blacksection border border-stroke dark:border-strokedark rounded-lg hover:bg-gray-50 dark:hover:bg-hoverdark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
  >
    Previous
  </button>

  <button
    onClick={handleNext}
    disabled={!isStepValid()}
    className="inline-flex items-center gap-2.5 px-7.5 py-3 font-medium text-white bg-primary rounded-lg hover:bg-primaryho dark:bg-white dark:text-black dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
  >
    {currentStep === questions.length - 1 ? "Complete" : "Next"}
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="currentColor"
    >
      <path d="M10.4767 6.16701L6.00668 1.69701L7.18501 0.518677L13.6667 7.00034L7.18501 13.482L6.00668 12.3037L10.4767 7.83368H0.333344V6.16701H10.4767Z" />
    </svg>
  </button>
</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuestionnaireModal;

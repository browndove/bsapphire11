"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Check, Upload, FileText } from "lucide-react";

interface QuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  location: string;
  framework: string;
  uiStructure: string;
  gitUsage: string;
  designTools: string;
  cvFileId?: number;
}

const questions = [
  {
    id: "name",
    title: "Personal Information",
    fields: [
      { key: "firstName", label: "First Name", placeholder: "First name", required: true },
      { key: "lastName", label: "Last Name", placeholder: "Last name", required: true },
      { key: "middleName", label: "Middle Name", placeholder: "Middle name (optional)", required: false },
      { key: "email", label: "Email Address", placeholder: "your.email@example.com", required: true }
    ]
  },
  {
    id: "location",
    title: "Where do you live?",
    type: "radio",
    field: "location",
    options: [
      { value: "greater-accra", label: "Greater Accra" },
      { value: "outside-accra", label: "Outside of Greater Accra" }
    ]
  },
  {
    id: "framework",
    title: "Main Framework in Your Biggest Project",
    subtitle: "In the biggest frontend project, you have built so far, which framework did you use for most of the UI? We may ask you to show this project during the interview. (Choose one)",
    type: "radio",
    field: "framework",
    options: [
      { value: "react", label: "React" },
      { value: "nextjs", label: "Next.js" },
      { value: "both", label: "Both React and Next.js in the same project" },
      { value: "other", label: "Another modern framework (Vue, Angular, Svelte, etc.)" },
      { value: "vanilla", label: "I didn't use a framework, I used plain HTML/CSS/JavaScript" }
    ]
  },
  {
    id: "structure",
    title: "How You Normally Structure Your UI",
    subtitle: "When you build a page with several sections (header, filters, list, modals), which of these sounds most like what you actually do? (Choose one)",
    type: "radio",
    field: "uiStructure",
    options: [
      { value: "small-components", label: "I split the page into several small, reusable components (e.g. Header, FilterBar, JobList, JobCard) and reuse them across the app" },
      { value: "large-sections", label: "I split the page into a few larger sections (e.g. Header, Content, Footer), but most logic stays in 1–2 main components" },
      { value: "single-component", label: "I usually keep most of the UI and logic in a single main component/file" },
      { value: "existing-codebase", label: "I mostly work on small pieces inside an existing codebase and rarely decide the structure myself" }
    ]
  },
  {
    id: "git",
    title: "How You Use Git & GitHub",
    subtitle: "Which of these situations is closest to how you usually work with Git and GitHub? (Choose one)",
    type: "radio",
    field: "gitUsage",
    options: [
      { value: "own-repos", label: "Most of my projects live in a GitHub repository that I set up, and I commit and sync changes there as I work" },
      { value: "collaborative", label: "I often contribute to repositories that other people also work on, and we use branches and pull requests to share changes" },
      { value: "basic-usage", label: "I have added some projects to GitHub or worked in Git repos that others created, but I only use a few basic commands when I need to" },
      { value: "local-only", label: "I usually keep my projects on my own machine and haven't added most of them to GitHub yet" }
    ]
  },
  {
    id: "design",
    title: "Design tools",
    subtitle: "Which of the following best describes your preference and experience with design tools?",
    type: "radio",
    field: "designTools",
    options: [
      { value: "figma", label: "I have experience designing with Figma" },
      { value: "sketch", label: "I have experience designing with Sketch" },
      { value: "other-tools", label: "I have experience designing with other tools" },
      { value: "prefer-coding", label: "I prefer coding and implementing designs that I am given" }
    ]
  },
  {
    id: "cv",
    title: "Upload Your CV",
    subtitle: "Please upload your CV/Resume in PDF, DOC, or DOCX format (max 5MB)",
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
    location: "",
    framework: "",
    uiStructure: "",
    gitUsage: "",
    designTools: ""
  });
  const [isCompleted, setIsCompleted] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const isStepValid = () => {
    if (currentQuestion.id === "name") {
      return formData.firstName.trim() && formData.lastName.trim() && formData.email.trim();
    }
    if (currentQuestion.id === "cv") {
      return uploadedFile !== null;
    }
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
      setIsCompleted(true);
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
        alert(result.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
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
        onClose();
        setCurrentStep(0);
        setIsCompleted(false);
        setFormData({
          firstName: "",
          lastName: "",
          middleName: "",
          email: "",
          location: "",
          framework: "",
          uiStructure: "",
          gitUsage: "",
          designTools: ""
        });
        setUploadedFile(null);
      } else {
        console.error("Submission failed:", result.error);
        console.error("Response status:", response.status);
        console.error("Full response:", result);
        alert(`Submission failed: ${result.error || "Unknown error"}. Please try again.`);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error. Please check your connection and try again.");
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative mx-4 w-full max-w-lg bg-white rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Application Form</h2>
                <p className="text-sm text-gray-500">Step {currentStep + 1} of {questions.length}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {!isCompleted ? (
              <>
                {/* Progress */}
                <div className="px-6 pt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-6">
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        {currentQuestion.title}
                      </h3>
                      {currentQuestion.subtitle && (
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {currentQuestion.subtitle}
                        </p>
                      )}
                    </div>

                    {currentQuestion.fields ? (
                      <div className="space-y-4">
                        {currentQuestion.fields.map((field) => (
                          <div key={field.key}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {field.label}
                            </label>
                            <input
                              type={field.key === "email" ? "email" : "text"}
                              value={formData[field.key as keyof FormData]}
                              onChange={(e) => handleInputChange(field.key, e.target.value)}
                              placeholder={field.placeholder}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              required={field.required}
                            />
                          </div>
                        ))}
                      </div>
                    ) : currentQuestion.type === "file" ? (
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          {!uploadedFile ? (
                            <div>
                              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                              <div className="text-sm text-gray-600 mb-4">
                                <label htmlFor="cv-upload" className="cursor-pointer">
                                  <span className="font-medium text-blue-600 hover:text-blue-500">
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
                              <p className="text-xs text-gray-500">
                                PDF, DOC, DOCX up to 5MB
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center space-x-2">
                              <FileText className="h-8 w-8 text-green-600" />
                              <div className="text-left">
                                <p className="text-sm font-medium text-gray-900">
                                  {uploadedFile.name}
                                </p>
                                <p className="text-xs text-gray-500">
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
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                          {isUploading && (
                            <div className="mt-4">
                              <div className="text-sm text-blue-600">Uploading...</div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div className="bg-blue-600 h-2 rounded-full animate-pulse w-1/2"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {currentQuestion.options?.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <input
                              type="radio"
                              name={currentQuestion.field}
                              value={option.value}
                              checked={formData[currentQuestion.field as keyof FormData] === option.value}
                              onChange={(e) => handleInputChange(currentQuestion.field!, e.target.value)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-3 text-sm text-gray-900">
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200">
                  <button
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={!isStepValid()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {currentStep === questions.length - 1 ? "Complete" : "Next"}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </>
            ) : (
              // Success Screen
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Application Submitted</h3>
                <p className="text-gray-600 mb-6">
                  Thank you for your application. We'll review it and get back to you soon.
                </p>
                <button
                  onClick={handleSubmit}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuestionnaireModal;

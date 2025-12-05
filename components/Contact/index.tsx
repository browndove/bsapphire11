"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useState } from "react";

const Contact = () => {
  const [hasMounted, setHasMounted] = React.useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    phone: '',
    message: '',
    agreed: false
  });

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <>
      {/* <!-- ===== Contact Start ===== --> */}
      <section id="contact" className="relative py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-4"
          >
            <h2 className="text-3xl font-bold text-black dark:text-white mb-3">
              Let's Work Together
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-300 max-w-xl">
              Got a project in mind? Drop us a line and let's make something great happen.
            </p>
          </motion.div>

          {/* Main Content Grid */}
          <div className="max-w-4xl mx-auto">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="w-full"
            >
              <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                  Send Message
                </h3>

                <form action="https://formbold.com/s/3jyqL" method="POST" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1.5 text-sm border-b-2 border-gray-300 dark:border-gray-600 bg-transparent focus:border-black dark:focus:border-white focus:outline-none dark:text-white"
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1.5 text-sm border-b-2 border-gray-300 dark:border-gray-600 bg-transparent focus:border-black dark:focus:border-white focus:outline-none dark:text-white"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1.5 text-sm border-b-2 border-gray-300 dark:border-gray-600 bg-transparent focus:border-black dark:focus:border-white focus:outline-none dark:text-white"
                        placeholder="Subject"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1.5 text-sm border-b-2 border-gray-300 dark:border-gray-600 bg-transparent focus:border-black dark:focus:border-white focus:outline-none dark:text-white"
                        placeholder="Phone (optional)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-2 py-1.5 text-sm border-2 border-gray-300 dark:border-gray-600 bg-transparent focus:border-black dark:focus:border-white focus:outline-none dark:text-white resize-none"
                      placeholder="Tell us about your project..."
                      required
                    ></textarea>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-start">
                      <input
                        id="privacy-checkbox"
                        type="checkbox"
                        name="agreed"
                        checked={formData.agreed}
                        onChange={handleInputChange}
                        className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                        required
                      />
                      <label htmlFor="privacy-checkbox" className="ml-3 text-xs text-gray-600 dark:text-gray-300">
                        I agree to the{' '}
                        <a href="#" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                          Privacy Policy
                        </a>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-1.5 text-sm bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* <!-- ===== Contact End ===== --> */}
    </>
  );
};

export default Contact;

"use client";

import { useTheme } from "next-themes";
import Image from "next/image";

const Blog = () => {
  const { theme, setTheme } = useTheme();
  const products = [
    {
      title: "",
      category: "Healthcare AI",
      description:
        "Our AI-powered healthcare solution uses advanced facial recognition and AI to deliver secure patient identity verification and automated healthcare claims validation. By streamlining biometric authentication and intelligent claim analysis, our platform reduces manual processes, enhances data integrity, and provides a transparent, auditable trail to mitigate fraud risks.",
      image: "/hos.png",
      features: ["Facial Recognition", "Claims Validation", "Fraud Prevention", "Biometric Auth"],
      impact: "85%",
      metric: "reduction in manual processing",
    },
    {
      title: "",
      category: "Security AI",
      description:
        "Modern security and intelligence operations, as well as large-scale automation tasks demand efficient and accurate methods for identifying and tracking entities within visual data streams. Our computer vision system is engineered to overcome these limitations. Its scope goes beyond the aforementioned as the software can be used in other aspects such as tolling, crowd management and more.",
      image: "/car.png",
      features: ["Multi-Object Tracking", "Real-time Analysis", "Crowd Management", "Smart Tolling"],
      impact: "500+",
      metric: "cameras monitored in real-time",
    },
    {
      title: "",
      category: "Environmental AI",
      description:
        'Our environmental monitoring platform harnesses remote sensing and AI to ensure compliance and combat illegal mining ("galamsey") across vast concessions. Unlike traditional ground patrols or basic geofencing, our system detects unauthorized activities within and beyond boundaries, identifying specific prohibited actions.',
      image: "/mine.png",
      features: ["Remote Sensing", "Illegal Mining Detection", "Compliance Monitoring", "Evidence Collection"],
      impact: "10K+",
      metric: "sq km monitored daily",
    },
    {
      title: "",
      category: "Geospatial AI",
      description:
        "Our geospatial analysis system tackles Ghana's illegal mining (Galamsey) challenges by automating detection and monitoring across vast territories. Using high-resolution satellite imagery, advanced AI, and spatial analysis, our technology identifies new illegal sites, maps their proximity to sensitive areas like water bodies and forest reserves.",
      image: "/riv.png",
      features: ["Satellite Analysis", "Environmental Mapping", "Proximity Detection", "Territory Monitoring"],
      impact: "95%",
      metric: "accuracy in site detection",
    },
  ]

  return (
    <section className="min-h-screen bg-white dark:bg-black py-8 sm:py-12 lg:py-20">
      <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 text-balance">
            AI Solutions for
            <span className="block text-blue-600">Ghana's Future</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-xl mx-auto text-pretty">
            Innovative AI-powered solutions addressing critical challenges in healthcare, security, and environmental
            protection across Ghana and Africa.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:gap-10">
          {products.map((product, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/60 dark:border-gray-800/60 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl p-4 sm:p-6 lg:p-8 shadow-xl shadow-gray-300/30 dark:shadow-black/30 transition-[background-color,border-color,box-shadow] duration-200 hover:shadow-2xl hover:bg-white/95 dark:hover:bg-gray-900/95 hover:border-white/80 dark:hover:border-gray-700/80"
            >
              <div className="relative mb-4 sm:mb-6 aspect-[16/10] overflow-hidden rounded-lg sm:rounded-xl">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.title}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 rounded-lg sm:rounded-xl border border-white/40 bg-white/30 backdrop-blur-sm p-2 sm:p-3 shadow-lg">
                  <div className="text-sm sm:text-lg font-bold text-white drop-shadow-sm">{product.impact}</div>
                  <div className="text-xs text-white/90 drop-shadow-sm">{product.metric}</div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <div className="mb-2 inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 px-2 sm:px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                    {product.category}
                  </div>
                  <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                    {product.title}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-gray-700 dark:text-gray-300">{product.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  {product.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-center space-x-1.5 sm:space-x-2 rounded-md sm:rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/60 dark:border-gray-700/60 p-1.5 sm:p-2 shadow-sm transition-[background-color,border-color] duration-150"
                    >
                      <div className="h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full bg-blue-500" />
                      <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 sm:mt-16 lg:mt-20 text-center">
          <div className="mx-auto max-w-2xl rounded-xl sm:rounded-2xl border border-white/60 dark:border-gray-800/60 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-gray-300/30 dark:shadow-black/30 transition-[background-color,border-color,box-shadow] duration-200">
            <h3 className="mb-3 sm:mb-4 text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Ready to Transform Your Operations?
            </h3>
            <p className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              Discover how our AI solutions can address your specific challenges and drive innovation in your industry.
            </p>
            <div className="flex justify-center">
              <a 
                href="mailto:info@blvcksapphire.com?subject=Schedule Demo Request&body=Hi, I'm interested in scheduling a demo of your AI solutions. Please let me know your availability."
                className="rounded-full bg-blue-600 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium text-white transition-[background-color,box-shadow,transform] duration-150 hover:bg-blue-700 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Schedule Demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Blog

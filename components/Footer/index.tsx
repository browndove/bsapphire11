"use client";
import {useState} from "react"
import { motion } from "framer-motion";
import Image from "next/image";


const Footer = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

const openDialog = () => setIsDialogOpen(true);
const closeDialog = () => setIsDialogOpen(false);
  return (
    <>
      <footer className="border-t border-stroke bg-white dark:border-strokedark dark:bg-blacksection">
        <div className="mx-auto max-w-c-1390 px-4 md:px-8 2xl:px-0">
          {/* <!-- Footer Top --> */}
          <div className="py-4 lg:py-6">
            <div className="flex flex-wrap gap-4 lg:justify-between lg:gap-0">
              <motion.div
                variants={{
                  hidden: {
                    opacity: 0,
                    y: -20,
                  },

                  visible: {
                    opacity: 1,
                    y: 0,
                  },
                }}
                initial="hidden"
                whileInView="visible"
                transition={{ duration: 1, delay: 0.5 }}
                viewport={{ once: true }}
                className="animate_top w-1/2 lg:w-1/4"
              >
                <a href="index.html" className="relative">
                  <Image
                    width={140}
                    height={80}
                    src="/black.png"
                    alt="Logo"
                    className="dark:hidden"
                  />
                  <Image
                    width={110}
                    height={80}
                    src="/main.png"
                    alt="Logo"
                    className="hidden dark:block"
                  />
                </a>

                <p className="mb-1 mt-1 text-xs text-gray-600 dark:text-gray-400">
                Stay Connected and subscribe to our social channels
                </p>

                <p className="mb-0.5 text-xs uppercase tracking-[2px] text-gray-500">
                  contact
                </p>
                <a
                  href="#"
                  className="text-sm font-medium text-black dark:text-white"
                >
                  info@blvcksapphire.com
                </a>
              </motion.div>

              <div className="flex w-full flex-col gap-4 md:flex-row md:justify-between md:gap-0 lg:w-2/3 xl:w-7/12">
                <motion.div
                  variants={{
                    hidden: {
                      opacity: 0,
                      y: -20,
                    },

                    visible: {
                      opacity: 1,
                      y: 0,
                    },
                  }}
                  initial="hidden"
                  whileInView="visible"
                  transition={{ duration: 1, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="animate_top"
                >
                  <h4 className="mb-2 text-base font-medium text-black dark:text-white">
                    Quick Links
                  </h4>

                  <ul>
                    <li>
                      <a
                        href="#"
                        className="mb-1 inline-block hover:text-primary text-sm"
                      >
                        Home
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="mb-1 inline-block hover:text-primary text-sm"
                      >
                        About
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="mb-1 inline-block hover:text-primary text-sm"
                      >
                        Services
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="mb-1 inline-block hover:text-primary text-sm"
                      >
                        Career
                      </a>
                    </li>
                  </ul>
                </motion.div>

                <motion.div
                  variants={{
                    hidden: {
                      opacity: 0,
                      y: -20,
                    },

                    visible: {
                      opacity: 1,
                      y: 0,
                    },
                  }}
                  initial="hidden"
                  whileInView="visible"
                  transition={{ duration: 1, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="animate_top"
                >
                  <h4 className="mb-2 text-base font-medium text-black dark:text-white">
                    Support
                  </h4>
                  <p className="text-sm">info@blvcksapphire.com</p>

                
                </motion.div>

                <motion.div
                  variants={{
                    hidden: {
                      opacity: 0,
                      y: -20,
                    },

                    visible: {
                      opacity: 1,
                      y: 0,
                    },
                  }}
                  initial="hidden"
                  whileInView="visible"
                  transition={{ duration: 1, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="animate_top"
                >
                  

                  <form action="#">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Email address"
                        className="w-full rounded-full border border-stroke px-4 py-2 text-sm shadow-solid-11 focus:border-primary focus:outline-none dark:border-strokedark dark:bg-black dark:shadow-none dark:focus:border-primary"
                      />

                      <button
                        aria-label="signup to newsletter"
                        className="absolute right-0 p-2"
                      >
                        <svg
                          className="fill-[#757693] hover:fill-primary dark:fill-white"
                          width="16"
                          height="16"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_48_1487)">
                            <path
                              d="M3.1175 1.17318L18.5025 9.63484C18.5678 9.67081 18.6223 9.72365 18.6602 9.78786C18.6982 9.85206 18.7182 9.92527 18.7182 9.99984C18.7182 10.0744 18.6982 10.1476 18.6602 10.2118C18.6223 10.276 18.5678 10.3289 18.5025 10.3648L3.1175 18.8265C3.05406 18.8614 2.98262 18.8792 2.91023 18.8781C2.83783 18.8769 2.76698 18.857 2.70465 18.8201C2.64232 18.7833 2.59066 18.7308 2.55478 18.6679C2.51889 18.6051 2.50001 18.5339 2.5 18.4615V1.53818C2.50001 1.46577 2.51889 1.39462 2.55478 1.33174C2.59066 1.26885 2.64232 1.2164 2.70465 1.17956C2.76698 1.14272 2.83783 1.12275 2.91023 1.12163C2.98262 1.12051 3.05406 1.13828 3.1175 1.17318ZM4.16667 10.8332V16.3473L15.7083 9.99984L4.16667 3.65234V9.16651H8.33333V10.8332H4.16667Z"
                              fill=""
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_48_1487">
                              <rect width="20" height="20" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            </div>
          </div>
          {/* <!-- Footer Top --> */}

          {/* <!-- Footer Bottom --> */}
          <div className="flex flex-col flex-wrap items-center justify-center gap-2 border-t border-stroke py-2 dark:border-strokedark lg:flex-row lg:justify-between lg:gap-0">
            <motion.div
              variants={{
                hidden: {
                  opacity: 0,
                  y: -20,
                },

                visible: {
                  opacity: 1,
                  y: 0,
                },
              }}
              initial="hidden"
              whileInView="visible"
              transition={{ duration: 1, delay: 0.1 }}
              viewport={{ once: true }}
              className="animate_top"
            >
              <ul className="flex items-center gap-2">
                <li>
                  <a href="#" className="hover:text-primary text-sm">
                    English
                  </a>
                </li>
                <li>
                  <a href="#"  onClick={openDialog} className="hover:text-primary cursor-pointer">
                    {/* Privacy Policy */}
                  </a>
                </li>
                <li>
                  <a href="info@Blvcksapphire.com" className="hover:text-primary text-sm">
                    Support
                  </a>
                </li>
              </ul>
            </motion.div>

            <motion.div
              variants={{
                hidden: {
                  opacity: 0,
                  y: -20,
                },

                visible: {
                  opacity: 1,
                  y: 0,
                },
              }}
              initial="hidden"
              whileInView="visible"
              transition={{ duration: 1, delay: 0.1 }}
              viewport={{ once: true }}
              className="animate_top"
            >
              <p className="text-sm">
                &copy; {new Date().getFullYear()} Blvck Sapphire. All rights reserved
              </p>
            </motion.div>

            <motion.div
              variants={{
                hidden: {
                  opacity: 0,
                  y: -20,
                },

                visible: {
                  opacity: 1,
                  y: 0,
                },
              }}
              initial="hidden"
              whileInView="visible"
              transition={{ duration: 1, delay: 0.1 }}
              viewport={{ once: true }}
              className="animate_top"
            >
              <ul className="flex items-center gap-2">
                <li>
                  <a href="#" aria-label="social icon">
                    <svg
                      className="fill-[#D1D8E0] transition-all duration-300 hover:fill-primary"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_48_1499)">
                        <path
                          d="M14 13.5H16.5L17.5 9.5H14V7.5C14 6.47 14 5.5 16 5.5H17.5V2.14C17.174 2.097 15.943 2 14.643 2C11.928 2 10 3.657 10 6.7V9.5H7V13.5H10V22H14V13.5Z"
                          fill=""
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_48_1499">
                          <rect width="24" height="24" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </a>
                </li>
                <li>
                  <a href="#" aria-label="social icon">
                    <svg
                      className="fill-[#D1D8E0] transition-all duration-300 hover:fill-primary"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_48_1502)">
                        <path
                          d="M22.162 5.65593C21.3985 5.99362 20.589 6.2154 19.76 6.31393C20.6337 5.79136 21.2877 4.96894 21.6 3.99993C20.78 4.48793 19.881 4.82993 18.944 5.01493C18.3146 4.34151 17.4803 3.89489 16.5709 3.74451C15.6615 3.59413 14.7279 3.74842 13.9153 4.18338C13.1026 4.61834 12.4564 5.30961 12.0771 6.14972C11.6978 6.98983 11.6067 7.93171 11.818 8.82893C10.1551 8.74558 8.52832 8.31345 7.04328 7.56059C5.55823 6.80773 4.24812 5.75098 3.19799 4.45893C2.82628 5.09738 2.63095 5.82315 2.63199 6.56193C2.63199 8.01193 3.36999 9.29293 4.49199 10.0429C3.828 10.022 3.17862 9.84271 2.59799 9.51993V9.57193C2.59819 10.5376 2.93236 11.4735 3.54384 12.221C4.15532 12.9684 5.00647 13.4814 5.95299 13.6729C5.33661 13.84 4.6903 13.8646 4.06299 13.7449C4.32986 14.5762 4.85 15.3031 5.55058 15.824C6.25117 16.345 7.09712 16.6337 7.96999 16.6499C7.10247 17.3313 6.10917 17.8349 5.04687 18.1321C3.98458 18.4293 2.87412 18.5142 1.77899 18.3819C3.69069 19.6114 5.91609 20.2641 8.18899 20.2619C15.882 20.2619 20.089 13.8889 20.089 8.36193C20.089 8.18193 20.084 7.99993 20.076 7.82193C20.8949 7.2301 21.6016 6.49695 22.163 5.65693L22.162 5.65593Z"
                          fill=""
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_48_1502">
                          <rect width="24" height="24" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/company/blvck-sapphire/" aria-label="social icon">
                    <svg
                      className="fill-[#D1D8E0] transition-all duration-300 hover:fill-primary"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_48_1505)">
                        <path
                          d="M6.94 5.00002C6.93974 5.53046 6.72877 6.03906 6.35351 6.41394C5.97825 6.78883 5.46944 6.99929 4.939 6.99902C4.40857 6.99876 3.89997 6.78779 3.52508 6.41253C3.1502 6.03727 2.93974 5.52846 2.94 4.99802C2.94027 4.46759 3.15124 3.95899 3.5265 3.5841C3.90176 3.20922 4.41057 2.99876 4.941 2.99902C5.47144 2.99929 5.98004 3.21026 6.35492 3.58552C6.72981 3.96078 6.94027 4.46959 6.94 5.00002ZM7 8.48002H3V21H7V8.48002ZM13.32 8.48002H9.34V21H13.28V14.43C13.28 10.77 18.05 10.43 18.05 14.43V21H22V13.07C22 6.90002 14.94 7.13002 13.28 10.16L13.32 8.48002Z"
                          fill=""
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_48_1505">
                          <rect width="24" height="24" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/blvcksapphire_/" aria-label="social icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-instagram">
  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
  <path d="M16 11.37a4 4 0 0 1-1.11 2.63 4 4 0 0 1-5.66 0 4 4 0 0 1-1.11-2.63 4 4 0 0 1 1.11-2.63 4 4 0 0 1 5.66 0 4 4 0 0 1 1.11 2.63z"></path>
  <line x1="17.5" y1="6.5" x2="17.5" y2="6.5"></line>
</svg>
                  </a>
                </li>
              </ul>
            </motion.div>
          </div>
          {/* <!-- Footer Bottom --> */}
        </div>
      </footer>

      {isDialogOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg max-w-sm w-full h-[80vh] overflow-y-auto relative">
      <button onClick={closeDialog} className="absolute top-4 right-4 text-gray-600 dark:text-gray-300">
        &times;
      </button>
      <h2 className="text-lg font-bold mb-4">Privacy Policy</h2>
      <p className="mb-4">
       
Privacy Policy
Last updated: 14th April 2024 | v1.0.0

BLVCK SAPPHIRE and its affiliates (“BLVCK SAPPHIRE”, “we”, “us” or “our”) respect the privacy of our users (“user”, “you”, or “your”). This Privacy Policy explains how we collect, use, disclose, transfer, and store your information when you visit our website or use any of our mobile or web applications (collectively, the “Services”).

Information We Collect
Information you provide:
We collect information you provide to us directly when using or registering for our Services. This includes identifying information, like your name, email address, telephone number, postal address, and date of birth, as well as password and login credentials. It also includes other content you directly provide through our Services like profile information and messages.

Information we collect automatically:
We automatically collect information generated through your use of our Services. This includes device identifiers and information related to how you access our Services like browser type, operating system, Internet Protocol (IP) address, the web page visited before coming to our website, and analytics about your interactions and usage of our Services.

Geolocation Information: We may collect information about your approximate location as determined through data such as your IP address to offer you an improved user experience. Such location data is collected with your consent per applicable law.

Information from Cookies & other Tracking Technologies: We utilize “cookies” and other tracking technologies to collect information about visitors’ behavior and interaction with our Services. This allows us to detect user trends and patterns to enhance user experience. You can disable cookies through your browser settings, but it may affect your ability to use our Services.

Information we receive from third-party sources: We protect data obtained from third parties according to the practices described in this policy and per our obligations under applicable law. This includes data from third-party service providers and publicly available sources.

How We Use Information
We process your information only for specific, legitimate purposes outlined in this policy. This processing is based on i) your consent ii) as necessary to provide our Services iii) as compliant with legal obligations or our legitimate interests in running our business. In Summary, information is used to:

Provide, operate, optimize, and maintain our Services.
Send you technical notices, security alerts, updates, and assistance with issues relating to our Services.
To respond to your customer support inquiries and requests for information.
Interact and communicate with you via our Services.
Send you marketing communications, newsletters, promotional materials, or content.
Personalize content and experiences in our Services to suit your preferences.
Collect payment from you for products or services.
Conduct internal operations, diagnose technical issues, and conduct analytics for fraud detection and abuse prevention.
Comply with legal obligations and assertions of legal rights in connection with users.
Contact you to resolve disputes or investigate suspicious activity.
Sharing Your Information
Except as described in this policy, we do not sell or otherwise disclose personal information we collect to third parties. We do not share any personal information with unaffiliated third parties without your consent. We share user information with the following:


Vendors and service providers to operate our business and services and fulfill your requests. This includes cloud storage providers, payment processors, and those offering technical infrastructure, customer services software, etc.

Legal and regulatory authorities upon valid information requests supported by a warrant or court order.

Law enforcement agencies to protect BLVCK SAPPHIRE, its affiliates, users, or the general public including to stop suspected illegal activity or to prevent harm or financial/reputational loss.

Data Security & Retention
We are committed to protecting your information using all commercially and technically feasible physical, administrative, and procedural safeguards to reduce the risks of damage, loss of information, and unauthorized access, use, or modification. When you provide any personal information on any of our platforms, we will take reasonable precautions to secure that information and will only use that personal information in a way that this Privacy Policy permits. We work hard to protect your personal information from unauthorized access, alteration, disclosure, or destruction of the information we hold. We restrict access to your personal information to our employees, contractors, and agents who need that information to process it. Anyone with this access is subject to strict contractual confidentiality obligations and may be disciplined, terminated or legally prosecuted if they fail to meet these obligations. We will retain your information for as long as you use our services and for any additional period that we may be required or permitted by law.

Know Your Rights
We would like to make you fully aware of all your information protection rights. Unless the law provides otherwise, you have:

The right of access – you have the right to request from us copies of any personal information that we hold on you. We may charge a fee for this service.
The right to rectification – you have the right to request that we correct any of your personal information you believe is inaccurate. You also have the right to request us to complete any of your personal information you believe is incomplete.
The right to erasure – you have the right to request that we delete your personal information.
The right to object – you have the right to object to our processing of your personal information.
If you would like to exercise any of these rights, please contact our Data Protection Officer (DPO) at info@blvcksapphire.com

Cookie Policy
We use cookies and similar tracking technologies (e.g., Google Analytics) to access and store information. The technologies we use can be broken down into the following categories:


Strictly Necessary: Essential for core functionality like security, network management, accessibility, etc.

Performance: Analytics to understand user interaction with Services.

Functionality: Enable services and save functional preferences like language settings.

Targeting: Used to show you more relevant content and advertisements.


Most web browsers allow you to disable cookies and/or delete them from your hard drive. Note that this may degrade Service functionality. Our Services also utilize Google Analytics which employs cookies to measure user interaction. The collection of information via cookies is subject to Google Analytics terms:http://www.google.com/analytics/terms/us.html and Google’s privacy policies: http://www.google.com/policies/privacy/. Users may opt out of Google Analytics data collection with the Google Analytics Opt-out Browser Add-on available here: https://tools.google.com/dlpage/gaoptout
Children’s Privacy
We do not knowingly collect any personal data from children (under the age of 13). If we determine that a user is under 13, we will deactivate the account immediately.

We comply with the requirements of the Children’s Online Privacy Protection Act of 1998 (COPPA), and we do not collect any information from anyone under 13 years of age. Our website, products, and services are all directed to people who are at least 13 years old or older.

Changes to this Privacy Policy
We may update this Privacy Policy at any time to reflect changes in data processing practices. We will appropriately notify users of any material changes to this policy, so we encourage you to check it periodically. Your continued use of our Services after any changes or revisions to this Privacy Policy shall indicate your agreement with the terms of such revised Privacy Policy.

Contact InformationIf you have any queries, concerns, or complaints, Contact our Data Protection Officer (DPO) at info@blvcksapphire.com
      </p>
      {/* Add more content about your privacy policy here */}
      <button onClick={closeDialog} className="bg-primary text-white px-4 py-2 rounded mt-4">
        Close
      </button>
    </div>
  </div>
)}


    </>
  );
};

export default Footer;

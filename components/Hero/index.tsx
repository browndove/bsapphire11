"use client";
import Image from "next/image";
import { useState } from "react";

const Hero = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <>
      <section id="home" className="overflow-hidden pb-20 pt-35 md:pt-40 xl:pb-25 xl:pt-46">
        <div className="mx-auto max-w-c-1390 px-4 md:px-8 2xl:px-0">
          <div className="flex lg:items-center lg:gap-8 xl:gap-32.5">
            <div className="md:w-1/2">
              <h1 className="mb-5 pr-16 text-3xl font-bold text-black dark:text-white xl:text-hero ">
                Empowering Communities In Africa And Beyond With AI/ML Technologies And Cyber {" "}
                <span className="relative inline-block before:absolute before:bottom-2.5 before:left-0 before:-z-1 before:h-3 before:w-full before:bg-titlebg dark:before:bg-titlebgdark">
                  Securities Solutions.
                </span>
              </h1>
              <p>
                By integrating advanced cybersecurity measures, we ensure that these technologies are deployed
                safely and responsibly, protecting the digital infrastructure and sensitive data of individuals and organizations.
              </p>

              <div className="mt-10"></div>
            </div>

            <div className="animate_right hidden md:w-1/2 lg:block">
              <div className="relative 2xl:-mr-7.5">
                <div className="relative aspect-[700/544] w-full">
                  <div className="absolute inset-0 bg-white bg-opacity-30 backdrop-blur-lg rounded-lg">
                    <Image
                      className="h-full w-full dark:hidden"
                      src="/work/hero.png"
                      alt="Hero"
                      fill
                    />
                  </div>
                  <div className="bg-none hidden dark:block rounded-lg">
                    <Image
                      className="h-full w-full"
                      src="/work/com.png"
                      alt="Hero"
                      fill
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;

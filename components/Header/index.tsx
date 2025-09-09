"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Link as ScrollLink } from "react-scroll";

import ThemeToggler from "./ThemeToggler";
import menuData from "./menuData";

const Header = () => {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [dropdownToggler, setDropdownToggler] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);

  const pathUrl = usePathname();

  // Sticky menu
  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);
  }, []);

  return (
    <header
      className={`fixed left-0 top-0 z-99999 w-full py-7 ${
        stickyMenu
          ? "bg-white !py-4 shadow transition duration-100 dark:bg-black"
          : ""
      }`}
    >
      <div className="relative mx-auto max-w-c-1390 items-center justify-between px-4 md:px-8 xl:flex 2xl:px-0">
        {/* Logo and Mobile Controls Section */}
        <div className="flex w-full items-center justify-between xl:w-1/4">
          <a href="/">
            <Image
              src="/main.png"
              alt="logo"
              width={126.03}
              height={30}
              className="hidden w-full dark:block"
            />
            <Image
              src="/black.png"
              alt="logo"
              width={126.03}
              height={30}
              className="w-full dark:hidden"
            />
          </a>

          {/* Mobile Hamburger */}
          <button
            aria-label="hamburger Toggler"
            className="block xl:hidden"
            onClick={() => setNavigationOpen(!navigationOpen)}
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="absolute right-0 block h-full w-full">
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 cursor-pointer rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white ${
                    !navigationOpen ? "!w-full delay-300" : "w-0"
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 cursor-pointer rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${
                    !navigationOpen ? "delay-400 !w-full" : "w-0"
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 rounded-sm cursor-pointer bg-black delay-200 duration-200 ease-in-out dark:bg-white ${
                    !navigationOpen ? "!w-full delay-500" : "w-0"
                  }`}
                ></span>
              </span>
              <span className="du-block absolute right-0 h-full w-full rotate-45">
                <span
                  className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white ${
                    !navigationOpen ? "!h-0 delay-[0]" : "h-full"
                  }`}
                ></span>
                <span
                  className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white ${
                    !navigationOpen ? "!h-0 delay-200" : "h-0.5"
                  }`}
                ></span>
              </span>
            </span>
          </button>
        </div>

        {/* Desktop Navigation - Always visible on XL+ */}
        <div className="hidden xl:flex xl:ml-auto items-center gap-8">
          <nav>
            <ul className="flex items-center gap-6 lg:gap-8 2xl:gap-10">
              {menuData.map((menuItem, key) => (
                <li key={key} className={menuItem.submenu && "group relative"}>
                  {menuItem.submenu ? (
                    <>
                      <button
                        onClick={() => setDropdownToggler(!dropdownToggler)}
                        className="flex cursor-pointer items-center justify-between gap-3 hover:text-primary"
                      >
                        {menuItem.title}
                        <span>
                          <svg
                            className="h-3 w-3 cursor-pointer fill-waterloo group-hover:fill-primary"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                          >
                            <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
                          </svg>
                        </span>
                      </button>

                      <ul
                        className={`dropdown ${dropdownToggler ? "flex" : ""}`}
                      >
                        {menuItem.submenu.map((item, key) => (
                          <li key={key} className="hover:text-primary">
                            <ScrollLink
                              to={item.path}
                              smooth={true}
                              duration={500}
                              offset={-80}
                              className="cursor-pointer"
                            >
                              {item.title}
                            </ScrollLink>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <ScrollLink
                      to={menuItem.path}
                      smooth={true}
                      duration={500}
                      offset={-80}
                      className={`transition-colors duration-200 cursor-pointer ${
                        pathUrl === menuItem.path
                          ? "text-primary hover:text-primary"
                          : "hover:text-primary"
                      }`}
                    >
                      {menuItem.title}
                    </ScrollLink>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          
          {/* Desktop Theme Toggle */}
          <ThemeToggler />
        </div>

        {/* Mobile Navigation Menu */}
        {navigationOpen && (
          <div className="absolute top-full left-0 w-full mt-4 bg-white dark:bg-blacksection rounded-md shadow-solid-5 p-7.5 xl:hidden">
            <nav className="mb-6">
              <ul className="flex flex-col gap-5">
                {menuData.map((menuItem, key) => (
                  <li key={key} className={menuItem.submenu && "group relative"}>
                    {menuItem.submenu ? (
                      <>
                        <button
                          onClick={() => setDropdownToggler(!dropdownToggler)}
                          className="flex cursor-pointer items-center justify-between gap-3 hover:text-primary text-sm w-full"
                        >
                          {menuItem.title}
                          <span>
                            <svg
                              className="h-3 w-3 cursor-pointer fill-waterloo group-hover:fill-primary"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 512 512"
                            >
                              <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
                            </svg>
                          </span>
                        </button>

                        {dropdownToggler && (
                          <ul className="mt-3 pl-4 flex flex-col gap-3">
                            {menuItem.submenu.map((item, key) => (
                              <li key={key} className="hover:text-primary">
                                <ScrollLink
                                  to={item.path}
                                  smooth={true}
                                  duration={500}
                                  offset={-80}
                                  className="cursor-pointer text-sm"
                                >
                                  {item.title}
                                </ScrollLink>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <ScrollLink
                        to={menuItem.path}
                        smooth={true}
                        duration={500}
                        offset={-80}
                        className={`transition-colors duration-200 cursor-pointer text-sm ${
                          pathUrl === menuItem.path
                            ? "text-primary hover:text-primary"
                            : "hover:text-primary"
                        }`}
                        onClick={() => setNavigationOpen(false)}
                      >
                        {menuItem.title}
                      </ScrollLink>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
            
            {/* Mobile Theme Toggle */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
                <ThemeToggler />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
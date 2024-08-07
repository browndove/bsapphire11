import { Metadata } from "next";
import Hero from "@/components/Hero";
import Brands from "@/components/Brands";
import Feature from "@/components/Features";
import About from "@/components/About";
import FeaturesTab from "@/components/FeaturesTab";

import Integration from "@/components/Integration";

import Contact from "@/components/Contact";
import Blog from "@/components/Blog"
import Testimonial from "@/components/Testimonial";

export const metadata: Metadata = {
  title: "Black Shapphire",
  description: "Official website of Blvcksapphire Ltd.",
  // other metadata
};

export default function Home() {
  return (
    <main>
      <Hero />
      <Brands />
      <Feature />
      <About />
      <FeaturesTab />

      <Integration />
     
      
      <Testimonial />
      <Blog/>
      <Contact />
    
    </main>
  );
}

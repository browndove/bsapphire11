import React from "react";
import SectionHeader from "../Common/SectionHeader";

const Blog = async () => {
  const blogs = [
    {
      title: 'Storesradar.com',
      description: 'Storesradar.com is a tool designed to help shoppers in Africa buy goods online from major US, UK, and China retailers.',
      image: 'three/storesradar2.png',
    },
    {
      title: 'Prime Relif',
      description: 'Prime Relif provides practical and innovative guidance to assist companies in finding the right Design, Installation, and Maintenance engineering solutions for their facilities and assets.',
      image: 'three/a.png',
    },
    {
      title: 'Fvlcon',
      description: 'Fvlcon is an AI/ML technology providing security solutions to institutions in Africa and beyond.',
      image: 'three/FVLCON-03.png',
    },
  ];

  return (
    <section className="py-20 lg:py-25 xl:py-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        {/* <!-- Section Title Start --> */}
        <div className="animate_top mx-auto text-center">
          <SectionHeader
            headerInfo={{
              title: `Our Key Projects`,
              subtitle: `Innovative Solutions We're Developing`,
              description: `Some prominent projects we are working on`,
            }}
          />
        </div>
        {/* <!-- Section Title End --> */}
      </div>

      <div className="mx-auto mt-15 max-w-c-1280 px-4 md:px-8 xl:mt-20 xl:px-0">
        <div className="grid grid-cols-1 gap-7.5 md:grid-cols-2 lg:grid-cols-3 xl:gap-10">
          {blogs.map((blog, index) => (
            <div key={index} className="rounded-lg overflow-hidden shadow-lg dark:bg-gray-800">
              <img 
                src={blog.image} 
                alt={blog.title} 
                className="w-full h-auto max-w-[390px] max-h-[250px] object-cover "  // Set a fixed height and full width
              />
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{blog.title}</h2>
                <p className="text-gray-700 dark:text-gray-300">{blog.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;

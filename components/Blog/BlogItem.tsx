"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const Card = ({ blog }) => {
  const { mainImage, title, metadata } = blog;

  return (
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
      className="animate_top rounded-lg bg-white p-4 pb-9 shadow-lg dark:bg-gray-800"
    >
      <Link href={`/g/`} className="relative block overflow-hidden rounded aspect-w-16 aspect-h-9">
        <Image
          src={mainImage}
          alt={title}
          fill
          className="object-cover"
        />
      </Link>
      <div className="px-4">
        <h3 className="mb-3.5 mt-7.5 line-clamp-2 inline-block text-lg font-medium text-black duration-300 hover:text-primary dark:text-white dark:hover:text-primary xl:text-itemtitle2">
          {title}
        </h3>
        <p className="line-clamp-3 text-gray-600 dark:text-gray-300">{metadata}</p>
      </div>
    </motion.div>
  );
};

const BlogCards = ({ blogs }) => {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {blogs.map((blog) => (
        <Card key={blog.id} blog={blog} />
      ))}
    </div>
  );
};

export default BlogCards;

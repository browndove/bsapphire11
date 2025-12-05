import { Testimonial } from "@/types/testimonial";
import Image from "next/image";
import Link from "next/link";

const SingleTestimonial = ({ review }: { review: Testimonial }) => {
  const { name, designation, image, content, slug } = review;
  
  const handleCardClick = () => {
    if (slug) {
      window.location.href = `/careers/${slug}`;
    }
  };

  return (
    <div 
      className="rounded-lg bg-white p-9 pt-7.5 shadow-solid-9 dark:border dark:border-strokedark dark:bg-blacksection dark:shadow-none cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleCardClick}
    >
      <div className="mb-7.5 flex justify-between border-b border-stroke pb-6 dark:border-strokedark">
        <div>
          <h3 className="mb-1.5 text-metatitle3 text-black dark:text-white">
            {name}
          </h3>
          <p>{designation}</p>
        </div>
        <div className="flex-shrink-0">
          <Image
            width={60}
            height={50}
            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20"
            src={image}
            alt={name}
          />
        </div>
      </div>

      <p className="mb-2">{content}</p>
      
      {slug && (
        <Link 
          href={`/careers/${slug}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm transition-colors duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          Read More
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="currentColor"
          >
            <path d="M10.4767 6.16701L6.00668 1.69701L7.18501 0.518677L13.6667 7.00034L7.18501 13.482L6.00668 12.3037L10.4767 7.83368H0.333344V6.16701H10.4767Z" />
          </svg>
        </Link>
      )}
    </div>
  );
};

export default SingleTestimonial;

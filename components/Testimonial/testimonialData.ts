import image1 from "@/public/images/user/user-01.png";
import image2 from "@/public/images/user/user-02.png";
import { Testimonial } from "@/types/testimonial";

export const testimonialData: Testimonial[] = [
  {
    id: 1,
    slug: "business-lead",
    name: "Business Lead",
    designation: "BLVCK SAPPHIRE, Primarily remote with in-person stakeholder meetings",
    image: image1,
    content:
      "We are seeking a Business Lead to support the growth of our business and the coordination of day-to-day operations in Ghana. The ideal candidate will help manage relationships with key stakeholders, support pilots and deployments, and ensure that business activities run smoothly.",
  },
  {
    id: 2,
    slug: "frontend-developer",
    name: "Front-End Developer",
    designation: "BLVCK SAPPHIRE, Entry Level • Remote (Ghana)",
    image: image2,
    content:
      "We are seeking a motivated and talented Front-End Developer to join our team and support the development of user-facing features for our web applications. The ideal candidate is an entry-level developer with a solid foundation in front-end technologies, at least 1 year of hands-on experience, and a passion for clean, efficient code.",
  }
];

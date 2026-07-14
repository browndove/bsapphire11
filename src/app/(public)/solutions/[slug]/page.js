import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getSectionById,
  solutionSlugs,
  solutionBreadcrumbLabel,
} from '@/lib/content/solutions';
import SolutionsPageStyles from '@/components/solutions/SolutionsPageStyles';
import SolutionsSection from '@/components/solutions/SolutionsSection';

export function generateStaticParams() {
  return solutionSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const section = getSectionById(slug);
  if (!section) return { title: 'Not Found' };
  return { title: `${section.title} | Blvck Sapphire` };
}

export default async function SolutionDetailPage({ params }) {
  const { slug } = await params;
  const section = getSectionById(slug);

  if (!section) {
    notFound();
  }

  return (
    <>
      <SolutionsPageStyles />
      <main>
        <div className="solutions-page-header">
          <div className="container">
            <p className="solutions-breadcrumb">
              <Link href="/solutions">Solutions</Link>
              <span aria-hidden="true"> / </span>
              <span>{solutionBreadcrumbLabel(section)}</span>
            </p>
            <h1 className="solutions-page-title">{section.title}</h1>
            <p className="solutions-page-subtitle">{section.description}</p>
          </div>
        </div>

        <div className="container">
          <SolutionsSection section={section} hideIntro />
          <p style={{ paddingBottom: '4rem' }}>
            <Link href="/solutions" className="btn btn-outline btn-sm">
              View all industry solutions
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}

import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getSectionByIndustrySlug,
  industrySlugs,
} from '@/lib/content/solutions';
import SolutionsPageStyles from '@/components/solutions/SolutionsPageStyles';
import SolutionsSection from '@/components/solutions/SolutionsSection';

export function generateStaticParams() {
  return industrySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const section = getSectionByIndustrySlug(slug);
  if (!section) return { title: 'Not Found' };
  return { title: `${section.title} | Blvck Sapphire` };
}

export default async function IndustryPage({ params }) {
  const { slug } = await params;
  const section = getSectionByIndustrySlug(slug);

  if (!section) {
    notFound();
  }

  const breadcrumbLabel =
    slug === 'healthcare'
      ? 'Healthcare'
      : slug === 'environment'
        ? 'Environmental'
        : slug === 'security'
          ? 'Security'
          : section.title;

  return (
    <>
      <SolutionsPageStyles />
      <main>
        <div className="solutions-page-header">
          <div className="container">
            <p className="solutions-breadcrumb">
              <Link href="/solutions">Solutions</Link>
              <span aria-hidden="true"> / </span>
              <span>{breadcrumbLabel}</span>
            </p>
            <h1 className="solutions-page-title">{section.title}</h1>
            <p className="solutions-page-subtitle">{section.description}</p>
          </div>
        </div>

        <div className="container">
          <SolutionsSection section={section} hideIntro />
          <p style={{ paddingBottom: '4rem' }}>
            <Link href={`/solutions#${section.id}`} className="btn btn-outline btn-sm">
              View all industry solutions
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}

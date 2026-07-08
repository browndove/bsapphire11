import { solutionsPage } from '@/lib/content/solutions';
import SolutionsPageStyles from '@/components/solutions/SolutionsPageStyles';
import SolutionsSection from '@/components/solutions/SolutionsSection';
import HashScroll from '@/components/solutions/HashScroll';

export const metadata = {
  title: 'Solutions | Blvck Sapphire',
};

export default function Solutions() {
  return (
    <>
      <SolutionsPageStyles />
      <HashScroll />
      <main>
        <div className="solutions-page-header">
          <div className="container">
            <h1 className="solutions-page-title">{solutionsPage.title}</h1>
            <p className="solutions-page-subtitle">{solutionsPage.subtitle}</p>
          </div>
        </div>

        <div className="container">
          {solutionsPage.sections.map((section) => (
            <SolutionsSection key={section.id} section={section} />
          ))}
        </div>
      </main>
    </>
  );
}

export default function SolutionsPageStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
        .solutions-page-header {
          padding: 140px 0 60px;
          border-bottom: 1px solid var(--border-color);
        }
        .solutions-page-title {
          font-size: clamp(3rem, 5vw, 5rem);
        }
        .solutions-page-subtitle {
          font-size: 1.3rem;
          margin-top: 1rem;
          max-width: 600px;
          color: var(--text-muted);
        }
        .solutions-breadcrumb {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }
        .solutions-breadcrumb a {
          color: var(--text-muted);
          text-decoration: none;
        }
        .solutions-breadcrumb a:hover {
          color: var(--text-color);
        }
        .product-block {
          padding: 4rem 0;
          border-bottom: 1px solid var(--border-color);
          scroll-margin-top: 100px;
        }
        .product-block:last-child {
          border-bottom: none;
        }
        .product-content h3 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: var(--text-color);
        }
        .product-content h4 {
          font-size: 1.2rem;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: var(--text-color);
        }
        .product-desc {
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
          color: var(--text-muted);
          line-height: 1.7;
        }
        .feature-list {
          list-style: none;
          margin: 1rem 0 0 1rem;
          padding: 0;
        }
        .feature-list li {
          margin-bottom: 0.5rem;
          position: relative;
          padding-left: 1.5rem;
          color: var(--text-muted);
        }
        .feature-list li::before {
          content: '→';
          position: absolute;
          left: 0;
          color: var(--text-muted);
        }
        .sub-product {
          margin-top: 3rem;
          background: rgba(5, 5, 5, 0.5);
          padding: 2rem;
          border-left: 2px solid var(--text-color);
        }
        .sub-product.is-muted {
          border-left-color: var(--text-muted);
        }
        .sub-product h4 {
          margin-top: 0;
        }
        .sub-product p {
          color: var(--text-muted);
          line-height: 1.7;
          margin: 0;
        }
      `,
      }}
    />
  );
}

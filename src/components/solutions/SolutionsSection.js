export default function SolutionsSection({ section, hideIntro = false }) {
  if (!section) return null;

  return (
    <div className="product-block" id={section.id}>
      <div className="product-content">
        {!hideIntro ? (
          <>
            <h3>{section.title}</h3>
            <p className="product-desc">{section.description}</p>
          </>
        ) : null}

        {(section.subProducts || []).map((sub, index) => (
          <div
            className={`sub-product${sub.mutedBorder ? ' is-muted' : ''}`}
            key={sub.title || index}
          >
            {sub.title ? <h4>{sub.title}</h4> : null}
            <p>{sub.body}</p>
            {sub.features?.length ? (
              <ul className="feature-list">
                {sub.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

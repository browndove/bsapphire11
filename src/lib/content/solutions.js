export const solutionsPage = {
  title: 'Industry Solutions.',
  subtitle: 'Modular intelligence and resilient systems spanning across core sectors.',
  sections: [
    {
      id: 'healthcare',
      title: 'Healthcare Intelligence',
      description:
        'Advanced data processing, biometric verification, and secure operational communication systems designed for high-stake clinical environments.',
      subProducts: [
        {
          title: 'Biometric Identity & Verification Framework',
          body: 'Resolving fraudulent insurance claims vulnerabilities through robust edge identity verification and AI-driven rule validation. Ensures real-time presence checks using advanced biometric facial recognition, transparent encounter management, and automated insurance claim analysis.',
          features: [
            'Automated biometric verification (Facial/Fingerprint)',
            'Real-time claim processing and AI review',
            'Secure and scalable architecture',
          ],
        },
        {
          title: 'Secure Clinical Collaboration Platform',
          body: 'A secure, role-based clinical messaging platform replacing fragmented communications with compliant escalation frameworks. Protects audit trails and streamlines emergency coordination in hospitals.',
          features: [
            'Role-based dynamic routing and priority alerts',
            'Geolocation-based shift logging and handovers',
            'Strict data encryption and granular access control',
          ],
        },
      ],
    },
    {
      id: 'environmental',
      title: 'Environmental & Resource Compliance',
      description:
        'Cloud-native AI systems and remote sensing algorithms built to combat illicit activities across vast terrains, ensuring objective ecological oversight.',
      subProducts: [
        {
          title: 'Ecosystem Monitoring Engine',
          body: 'An intelligence platform mapping and tracking illegal mining footprints. Utilizes innovative object detection models and high-resolution satellite imagery to continuously flag suspicious topographical changes near sensitive ecological zones.',
          features: [
            'Automated satellite identification of prohibited excavations',
            'Citizen reporting workflows synced with GIS infrastructure',
            'Real-time geospatial analytics and situational awareness',
          ],
        },
        {
          title: 'Automated Mining Concession Enforcement',
          body: 'An automated regulatory enforcement tool utilizing artificial intelligence frameworks to measure mining concession overlaps. Generates quantifiable evidence of spatial violations and automates regulatory fine proposals.',
          features: [
            'Continuous boundary mapping via geoAI analysis',
            'Trigger-based alerts and automated metric calculations',
            'Verifiable and objective orbital evidence generation',
          ],
        },
      ],
    },
    {
      id: 'security',
      title: 'Security & Intelligence',
      description:
        'Scalable object recognition and tracking architectures built to enforce real-world authority and safety.',
      subProducts: [
        {
          title: 'Visual Intelligence & Tracking Matrix',
          body: 'An advanced visual tracking matrix processing live video feeds for automated entity recognition. Turns raw surveillance into actionable intelligence, state of the art artificial intelligence mapped to cloud-accelerated GPU resources.',
          features: [
            'Distributed real-time human and vehicle tracking',
            'Edge-to-cloud visual pipeline across heterogeneous sources',
            'Strict authentication secured API and analytics dashboards',
          ],
        },
      ],
    },
    {
      id: 'public-sector',
      title: 'Public Sector & Economic Architecture',
      description:
        'Revolutionizing national infrastructure constraints with structured trust ecosystems and transparent digital workflows.',
      subProducts: [
        {
          title: 'Integrated Talent Infrastructure',
          body: 'An intelligent talent ecosystem establishing structured, high-trust gig and permanent labor markets. Integrates National ID verifications, escrow deployments, and AI HR copilot features to formally scale professional exchanges.',
        },
        {
          title: 'Digital Housing Pipeline',
          body: 'A sophisticated PropTech digital pipeline organizing rental compliance. Leverages data models and geospatial (GhanaPostGPS) mapping to flag anomalous rent pricing, streamline verified contracts, and generate objective market intelligence for government regulators.',
        },
      ],
    },
    {
      id: 'technology',
      title: 'Custom Technology Solutions',
      description:
        'Bespoke technical infrastructures leveraging foundational models and high-performance computing to solve opaque enterprise constraints.',
      subProducts: [
        {
          body: 'At Blvck Sapphire, beyond our core product suite, we engineer custom data and reasoning pipelines specific to organizational logic. Whether distributed edge computing or secure fine-tuned AI endpoints, our architecture is always purely functional, entirely secure, and universally scalable.',
          mutedBorder: true,
        },
      ],
    },
  ],
};

/** Maps /industries/[slug] route slugs to solutions section ids */
export const industrySlugToSectionId = {
  healthcare: 'healthcare',
  environment: 'environmental',
  security: 'security',
};

export const industrySlugs = Object.keys(industrySlugToSectionId);

export function getSectionById(sectionId) {
  return solutionsPage.sections.find((s) => s.id === sectionId) || null;
}

export function getSectionByIndustrySlug(slug) {
  const sectionId = industrySlugToSectionId[slug];
  if (!sectionId) return null;
  return getSectionById(sectionId);
}

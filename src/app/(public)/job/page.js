import Link from 'next/link';

export const metadata = {
  title: 'Job Application | Blvck Sapphire',
};

const jobs = {
  "vp-software-engineering": {
      title: "VP of Software Engineering",
      location: "Accra, Ghana (Remote / Hybrid)",
      department: "Development",
      desc: (
        <>
          <h3>About Blvck Sapphire</h3>
          <p>At Blvck Sapphire, we want to help industrial engineering paradigms bring autonomous infrastructure to the bleeding edge globally. We make it easy for enterprises across Africa specifically to natively integrate rigorous AI constraints, access encryption, and model efficiency locally without structural dependency delays.</p>
          <p>With Blvck Sapphire, subject matter experts and automated scaling algorithms work cooperatively avoiding data localization pitfalls and reducing operating costs effectively.</p>
          
          <h3>About the Role</h3>
          <p>This role is for a high-impact engineering leader who has been in the trenches at scaling startups in Africa and beyond. As VP of Software Engineering, you'll be responsible for building and maintaining a scalable engineering organization across Product Development, Data Security, and Systems Architecture.</p>
          <p>This is a position for an individual hands-on enough to trace backend bottleneck issues in code, but strategic enough to interface with corporate heads shaping infrastructural integration patterns natively on the continent.</p>

          <h3>What You'll Do</h3>
          <ul>
              <li>Lead Software Engineering within Blvck Sapphire’s core platform team</li>
              <li>Guide and grow engineering pods to improve development speed and architectural confidence</li>
              <li>Partner with Product to drive roadmap planning, tracking progress, and feasibility tradeoffs</li>
              <li>Ensure compliance with international standards and strict Ghanaian enterprise data protection laws</li>
              <li>Help scale our regional team with elite pan-African tech talent</li>
          </ul>

          <h3>What You'll Bring</h3>
          <ul>
              <li>Significant experience managing and developing large-scale enterprise tech or SaaS systems</li>
              <li>High proficiency with cloud stacks specifically tailored to global and regional deployment networks</li>
              <li>Strong knowledge of deploying AI coding solutions and scaling large language constraints</li>
              <li>5+ years in engineering leadership managing managers</li>
              <li>Familiarity with building secure, compliant software natively within Africa's regulated tech landscapes</li>
          </ul>

          <h3>Extra Details</h3>
          <p><strong>Compensation:</strong> Highly competitive and attractive package aligned with Tier-1 capabilities locally.</p>
          <p><strong>Benefits:</strong> Extended comprehensive health coverage, robust SSNIT/Tier-3 matching contributions, and unlimited flexible time-off mapping.</p>
          <p><strong>Work Setup:</strong> Our primary office location is in Accra, where we offer hybrid and remote opportunities. This role has the flexibility to work completely remotely from anywhere within Ghana or the wider timezone.</p>
        </>
      )
  },
  "default": {
      title: "Accelerated Systems Engineer",
      location: "Accra, Ghana (Remote)",
      department: "Development",
      desc: (
        <>
          <h3>About Blvck Sapphire</h3>
          <p>Blvck Sapphire architects industrial-grade digital layers mapped specifically for operational scalability. We enable automation and systemic oversight across borders effortlessly.</p>
          <h3>About the Role</h3>
          <p>We are seeking highly capable, elite technical talent to engineer our next-tier platform parameters mapped against local Ghanaian infrastructure protocols.</p>
          <h3>What You'll Bring</h3>
          <ul>
              <li>Proven track record of high performance in a highly iterative environment</li>
              <li>Deep understanding of modern tech architectures specifically tailored for enterprise environments</li>
              <li>Aptitude for integrating multi-level data models seamlessly into robust internal structures</li>
          </ul>
        </>
      )
  }
};

export default function Job({ searchParams }) {
  const roleParam = searchParams.role || 'default';
  const job = jobs[roleParam] || jobs['default'];

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .job-header {
            padding: 150px 0 50px;
            border-bottom: 1px solid var(--border-color);
        }
        .job-meta-tag {
            display: inline-block;
            background: #111;
            border: 1px solid #333;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            color: #ccc;
            margin-right: 10px;
            margin-bottom: 20px;
        }
        .job-content-container {
            display: flex;
            flex-wrap: wrap;
            gap: 4rem;
            margin-top: 4rem;
        }
        .job-description-block {
            flex: 2;
            min-width: 300px;
            color: #ccc;
            font-size: 1.1rem;
            line-height: 1.8;
        }
        .job-description-block h3 {
            color: #fff;
            margin-top: 3rem;
            margin-bottom: 1rem;
            font-size: 1.5rem;
        }
        .job-description-block h3:first-child {
            margin-top: 0;
        }
        .job-description-block ul {
            margin-bottom: 1.5rem;
            padding-left: 1.5rem;
        }
        .job-description-block li {
            margin-bottom: 0.5rem;
        }
        .job-apply-block {
            flex: 1;
            min-width: 300px;
            background: #050505;
            border: 1px solid #222;
            padding: 2.5rem;
            border-radius: 8px;
            height: fit-content;
            position: sticky;
            top: 100px;
        }
        .form-group {
            margin-bottom: 1.5rem;
        }
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            color: #eee;
            font-weight: 500;
        }
        .form-group input[type="text"], 
        .form-group input[type="email"], 
        .form-group input[type="tel"], 
        .form-group select, 
        .form-group textarea {
            width: 100%;
            padding: 12px;
            background: #111;
            border: 1px solid #333;
            border-radius: 4px;
            color: #fff;
            font-family: inherit;
        }
        .form-group input[type="file"] {
            color: #aaa;
            padding: 10px 0;
        }
        .form-required {
            color: #ff5f56;
        }
      `}} />
      <main>
        <header className="job-header">
          <div className="container slide-up">
            <span className="job-meta-tag">{job.department}</span>
            <span className="job-meta-tag">{job.location}</span>
            <h1 style={{ fontSize: '3rem', marginTop: '15px', marginBottom: '0' }}>{job.title}</h1>
          </div>
        </header>
        <section className="section" style={{ paddingTop: '0' }}>
          <div className="container">
            <div className="job-content-container">
              <div className="job-description-block slide-up">
                {job.desc}
              </div>
              <div className="job-apply-block slide-up delay-1">
                <h3 style={{ marginTop: '0', marginBottom: '20px', borderBottom: '1px solid #222', paddingBottom: '15px', fontSize: '1.3rem' }}>Apply for this job</h3>
                <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '20px' }}><span className="form-required">*</span> indicates a required field</p>
                
                <form action="/success-job" method="get">
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div className="form-group" style={{ flex: '1' }}>
                      <label>First Name <span className="form-required">*</span></label>
                      <input type="text" required />
                    </div>
                    <div className="form-group" style={{ flex: '1' }}>
                      <label>Last Name <span className="form-required">*</span></label>
                      <input type="text" required />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Email <span className="form-required">*</span></label>
                    <input type="email" required />
                  </div>
                  <div className="form-group">
                    <label>Phone Contact <span className="form-required">*</span></label>
                    <input type="tel" required placeholder="+233..." />
                  </div>
                  <div className="form-group">
                    <label>Resume/CV <span className="form-required">*</span></label>
                    <input type="file" required accept=".pdf,.doc,.docx" style={{ fontSize: '0.85rem' }} />
                  </div>
                  <div className="form-group">
                    <label>Cover Letter</label>
                    <input type="file" accept=".pdf,.doc,.docx" style={{ fontSize: '0.85rem' }} />
                  </div>
                  <div className="form-group">
                    <label>Why Blvck Sapphire? <span className="form-required">*</span></label>
                    <textarea rows="3" required></textarea>
                  </div>
                  <div className="form-group">
                    <label>LinkedIn Profile / Portfolio Link <span className="form-required">*</span></label>
                    <input type="text" required />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', borderRadius: '4px', padding: '15px', marginTop: '10px' }}>Submit Application</button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

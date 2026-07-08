import os
import json

base_dir = r'c:\Users\brite\Desktop\Data\Galamsey\Scripts\notifications\company-site'

with open(os.path.join(base_dir, 'careers_scaffold.json'), 'r') as f:
    scaffold = json.load(f)

head = scaffold['head']
nav = scaffold['nav']
footer = scaffold['footer']

job_html = f'''<!DOCTYPE html>
<html lang="en">
{head}
<style>
/* Job specific styles */
.job-header {{
    padding: 150px 0 50px;
    border-bottom: 1px solid var(--border-color);
}}
.job-meta-tag {{
    display: inline-block;
    background: #111;
    border: 1px solid #333;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    color: #aaa;
    margin-right: 10px;
    margin-bottom: 20px;
}}
.job-content-container {{
    display: flex;
    gap: 4rem;
    margin-top: 4rem;
}}
.job-description-block {{
    flex: 2;
    color: #ccc;
    font-size: 1.1rem;
    line-height: 1.8;
}}
.job-description-block h3 {{
    color: #fff;
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-size: 1.5rem;
}}
.job-description-block ul {{
    margin-bottom: 1.5rem;
    padding-left: 1.5rem;
}}
.job-description-block li {{
    margin-bottom: 0.5rem;
}}
.job-apply-block {{
    flex: 1;
    background: #050505;
    border: 1px solid #222;
    padding: 2.5rem;
    border-radius: 8px;
    height: fit-content;
    position: sticky;
    top: 100px;
}}
.form-group {{
    margin-bottom: 1.5rem;
}}
.form-group label {{
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: #eee;
}}
.form-group input[type="text"], 
.form-group input[type="email"], 
.form-group input[type="tel"], 
.form-group select, 
.form-group textarea {{
    width: 100%;
    padding: 12px;
    background: #111;
    border: 1px solid #333;
    border-radius: 4px;
    color: #fff;
    font-family: inherit;
}}
.form-group input[type="file"] {{
    color: #aaa;
    padding: 10px 0;
}}
.form-required {{
    color: #ff5f56;
}}
</style>
<body>
    {nav}

    <!-- Dynamic Content Rendered Here -->
    <div id="job-dynamic-content"></div>

    {footer}

    <script>
        const jobs = {{
            "vp-software-engineering": {{
                title: "VP of Software Engineering",
                location: "Accra, Ghana (Remote / Hybrid)",
                department: "Development",
                desc: `
                    <h3>About BlvckSapphire</h3>
                    <p>At BlvckSapphire, we engineer intelligent automated infrastructure for modern logistics and enterprise operations. We bridge the gap between AI modeling and everyday industrial applications, making operations infinitely scalable and mathematically precise.</p>
                    
                    <h3>About the Role</h3>
                    <p>This role is for a high-impact engineering leader who has been in the trenches at scaling startups in Africa and beyond. As VP of Software Engineering, you'll be responsible for building and maintaining a scalable engineering organization across Product Development, Data Security, and Systems Architecture.</p>
                    <p>You'll partner closely with Product to ship robust infrastructure with strict compliance to national data regulations and modern cloud specifications.</p>

                    <h3>What You'll Do</h3>
                    <ul>
                        <li>Lead Software Engineering within BlvckSapphire’s core platform team</li>
                        <li>Guide and grow engineering pods to improve development speed and architectural confidence</li>
                        <li>Partner with stakeholders to drive roadmap planning and feasibility tradeoffs</li>
                        <li>Ensure compliance with international standards and strict Ghanaian enterprise data laws</li>
                        <li>Help scale our regional team with elite pan-African tech talent</li>
                    </ul>

                    <h3>What You'll Bring</h3>
                    <ul>
                        <li>Significant experience managing large-scale enterprise tech or SaaS systems</li>
                        <li>High proficiency with cloud stacks specifically tailored to global and regional AWS/GCP regions</li>
                        <li>Strong knowledge of securing AI solutions and managing deployments</li>
                        <li>5+ years in engineering leadership managing managers</li>
                    </ul>

                    <h3>Extra Details</h3>
                    <p><strong>Compensation:</strong> Highly competitive compensation indexed globally, including stock options and performance bonuses.</p>
                    <p><strong>Benefits:</strong> Extended comprehensive health coverage (including dependents), SSNIT matching where applicable, and generous paid time off.</p>
                `
            }},
            // We can add the others below, but mapping a default works as a fallback!
            "default": {{
                title: "Tech Role at BlvckSapphire",
                location: "Remote, Ghana",
                department: "General",
                desc: `
                    <h3>About BlvckSapphire</h3>
                    <p>We engineer intelligent automated infrastructure. Join our elite tech team.</p>
                    <h3>About the Role</h3>
                    <p>We are seeking high-tier technical talent to help drive our vision forward. You'll be contributing to highly critical, scalable infrastructure that shapes the future.</p>
                    <h3>Requirements</h3>
                    <ul>
                        <li>Proven track record of high performance in a fast-paced environment</li>
                        <li>Deep understanding of modern tech architectures</li>
                    </ul>
                `
            }}
        }};

        document.addEventListener('DOMContentLoaded', () => {{
            const urlParams = new URLSearchParams(window.location.search);
            let roleParam = urlParams.get('role');
            if(!jobs[roleParam]) roleParam = 'default';
            
            const job = jobs[roleParam];

            // Render Page
            const container = document.getElementById('job-dynamic-content');
            container.innerHTML = \`
                <header class="job-header">
                    <div class="container slide-up">
                        <span class="job-meta-tag">\${{job.department}}</span>
                        <span class="job-meta-tag">\${{job.location}}</span>
                        <h1 style="font-size: 3rem; margin-top: 10px;">\${{job.title}}</h1>
                    </div>
                </header>
                <section class="section" style="padding-top: 0;">
                    <div class="container">
                        <div class="job-content-container">
                            <div class="job-description-block slide-up delay-2">
                                \${{job.desc}}
                            </div>
                            <div class="job-apply-block slide-up delay-3">
                                <h3 style="margin-bottom: 20px; border-bottom: 1px solid #222; padding-bottom: 15px;">Apply for this job</h3>
                                <p style="font-size: 0.8rem; color: #666; margin-bottom: 20px;"><span class="form-required">*</span> indicates a required field</p>
                                
                                <form>
                                    <div class="form-group">
                                        <label>First Name <span class="form-required">*</span></label>
                                        <input type="text" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Last Name <span class="form-required">*</span></label>
                                        <input type="text" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Email <span class="form-required">*</span></label>
                                        <input type="email" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Phone <span class="form-required">*</span></label>
                                        <input type="tel" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Resume/CV <span class="form-required">*</span></label>
                                        <input type="file" required accept=".pdf,.doc,.docx">
                                    </div>
                                    <div class="form-group">
                                        <label>Cover Letter</label>
                                        <input type="file" accept=".pdf,.doc,.docx">
                                    </div>
                                    <div class="form-group">
                                        <label>Why are you interested in joining BlvckSapphire? <span class="form-required">*</span></label>
                                        <textarea rows="4" required></textarea>
                                    </div>
                                    <div class="form-group">
                                        <label>LinkedIn Profile</label>
                                        <input type="text">
                                    </div>
                                    <div class="form-group">
                                        <label>Are you legally eligible to work in Ghana? <span class="form-required">*</span></label>
                                        <select required>
                                            <option value="">Select...</option>
                                            <option value="yes">Yes</option>
                                            <option value="no">No</option>
                                        </select>
                                    </div>
                                    <button type="submit" class="btn btn-primary" style="width: 100%; border-radius: 4px; padding: 15px;">Submit Application</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            \`;
        }});
    </script>
</body>
</html>
'''

# Update careers.html links to point to this page
careers_path = os.path.join(base_dir, 'careers.html')
with open(careers_path, 'r', encoding='utf-8') as f:
    careers_html = f.read()

# Map replacements
careers_html = careers_html.replace('href="#apply"', 'href="job.html?role=default"')
# Give VP role the specific tag
careers_html = careers_html.replace('href="job.html?role=default" class="job-tray" data-department="Development">\n                    <div class="job-tray-info">\n                        <span class="job-dept">Development</span>\n                        <h3 class="job-title-text">VP of Software Engineering</h3>', 'href="job.html?role=vp-software-engineering" class="job-tray" data-department="Development">\n                    <div class="job-tray-info">\n                        <span class="job-dept">Development</span>\n                        <h3 class="job-title-text">VP of Software Engineering</h3>')


with open(os.path.join(base_dir, 'job.html'), 'w', encoding='utf-8') as f:
    f.write(job_html)

with open(careers_path, 'w', encoding='utf-8') as f:
    f.write(careers_html)

print("Generated job.html and linked accurately via url search queries.")

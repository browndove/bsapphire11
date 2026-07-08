import re
import os

base_dir = r'c:\Users\brite\Desktop\Data\Galamsey\Scripts\notifications\company-site'
html_path = os.path.join(base_dir, 'index.html')

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Extract segments robustly
head_match = re.search(r'<head>.*?</head>', html, re.DOTALL)
head = head_match.group(0) if head_match else ''
head = head.replace('<title>BlvckSapphire | Intelligent Logistics</title>', '<title>Careers | BlvckSapphire</title>')

nav_match = re.search(r'<nav class="navbar">.*?</nav>', html, re.DOTALL)
nav = nav_match.group(0) if nav_match else ''

footer_match = re.search(r'<footer class="site-footer">.*?</footer>', html, re.DOTALL)
footer = footer_match.group(0) if footer_match else ''

out_path = os.path.join(base_dir, 'careers.html')

content = f'''<!DOCTYPE html>
<html lang="en">
{head}
<body>
    {nav}

    <!-- Careers Hero -->
    <header class="section" style="padding-top: 150px; padding-bottom: 50px;">
        <div class="container text-center slide-up">
            <h1 class="hero-title" style="font-size: 3.5rem; margin-bottom: 1rem;">Open roles at BlvckSapphire</h1>
            <p class="hero-desc" style="max-width: 600px; margin: 0 auto;">Join the architects of infinite scale. We're looking for visionary thinkers to build the resilient automation layers of tomorrow.</p>
        </div>
    </header>

    <!-- Careers Filter & List -->
    <section class="section" style="padding-top: 0;">
        <div class="container" style="max-width: 900px;">
            <!-- Careers Filter -->
            <div class="careers-filter slide-up delay-2">
                <button class="filter-btn active" data-filter="all">All roles</button>
                <button class="filter-btn" data-filter="Development">Development</button>
                <button class="filter-btn" data-filter="AI">AI & Data</button>
                <button class="filter-btn" data-filter="Business">Sales & Business</button>
                <button class="filter-btn" data-filter="Marketing">Marketing</button>
                <button class="filter-btn" data-filter="Finance">Finance</button>
            </div>

            <!-- Job Trays -->
            <div class="job-list slide-up delay-3">
                <!-- Development Jobs -->
                <a href="#apply" class="job-tray" data-department="Development">
                    <div class="job-tray-info">
                        <span class="job-dept">Development</span>
                        <h3 class="job-title-text">VP of Software Engineering</h3>
                        <span class="job-location">Remote, Canada</span>
                    </div>
                    <div class="job-tray-arrow">&#8594;</div>
                </a>
                <a href="#apply" class="job-tray" data-department="Development">
                    <div class="job-tray-info">
                        <span class="job-dept">Development</span>
                        <h3 class="job-title-text">Senior Backend Engineer</h3>
                        <span class="job-location">Remote, Global</span>
                    </div>
                    <div class="job-tray-arrow">&#8594;</div>
                </a>
                <a href="#apply" class="job-tray" data-department="Development">
                    <div class="job-tray-info">
                        <span class="job-dept">Development</span>
                        <h3 class="job-title-text">Frontend Developer</h3>
                        <span class="job-location">Remote, North America</span>
                    </div>
                    <div class="job-tray-arrow">&#8594;</div>
                </a>

                <!-- AI Jobs -->
                <a href="#apply" class="job-tray" data-department="AI">
                    <div class="job-tray-info">
                        <span class="job-dept">AI & Data</span>
                        <h3 class="job-title-text">AI Engineer</h3>
                        <span class="job-location">Remote, UK / Europe</span>
                    </div>
                    <div class="job-tray-arrow">&#8594;</div>
                </a>
                <a href="#apply" class="job-tray" data-department="AI">
                    <div class="job-tray-info">
                        <span class="job-dept">AI & Data</span>
                        <h3 class="job-title-text">Machine Learning Architect</h3>
                        <span class="job-location">Remote, US</span>
                    </div>
                    <div class="job-tray-arrow">&#8594;</div>
                </a>

                <!-- Business Jobs -->
                <a href="#apply" class="job-tray" data-department="Business">
                    <div class="job-tray-info">
                        <span class="job-dept">Sales & Business</span>
                        <h3 class="job-title-text">Business Development Manager</h3>
                        <span class="job-location">Remote, Global</span>
                    </div>
                    <div class="job-tray-arrow">&#8594;</div>
                </a>

                <!-- Marketing -->
                <a href="#apply" class="job-tray" data-department="Marketing">
                    <div class="job-tray-info">
                        <span class="job-dept">Marketing</span>
                        <h3 class="job-title-text">Product Marketing Manager</h3>
                        <span class="job-location">Remote, North America</span>
                    </div>
                    <div class="job-tray-arrow">&#8594;</div>
                </a>

                <!-- Finance -->
                <a href="#apply" class="job-tray" data-department="Finance">
                    <div class="job-tray-info">
                        <span class="job-dept">Finance</span>
                        <h3 class="job-title-text">Accountant</h3>
                        <span class="job-location">Remote, NL</span>
                    </div>
                    <div class="job-tray-arrow">&#8594;</div>
                </a>
            </div>
        </div>
    </section>

    {footer}

    <script src="app.js"></script>
    <script>
        // Career Filtering Logic
        document.addEventListener('DOMContentLoaded', () => {{
            const filterBtns = document.querySelectorAll('.filter-btn');
            const jobTrays = document.querySelectorAll('.job-tray');

            filterBtns.forEach(btn => {{
                btn.addEventListener('click', () => {{
                    // Remove active from all
                    filterBtns.forEach(b => b.classList.remove('active'));
                    // Add active to clicked
                    btn.classList.add('active');

                    const filter = btn.getAttribute('data-filter');

                    jobTrays.forEach(tray => {{
                        if (filter === 'all' || tray.getAttribute('data-department') === filter) {{
                            tray.style.display = 'flex';
                        }} else {{
                            tray.style.display = 'none';
                        }}
                    }});
                }});
            }});
        }});
    </script>
</body>
</html>
'''

with open(out_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Generated careers.html at {out_path}")

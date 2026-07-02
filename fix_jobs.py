import os

base_dir = r'c:\Users\brite\Desktop\Data\Galamsey\Scripts\notifications\company-site'

# 1. Update job.html
job_path = os.path.join(base_dir, 'job.html')
with open(job_path, 'r', encoding='utf-8') as f:
    job_html = f.read()

# Fix the elements so they show up immediately rather than waiting for app.js observer
job_html = job_html.replace('class="container slide-up"', 'class="container fade-in-up"')
job_html = job_html.replace('slide-up delay-2', 'fade-in-up')
job_html = job_html.replace('slide-up delay-3', 'fade-in-up')

# Add inline animations explicitly to be safe
job_html = job_html.replace('class="job-description-block fade-in-up"', 'class="job-description-block" style="animation: fade-in-up 0.8s forwards; opacity: 1;"')
job_html = job_html.replace('class="job-apply-block fade-in-up"', 'class="job-apply-block" style="animation: fade-in-up 0.8s 0.2s forwards; opacity: 1;"')
job_html = job_html.replace('class="container fade-in-up"', 'class="container" style="animation: fade-in-up 0.8s forwards; opacity: 1;"')

with open(job_path, 'w', encoding='utf-8') as f:
    f.write(job_html)

# 2. Update careers.html
careers_path = os.path.join(base_dir, 'careers.html')
with open(careers_path, 'r', encoding='utf-8') as f:
    careers_html = f.read()

# Replace Canada terms
careers_html = careers_html.replace('Remote, Canada', 'Remote, Ghana')
careers_html = careers_html.replace('Remote, North America', 'Remote, Pan-Africa')
careers_html = careers_html.replace('Remote, Global', 'Remote, Ghana / Global')
careers_html = careers_html.replace('Remote, UK / Europe', 'Remote, SA / Europe')
careers_html = careers_html.replace('Remote, US', 'Remote, US / Ghana')
careers_html = careers_html.replace('Remote, NL', 'Remote, Accra, GH')

with open(careers_path, 'w', encoding='utf-8') as f:
    f.write(careers_html)

print('Success')

import re

html_path = r'c:\Users\brite\Desktop\Data\Galamsey\Scripts\notifications\company-site\index.html'

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Check if not already added
if 'hero-video-wrapper' not in html:
    insertion = '''</p>
                
                <div class="hero-video-wrapper slide-up delay-2">
                    <video src="https://www.pexels.com/download/video/18069701/" autoplay loop muted playsinline class="hero-video"></video>
                </div>

                <div class="hero-cta fade-in-up delay-3">'''
                
    old_cta_block = r'</p>\s*<div class="hero-cta fade-in-up delay-2">'
    html = re.sub(old_cta_block, insertion, html)

    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print('Updated index.html hero section')
else:
    print('Already present')
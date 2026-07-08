import re

def update_file(path, logo_href):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # SVG to inject
    svg_str = f'''<a href="{logo_href}" class="logo">
                <svg class="brand-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14.33 16.03">
                    <path d="M0,9.48c1.05.29,2.12.13,3.18,0,1.29-.16,2.57-.46,3.87-.57.3-.03.65-.08.94,0l-3.43,1.94c-.86.54-3.09,1.97-3.26,2.98-.16.91.61,1.35,1.45,1.22,1.17-.18,3.39-1.89,4.28-2.72.89-.83,1.82-1.84,2.2-3.02l2.43-1.2.14-.26c1.41.51,2.41,1.82,2.52,3.31.28,3.89-3.03,4.74-6.25,4.85-2.61.09-5.27-.08-7.88,0L0,15.92v-6.44Z"/>
                    <path d="M13.08,2.54c.12-.02.09,0,.12.07.05.1.13.35.16.47.38,1.43.02,3.15-1.17,4.12-.53.43-.36.14-.95.12l-2.22,1.05c-.31-.12-.51-.31-.87-.36-1.6-.21-4.45.58-6.2.73-.49.04-1,.12-1.47-.06-.08-.11.19-.45.27-.55,1.54-1.91,5.7-4.5,7.97-5.53.82-.37,2.49-1.07,3.37-.91.62.11-.42,1.28.2,1.55.54.23.73-.28.79-.7Z"/>
                    <path d="M0,.13L.18.05c2.82.16,5.9-.23,8.68.06.84.09,1.68.3,2.45.66.02.13-.06.06-.13.08C7.46,1.72,2.71,4.76.15,7.54c-.05.05-.05.11-.15.09V.13Z"/>
                    <path d="M7.85,10.02c-.47.77-1.19,1.47-1.88,2.06-.62.54-2.77,2.19-3.54,2.17s.39-1.09.56-1.24c1.37-1.21,3.25-2.11,4.85-2.99Z"/>
                </svg>
                Blvcksapphire
            </a>'''

    # Replace logo
    old_logo_tag = f'<a href="{logo_href}" class="logo">Blvcksapphire</a>'
    content = content.replace(old_logo_tag, svg_str)
    
    # Remove unwanted footer elements
    content = re.sub(r'\s*<li><a href="[^"]*">VA/VE Guide</a></li>', '', content)
    content = re.sub(r'\s*<li><a href="[^"]*">DES2026</a></li>', '', content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)


import os
base_path = r'c:\Users\brite\Desktop\Data\Galamsey\Scripts\notifications\company-site'

update_file(os.path.join(base_path, 'index.html'), '#')
update_file(os.path.join(base_path, 'solutions.html'), 'index.html')

print("Updated HTML files.")
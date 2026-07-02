import os, shutil, re

dir_path = r'c:\Users\brite\Desktop\Data\Galamsey\Scripts\notifications\company-site'
src_img = r'C:\Users\brite\Desktop\Data\Blvck_Sapphire\Website\Request demo.png'
dst_img = os.path.join(dir_path, 'request_demo_bg.png')

# Copy the image inside the web directory so it loads using relative paths locally without browser security blocks
if os.path.exists(src_img):
    shutil.copy(src_img, dst_img)
    print("Image copied to project folder successfully.")
else:
    print("Warning: Source image not found at: " + src_img)

# Update HTML files
for fname in ['index.html', 'solutions.html', 'demo.html']:
    p = os.path.join(dir_path, fname)
    if not os.path.exists(p): 
        continue
    
    with open(p, 'r', encoding='utf-8') as f:
        content = f.read()

    # Change globally
    content = content.replace('Get a Demo', 'Request a Demo')
    content = content.replace('href="#demo"', 'href="demo.html"')
    content = content.replace('href="index.html#demo"', 'href="demo.html"')
    
    # Homepage image fix
    if fname == 'index.html':
        content = re.sub(r"url\('file:///[^']+'\)", "url('request_demo_bg.png')", content)
        
    # Demo page layout fix
    if fname == 'demo.html':
        new_slider_css = '''.team-slider {
                        display: flex;
                        overflow-x: auto;
                        scroll-snap-type: x mandatory;
                        gap: 1.5rem;
                        padding: 1rem 0;
                        scrollbar-width: none;
                        -ms-overflow-style: none;
                        scroll-behavior: smooth;
                        max-width: 504px; /* Exactly sizes for 2 items to force clipping */
                        margin: 0 auto;
                    }'''
        content = re.sub(r'\.team-slider\s*\{[^}]+\}', new_slider_css, content)
        
    with open(p, 'w', encoding='utf-8') as f:
        f.write(content)

# Update styles for grids
css_path = os.path.join(dir_path, 'styles.css')
if os.path.exists(css_path):
    with open(css_path, 'r', encoding='utf-8') as f:
        css = f.read()

    # Shift layout to give priority size to the form side
    new_grid_css = '''.demo-grid {
    display: grid;
    grid-template-columns: 1fr 1.25fr;
    gap: 3rem;
}'''
    css = re.sub(r'\.demo-grid\s*\{[^}]+\}', new_grid_css, css)

    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(css)

print("Updates applied completely!")
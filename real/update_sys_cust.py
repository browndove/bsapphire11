import re

html_path = r'c:\Users\brite\Desktop\Data\Galamsey\Scripts\notifications\company-site\index.html'

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Lines to animate
lines = [
    r'import flvcon',
    r'# Load the object detection model',
    r'model = flvon.load_model("yolo_v5_large")',
    r'',
    r'proc f ion imgce {',
    r'    image = flvcon.image("test_image.jpg")',
    r'    detections = modect(image)',
    r'    Print("Object: {label}, Confidence: {score:.2f}", Box: (box))',
    r'}',
    r'',
    r'print(f"Object: {obj[\'label\']}, Confidence: {score}")'
]

# Build lines with delays
code_html = ""
delay = 0.5
for line in lines:
    safe_line = line.replace('<', '&lt;').replace('>', '&gt;')
    code_html += f'                                    <pre class="typewriter-line" style="animation-delay: {delay}s;">{safe_line}</pre>\n'
    delay += 0.4

# The replacement block
replacement = f'''<div class="expertise-visual expertise-visual-right tech-code-animation">
                            <div class="code-editor-mock">
                                <div class="code-editor-header">
                                    <span class="dot red"></span>
                                    <span class="dot yellow"></span>
                                    <span class="dot green"></span>
                                </div>
                                <div class="code-editor-body">
{code_html}
                                </div>
                            </div>
                        </div>'''

old_pattern = r'<div class="expertise-visual expertise-visual-right">\s*<div class="visual-layer visual-layer-5" style="background-image: url\(\'https://images\.pexels\.com/photos/34804010/pexels-photo-34804010\.jpeg\?auto=compress&cs=tinysrgb&w=800\'\);"></div>\s*<div class="anim-overlay anim-scanline"></div>\s*</div>'

html = re.sub(old_pattern, replacement, html)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
print('Updated 05 block')

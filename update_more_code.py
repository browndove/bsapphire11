import re
import os

html_path = r'c:\Users\brite\Desktop\Data\Galamsey\Scripts\notifications\company-site\index.html'
css_path = r'c:\Users\brite\Desktop\Data\Galamsey\Scripts\notifications\company-site\styles.css'

# 1. Update HTML
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

new_lines = '''                                    <pre class="typewriter-line"><span class="hljs-comment"># Initialize live video stream</span></pre>
                                    <pre class="typewriter-line">cap = flvcon.<span class="hljs-function">VideoCapture</span>(<span class="hljs-string">0</span>)</pre>
                                    <pre class="typewriter-line"><span class="hljs-keyword">while</span> cap.<span class="hljs-function">isOpened</span>():</pre>
                                    <pre class="typewriter-line">    ret, frame = cap.<span class="hljs-function">read</span>()</pre>
                                    <pre class="typewriter-line">    <span class="hljs-keyword">if not</span> ret:</pre>
                                    <pre class="typewriter-line">        <span class="hljs-keyword">break</span></pre>
                                    <pre class="typewriter-line"></pre>
                                    <pre class="typewriter-line">    <span class="hljs-comment"># Run real-time inference</span></pre>
                                    <pre class="typewriter-line">    results = <span class="hljs-function">model</span>(frame)</pre>
                                    <pre class="typewriter-line">    <span class="hljs-built_in">print</span>(<span class="hljs-string">f"Frame processed: {len(results)} objects detected."</span>)</pre>
                                    <pre class="typewriter-line">    </pre>
                                    <pre class="typewriter-line"><span class="hljs-built_in">print</span>(<span class="hljs-string">"Processing complete. System shutting down."</span>)</pre>'''

target = r'<pre class="typewriter-line"><span class="hljs-built_in">print</span>(<span class="hljs-string">f"Processing initialized..."</span>)</pre>'

if target in html and new_lines not in html:
    html = html.replace(target, target + '\n' + new_lines)
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print("HTML updated successfully with more code.")
else:
    print("Target not found or lines already added in HTML.")

# 2. Update CSS
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

font_css = '''
/* Increase font size for code animation */
.typewriter-line {
    font-size: 1.15rem !important;
    line-height: 1.6 !important;
}
.code-editor-body {
    padding: 1.5rem !important;
}
'''

if '1.15rem !important' not in css:
    with open(css_path, 'a', encoding='utf-8') as f:
        f.write(font_css)
    print("CSS updated successfully for larger font.")
else:
    print("Font size CSS already exists.")

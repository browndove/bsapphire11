import re

html_path = r'c:\Users\brite\Desktop\Data\Galamsey\Scripts\notifications\company-site\index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Build well-linted lines (VS Code style syntax highlighting)
lines_html = '''                                    <pre class="typewriter-line"><span class="hljs-keyword">import</span> flvcon</pre>
                                    <pre class="typewriter-line"><span class="hljs-comment"># Load the object detection model</span></pre>
                                    <pre class="typewriter-line">model = flvcon.<span class="hljs-function">load_model</span>(<span class="hljs-string">"yolo_v5_large"</span>)</pre>
                                    <pre class="typewriter-line"></pre>
                                    <pre class="typewriter-line"><span class="hljs-keyword">proc function</span> <span class="hljs-function">image_detect</span>() {</pre>
                                    <pre class="typewriter-line">    image = flvcon.<span class="hljs-function">image</span>(<span class="hljs-string">"test_image.jpg"</span>)</pre>
                                    <pre class="typewriter-line">    detections = <span class="hljs-function">modect</span>(image)</pre>
                                    <pre class="typewriter-line">    <span class="hljs-built_in">print</span>(<span class="hljs-string">"Object: "</span> + <span class="hljs-built_in">str</span>(label) + <span class="hljs-string">", Confidence: "</span> + <span class="hljs-built_in">str</span>(score))</pre>
                                    <pre class="typewriter-line">}</pre>
                                    <pre class="typewriter-line"></pre>
                                    <pre class="typewriter-line"><span class="hljs-built_in">print</span>(<span class="hljs-string">f"Processing initialized..."</span>)</pre>'''

# JS script for faster typing
js_script = '''<script>
document.addEventListener('DOMContentLoaded', () => {
    const lines = document.querySelectorAll('.tech-code-animation .typewriter-line');
    let lineIndex = 0;
    
    function resetLines() {
        lines.forEach(line => line.style.opacity = '0');
        lineIndex = 0;
        setTimeout(typeNextLine, 200);
    }
    
    function typeNextLine() {
        if (lineIndex < lines.length) {
            lines[lineIndex].style.opacity = '1';
            lineIndex++;
            setTimeout(typeNextLine, 80 + Math.random() * 50); // Much faster
        } else {
            setTimeout(resetLines, 3000); // Wait 3s before looping
        }
    }
    
    lines.forEach(line => {
        line.style.animation = 'none';
        line.style.transition = 'opacity 0.05s';
        line.style.opacity = '0';
    });
    
    resetLines();
});
</script>'''

# Use regex to find and replace everything from code-editor-body up to and including the script tag.
pattern = re.compile(r'<div class="code-editor-body">.*?</script>', re.DOTALL)

replacement = f'''<div class="code-editor-body" style="height: auto; min-height: 250px;">
{lines_html}
                                </div>
                            </div>
                        </div>
{js_script}'''

new_html = pattern.sub(replacement, html)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(new_html)

print('Updated html with linted code and fast script')

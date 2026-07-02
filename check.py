import re

html_path = r'c:\Users\brite\Desktop\Data\Galamsey\Scripts\notifications\company-site\index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

print('tech-code-animation' in html)

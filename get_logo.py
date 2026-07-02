import re
html_path = r'c:\Users\brite\Desktop\Data\Galamsey\Scripts\notifications\company-site\index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

logo_match = re.search(r'<a href="index\.html" class="logo">.*?</a>', html, re.DOTALL)
if logo_match:
    print(logo_match.group(0))
else:
    print('Logo not found')

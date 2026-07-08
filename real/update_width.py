import os

base_dir = r'c:\Users\brite\Desktop\Data\Galamsey\Scripts\notifications\company-site'

# 1. Update index.html inline style for Context 1
idx_path = os.path.join(base_dir, 'index.html')
with open(idx_path, 'r', encoding='utf-8') as f:
    idx_content = f.read()

# removing max-width: 600px;
idx_content = idx_content.replace('max-width: 600px;">Transformative', 'max-width: 100%;">Transformative')

with open(idx_path, 'w', encoding='utf-8') as f:
    f.write(idx_content)


# 2. Update styles.css for Context 2 (.hero-subtitle max-width restriction)
css_path = os.path.join(base_dir, 'styles.css')
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

# Replace the specific block restricting hero-subtitle
if 'max-width: 700px;' in css_content and '.hero-subtitle' in css_content:
    css_content = css_content.replace('max-width: 700px;', 'max-width: 100%;')

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css_content)


# 3. Update careers.html to switch Pan-Africa to Africa
car_path = os.path.join(base_dir, 'careers.html')
with open(car_path, 'r', encoding='utf-8') as f:
    car_content = f.read()

car_content = car_content.replace('Pan-Africa', 'Africa')

with open(car_path, 'w', encoding='utf-8') as f:
    f.write(car_content)

print('Updated successfully')

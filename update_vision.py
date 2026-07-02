import os
import re

html_path = r'c:\Users\brite\Desktop\Data\Galamsey\Scripts\notifications\company-site\index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

new_about = '''        <!-- About Us Section -->
        <section class="section" id="about">
            <div class="container">
                <div class="section-header slide-up">
                    <h2 class="section-title">The Blvcksapphire Vision</h2>
                </div>
                <div class="grid-2 about-grid" style="gap: 4rem;">
                    <div class="about-text slide-up delay-1">
                        <p style="font-size: 1.15rem; line-height: 1.8; color: #ccc;">At Blvcksapphire, we are architects of the future, leveraging the transformative power of Artificial Intelligence, Machine Learning, and robust Cybersecurity to solve complex challenges across diverse industries. With a strong commitment to innovation and ethical deployment, we empower businesses and communities especially across Africa and beyond to thrive in the digital age. We believe that cutting-edge technology, when applied responsibly, can drive significant positive change, foster growth, and build a more secure, intelligent, and interconnected world.</p>
                    </div>
                    <div class="about-values slide-up delay-2">
                        <ul class="values-list" style="list-style: none; padding: 0;">
                            <li style="margin-bottom: 1rem;"><strong style="color: #fff;">Innovation:</strong> <span style="color: #aaa;">Constantly exploring and integrating the latest AI/ML advancements to push boundaries.</span></li>
                            <li style="margin-bottom: 1rem;"><strong style="color: #fff;">Empowerment:</strong> <span style="color: #aaa;">Providing tools and insights that enable clients and communities to achieve more.</span></li>
                            <li style="margin-bottom: 1rem;"><strong style="color: #fff;">Security & Responsibility:</strong> <span style="color: #aaa;">Fundamental cybersecurity, deploying tech safely to protect digital infrastructure.</span></li>
                            <li style="margin-bottom: 1rem;"><strong style="color: #fff;">Positive Impact:</strong> <span style="color: #aaa;">Fostering sustainable growth and change aligned with global goals, notably in Africa.</span></li>
                            <li style="margin-bottom: 0;"><strong style="color: #fff;">Tailored Excellence:</strong> <span style="color: #aaa;">Crafting precisely customized solutions for each unique client data landscape.</span></li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>'''

pattern = re.compile(r'<!-- About Us Section -->.*?(\n        <!-- Expertise Section)', re.DOTALL)
html = pattern.sub(new_about + r'\1', html, count=1)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
print('Updated About string')

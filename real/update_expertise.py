import re

def rewrite_file(filepath, is_solutions=False):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update logo text
    # The current logo text might be formatted as `</svg>\n                Blvcksapphire` or similar.
    # We will just replace 'Blvcksapphire\n            </a>' or standard instances.
    content = re.sub(r'</svg>\s*Blvcksapphire\s*</a>', '</svg>LVCKSAPPHIRE</a>', content)

    # 2. In index.html, update the nav and section
    if not is_solutions:
        # Nav link
        content = content.replace('<a href="#technology" class="nav-link">Technology</a>', '<a href="#expertise" class="nav-link">Expertise</a>')

        # Replace the entire technology area
        old_section_pattern = r'<!-- Technology Strategy Section -->.*?</section>'
        
        new_section = '''<!-- Expertise Section -->
        <section class="section alt-bg" id="expertise">
            <div class="container">
                <div class="section-header slide-up">
                    <h2 class="section-title">Expertise</h2>
                </div>
                
                <div class="grid-3 services-grid" style="margin-bottom: 2rem;">
                    <div class="service-card slide-up delay-1">
                        <div class="card-icon">01</div>
                        <h3>Data & AI</h3>
                        <p>Rapidly transform your enterprise with accessible AI. Propel your business to achieve unprecedented levels of performance utilizing distributed foundation models and predictive automation.</p>
                    </div>
                    <div class="service-card slide-up delay-2">
                        <div class="card-icon">02</div>
                        <h3>Advanced Analytics</h3>
                        <p>Unlock the power of your streams. Turn raw data into actionable insights through predictive analytics, machine learning, and realtime Kafka data processing pipelines.</p>
                    </div>
                    <div class="service-card slide-up delay-3">
                        <div class="card-icon">03</div>
                        <h3>Cloud</h3>
                        <p>Cloud computing is integral for rapid reinvention. Meet ever-changing global demands with optimized edge capabilities and cloud inference that comprehensively maximizes system throughput.</p>
                    </div>
                    <div class="service-card slide-up delay-1">
                        <div class="card-icon">04</div>
                        <h3>Cybersecurity</h3>
                        <p>Infuse cybersecurity deeply into your core ecosystem. Protect immense enterprise value, predictively prevent automated threats, and build absolute trust as your infrastructure scales.</p>
                    </div>
                    <div class="service-card slide-up delay-2">
                        <div class="card-icon">05</div>
                        <h3>Cloud Security Services</h3>
                        <p>Rigidly protect your systems. We deploy strict identity management, high-grade encryption, and real-time security event monitoring to keep your cloud landscape definitively secure.</p>
                    </div>
                    <div class="service-card slide-up delay-3">
                        <div class="card-icon">06</div>
                        <h3>Fully Customizable</h3>
                        <p>Functionally tailored to your specific requirements. We optimize identity access, encryption, and custom models natively onto your internal frameworks ensuring absolute architectural compliance.</p>
                    </div>
                </div>
            </div>
        </section>'''
        
        content = re.sub(old_section_pattern, new_section, content, flags=re.DOTALL)

    # 3. Update title tags or headers if any still say Blvcksapphire -> Lvcksapphire? 
    # The prompt mainly mentioned the logo specifically "take out the B from the name since the logo is intended to be a B. so it will be logo and LVCKSAPPHIRE"
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

import os
base_path = r'c:\Users\brite\Desktop\Data\Galamsey\Scripts\notifications\company-site'

rewrite_file(os.path.join(base_path, 'index.html'), False)
rewrite_file(os.path.join(base_path, 'solutions.html'), True)

print("Updates completed successfully.")

import re

html_path = r'c:\Users\brite\Desktop\Data\Galamsey\Scripts\notifications\company-site\index.html'

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

new_expertise_list = '''<div class="expertise-list">
                    <!-- Item 1 (Image Right) -->
                    <div class="expertise-row slide-up">
                        <div class="expertise-content">
                            <div class="card-icon">01</div>
                            <h3>Data & AI</h3>
                            <p>Rapidly transform your enterprise with accessible AI. Propel your business to achieve unprecedented levels of performance utilizing distributed foundation models and predictive automation.</p>
                        </div>
                        <div class="expertise-visual expertise-visual-right">
                            <div class="visual-layer visual-layer-1" style="background-image: url('https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?q=80&w=996&auto=format&fit=crop');"></div>
                            <div class="anim-overlay anim-scanline"></div>
                        </div>
                    </div>

                    <!-- Item 2 (Image Left) -->
                    <div class="expertise-row reverse slide-up">
                        <div class="expertise-content">
                            <div class="card-icon">02</div>
                            <h3>Advanced Analytics</h3>
                            <p>Unlock the power of your streams. Turn raw data into actionable insights through predictive analytics, machine learning, and realtime Kafka data processing pipelines.</p>
                        </div>
                        <div class="expertise-visual expertise-visual-left">
                            <div class="visual-layer visual-layer-2" style="background-image: url('https://images.pexels.com/photos/7873553/pexels-photo-7873553.jpeg?auto=compress&cs=tinysrgb&w=800');"></div>
                            <div class="anim-overlay anim-particles"></div>
                        </div>
                    </div>

                    <!-- Item 3 (Image Right) -->
                    <div class="expertise-row slide-up">
                        <div class="expertise-content">
                            <div class="card-icon">03</div>
                            <h3>Cloud</h3>
                            <p>Cloud computing is integral for rapid reinvention. Meet ever-changing global demands with optimized edge capabilities and cloud inference that comprehensively maximizes system throughput.</p>
                        </div>
                        <div class="expertise-visual expertise-visual-right">
                            <div class="visual-layer visual-layer-3" style="background-image: url('https://images.pexels.com/photos/5203849/pexels-photo-5203849.jpeg?auto=compress&cs=tinysrgb&w=800');"></div>
                            <div class="anim-overlay anim-pulse"></div>
                        </div>
                    </div>

                    <!-- Item 4 (Image Left) -->
                    <div class="expertise-row reverse slide-up">
                        <div class="expertise-content">
                            <div class="card-icon">04</div>
                            <h3>Cybersecurity</h3>
                            <p>Infuse cybersecurity deeply into your core ecosystem. Protect immense enterprise value, predictively prevent automated threats, and build absolute trust as your infrastructure scales.</p>
                        </div>
                        <div class="expertise-visual expertise-visual-left">
                            <div class="visual-layer visual-layer-4" style="background-image: url('https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=800');"></div>
                            <div class="anim-overlay anim-glitch"></div>
                        </div>
                    </div>

                    <!-- Item 5 (Image Right) -->
                    <div class="expertise-row slide-up">
                        <div class="expertise-content">
                            <div class="card-icon">05</div>
                            <h3>System Customization</h3>
                            <p>Functionally tailored to your specific requirements. We optimize identity access, encryption, and custom models natively onto your internal frameworks ensuring absolute architectural compliance.</p>
                        </div>
                        <div class="expertise-visual expertise-visual-right">
                            <div class="visual-layer visual-layer-5" style="background-image: url('https://images.pexels.com/photos/34804010/pexels-photo-34804010.jpeg?auto=compress&cs=tinysrgb&w=800');"></div>
                            <div class="anim-overlay anim-scanline"></div>
                        </div>
                    </div>
                </div>'''

# Regex to replace the inner expertise-list container
html = re.sub(r'<div class="expertise-list">.*?(?=</div>\s*</div>\s*</section>)', new_expertise_list, html, flags=re.DOTALL)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("URLs and custom items updated")
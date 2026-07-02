import os
import re

target_dir = r"c:\Users\brite\Desktop\Data\Galamsey\Scripts\notifications\company-site"
html_path = os.path.join(target_dir, "index.html")

with open(html_path, "r", encoding="utf-8") as f:
    content = f.read()

# Update Nav
content = content.replace('<li><a href="#services" class="nav-link">Services</a></li>\n', '')
content = content.replace('<li><a href="#case-studies" class="nav-link">Case Studies</a></li>', '<li><a href="#solutions" class="nav-link">Solutions</a></li>')

# Update Hero CTA
content = content.replace('href="#services" class="btn btn-text">Explore Solutions', 'href="#solutions" class="btn btn-text">Explore Solutions')

# Replace the two sections (Services and Technology and Case Studies) with the merged ones
# We'll use split.
start_marker = "<!-- Services Section -->"
end_marker = "<!-- Insights -->"
parts = content.split(start_marker)
first_half = parts[0]
second_half = parts[1].split(end_marker)[1]

new_middle = """<!-- Technology Strategy Section -->
        <section class="section alt-bg" id="technology">
            <div class="container">
                <div class="section-header slide-up">
                    <h2 class="section-title">Technology Strategy</h2>
                </div>
                
                <div class="grid-3 services-grid" style="margin-bottom: 4rem;">
                    <div class="service-card slide-up delay-1">
                        <div class="card-icon">01</div>
                        <h3>Predictive Analytics</h3>
                        <p>Forecasting architectures that let you accurately model supply chains, financial risk, and user demand.</p>
                    </div>
                    <div class="service-card slide-up delay-2">
                        <div class="card-icon">02</div>
                        <h3>Generative Agents</h3>
                        <p>Secure, embedded LLM agents customized natively onto your internal knowledge bases to automate cognitive work.</p>
                    </div>
                    <div class="service-card slide-up delay-3">
                        <div class="card-icon">03</div>
                        <h3>Computer Vision</h3>
                        <p>Industrial grade optical inspection systems for sorting, quality assurance, and automated surveillance.</p>
                    </div>
                </div>

                <div class="tech-layout slide-up delay-1">
                    <div class="tech-pillar">
                        <h4>Edge & Cloud Compute</h4>
                        <p>Distributed inference maximizing latency reduction without sacrificing throughput.</p>
                    </div>
                    <div class="tech-pillar">
                        <h4>Foundation Models</h4>
                        <p>Leveraging and fine-tuning tier-1 model weights strictly governed for privacy.</p>
                    </div>
                    <div class="tech-pillar">
                        <h4>Real-time Processing</h4>
                        <p>Kafka & Spark pipelines operating reliably over massive, unbounded streams.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Solutions -->
        <section class="section" id="solutions">
            <div class="container">
                <div class="section-header slide-up">
                    <h2 class="section-title">Solutions</h2>
                    <p class="section-desc" style="font-size: 1.5rem; color: var(--text-color); margin-top: 0.5rem; font-weight: 300;">Powering progress across industries.</p>
                </div>
                <div class="grid-3 case-grid" style="gap: 2rem;">
                    <a href="solutions.html#healthcare" class="case-card slide-up" style="display: block; cursor: pointer;">
                        <div class="case-content">
                            <h3>Healthcare</h3>
                            <p>PAIV | HelixHealth</p>
                            <br>
                            <p style="font-size: 0.95rem; color: var(--text-muted);">End-to-end solutions for patient verification, automated claims processing, and secure clinical communication.</p>
                        </div>
                    </a>
                    <a href="solutions.html#environmental" class="case-card slide-up delay-1" style="display: block; cursor: pointer;">
                        <div class="case-content">
                            <h3>Environmental</h3>
                            <p>MineGuard | GADE</p>
                            <br>
                            <p style="font-size: 0.95rem; color: var(--text-muted);">Remote sensing and AI for monitoring resource compliance, detecting illegal activities, and continuous mapping over large terrains.</p>
                        </div>
                    </a>
                    <a href="solutions.html#security" class="case-card slide-up delay-2" style="display: block; cursor: pointer;">
                        <div class="case-content">
                            <h3>Security</h3>
                            <p>Fvlcon</p>
                            <br>
                            <p style="font-size: 0.95rem; color: var(--text-muted);">State-of-the-art computer vision systems for real-time tracking, facial recognition, and automated surveillance.</p>
                        </div>
                    </a>
                    <a href="solutions.html#public-sector" class="case-card slide-up" style="display: block; cursor: pointer;">
                        <div class="case-content">
                            <h3>Public Sector</h3>
                            <p>RentHub | Nexus Pro</p>
                            <br>
                            <p style="font-size: 0.95rem; color: var(--text-muted);">Revolutionizing housing systems and talent ecosystems with scalable digital infrastructure and AI intelligence.</p>
                        </div>
                    </a>
                    <a href="solutions.html#technology" class="case-card slide-up delay-1" style="display: block; cursor: pointer;">
                        <div class="case-content">
                            <h3>Technology</h3>
                            <p>Custom Deployments</p>
                            <br>
                            <p style="font-size: 0.95rem; color: var(--text-muted);">Bespoke AI architecture and robust foundational pipelines for high-performance enterprise deployments.</p>
                        </div>
                    </a>
                </div>
            </div>
        </section>

        <!-- Insights -->"""

with open(html_path, "w", encoding="utf-8") as f:
    f.write(first_half + new_middle + second_half)
    
print("Success")
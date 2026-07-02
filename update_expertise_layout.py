import re

html_path = r'c:\Users\brite\Desktop\Data\Galamsey\Scripts\notifications\company-site\index.html'
css_path = r'c:\Users\brite\Desktop\Data\Galamsey\Scripts\notifications\company-site\styles.css'

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

new_expertise_section = '''        <section class="section alt-bg" id="expertise">
            <div class="container">
                <div class="section-header slide-up">
                    <h2 class="section-title">Expertise</h2>
                    <p class="section-desc" style="font-size: 1.2rem; color: var(--text-muted); margin-top: 0.5rem; max-width: 600px;">Transformative capabilities built strictly for scale, privacy, and high-margin impact.</p>
                </div>
                
                <div class="expertise-list">
                    <!-- Item 1 (Image Right) -->
                    <div class="expertise-row slide-up">
                        <div class="expertise-content">
                            <div class="card-icon">01</div>
                            <h3>Data & AI</h3>
                            <p>Rapidly transform your enterprise with accessible AI. Propel your business to achieve unprecedented levels of performance utilizing distributed foundation models and predictive automation.</p>
                        </div>
                        <div class="expertise-visual expertise-visual-right">
                            <div class="visual-layer visual-layer-1" style="background-image: url('https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800');"></div>
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
                            <div class="visual-layer visual-layer-2" style="background-image: url('https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg?auto=compress&cs=tinysrgb&w=800');"></div>
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
                            <div class="visual-layer visual-layer-3" style="background-image: url('https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=800');"></div>
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
                            <div class="visual-layer visual-layer-4" style="background-image: url('https://images.pexels.com/photos/5380642/pexels-photo-5380642.jpeg?auto=compress&cs=tinysrgb&w=800');"></div>
                            <div class="anim-overlay anim-glitch"></div>
                        </div>
                    </div>

                    <!-- Item 5 (Image Right) -->
                    <div class="expertise-row slide-up">
                        <div class="expertise-content">
                            <div class="card-icon">05</div>
                            <h3>Cloud Security Services</h3>
                            <p>Rigidly protect your systems. We deploy strict identity management, high-grade encryption, and real-time security event monitoring to keep your cloud landscape definitively secure.</p>
                        </div>
                        <div class="expertise-visual expertise-visual-right">
                            <div class="visual-layer visual-layer-5" style="background-image: url('https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=800');"></div>
                            <div class="anim-overlay anim-scanline"></div>
                        </div>
                    </div>

                    <!-- Item 6 (Image Left) -->
                    <div class="expertise-row reverse slide-up">
                        <div class="expertise-content">
                            <div class="card-icon">06</div>
                            <h3>Fully Customizable</h3>
                            <p>Functionally tailored to your specific requirements. We optimize identity access, encryption, and custom models natively onto your internal frameworks ensuring absolute architectural compliance.</p>
                        </div>
                        <div class="expertise-visual expertise-visual-left">
                            <div class="visual-layer visual-layer-6" style="background-image: url('https://images.pexels.com/photos/1723812/pexels-photo-1723812.jpeg?auto=compress&cs=tinysrgb&w=800');"></div>
                            <div class="anim-overlay anim-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>'''

html = re.sub(r'<section class="section alt-bg" id="expertise">.*?</section>', new_expertise_section, html, flags=re.DOTALL)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated index.html")

new_css = '''
/* Expertise Alternating Layout */
.expertise-list {
    display: flex;
    flex-direction: column;
    gap: 8rem;
    margin-top: 4rem;
}

.expertise-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6rem;
}

.expertise-row.reverse {
    flex-direction: row-reverse;
}

.expertise-content {
    flex: 1;
    max-width: 500px;
}

.expertise-content h3 {
    font-size: 2.2rem;
    margin-bottom: 1.5rem;
}

.expertise-content p {
    font-size: 1.1rem;
    line-height: 1.8;
}

/* Abstract Animations & Visuals */
.expertise-visual {
    flex: 1;
    height: 400px;
    position: relative;
    border: 1px solid var(--border-color);
    overflow: hidden;
    background-color: #050505;
}

.expertise-visual::after {
    content: '';
    position: absolute;
    inset: 0;
    box-shadow: inset 0 0 50px rgba(0,0,0,0.8);
    pointer-events: none;
    z-index: 5;
}

.visual-layer {
    position: absolute;
    inset: -10%;
    background-size: cover;
    background-position: center;
    filter: grayscale(100%) contrast(1.2) brightness(0.8);
    transition: filter var(--transition-smooth), transform max(10s, var(--transition-smooth));
    transform: scale(1.05);
}

.expertise-row:hover .visual-layer {
    filter: grayscale(30%) contrast(1.1) brightness(1);
    transform: scale(1);
}

/* Specialized Overlays */
.anim-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 2;
    opacity: 0.4;
    mix-blend-mode: screen;
}

.anim-scanline {
    background: linear-gradient(to bottom, transparent 50%, rgba(255,255,255,0.1) 51%, transparent 100%);
    background-size: 100% 4px;
    animation: scan 8s linear infinite;
}

@keyframes scan {
    0% { background-position: 0 -100vh; }
    100% { background-position: 0 100vh; }
}

.anim-pulse {
    background: radial-gradient(circle at center, rgba(15, 82, 186, 0.3) 0%, transparent 60%);
    animation: pulse 4s ease-in-out infinite alternate;
}

@keyframes pulse {
    0% { transform: scale(0.8); opacity: 0.2; }
    100% { transform: scale(1.2); opacity: 0.6; }
}

.anim-glitch {
    background: repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px);
    animation: shift 10s steps(10) infinite;
}

@keyframes shift {
    0%, 100% { background-position: 0 0; }
    50% { background-position: 20px 0; }
}

@media (max-width: 900px) {
    .expertise-row, .expertise-row.reverse {
        flex-direction: column;
        gap: 3rem;
    }
    .expertise-visual {
        width: 100%;
        height: 300px;
    }
}
'''

with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

if '/* Expertise Alternating Layout */' not in css_content:
    css_content += '\n' + new_css
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(css_content)
    print("Updated styles.css")

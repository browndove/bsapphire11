import re
import os

base_path = r'c:\Users\brite\Desktop\Data\Galamsey\Scripts\notifications\company-site'

# 1. Update index.html
with open(os.path.join(base_path, 'index.html'), 'r', encoding='utf-8') as f:
    idx_html = f.read()
    
new_engage_section = r'''        <!-- Engage / Next Steps Block -->
        <section class="section" id="engage" style="padding: 0;">
            <!-- Demo Section (Full Width) -->
            <div class="engage-demo slide-up" style="background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('file:///C:/Users/brite/Desktop/Data/Blvck_Sapphire/Website/Request%20demo.png'); background-size: cover; background-position: center; border-bottom: 1px solid var(--border-color); padding: 180px 4%; text-align: center;">
                <div class="container" style="display: flex; flex-direction: column; align-items: center;">
                    <h2 class="engage-title" style="font-size: clamp(3rem, 6vw, 4.5rem); margin-bottom: 1rem; color: #fff;">Ready to explore our solutions?</h2>
                    <p class="engage-desc" style="font-size: 1.2rem; margin-bottom: 3rem; max-width: 600px; margin-left: auto; margin-right: auto; color: #ddd;">Schedule a custom architecture review with our systems team.</p>
                    <a href="demo.html" class="btn btn-primary btn-oval pulse-btn" style="padding: 18px 45px; font-size: 1.1rem;">Request a Demo</a>
                </div>
            </div>
            
            <!-- Careers Section (Full Width) -->
            <div class="engage-careers slide-up delay-1" id="careers" style="background-color: var(--bg-color); padding: 140px 4%; text-align: center;">
                <div class="container" style="display: flex; flex-direction: column; align-items: center;">
                    <h2 class="engage-title" style="font-size: clamp(2.5rem, 5vw, 4rem); margin-bottom: 1rem;">Join the Nexus</h2>
                    <p class="engage-desc" style="font-size: 1.2rem; margin-bottom: 3rem; max-width: 600px; margin-left: auto; margin-right: auto;">We are actively looking for complex problems and top-tier engineers. View our current openings.</p>
                    <a href="mailto:careers@blvcksapphire.com" class="btn btn-outline btn-oval" style="padding: 16px 36px;">Explore Careers</a>
                </div>
            </div>
        </section>'''

idx_html = re.sub(r'<!-- Engage / Next Steps Block -->.*?</section>', new_engage_section, idx_html, flags=re.DOTALL)
with open(os.path.join(base_path, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(idx_html)

# 2. Update demo.html
demo_path = os.path.join(base_path, 'demo.html')
if os.path.exists(demo_path):
    with open(demo_path, 'r', encoding='utf-8') as f:
        demo_html = f.read()

    new_demo_experts = r'''<h3 style="font-size: 2rem; margin-bottom: 1rem; border-top: 1px solid var(--border-color); padding-top: 2rem;">Meet the Solutions Node</h3>
                
                <style>
                    .carousel-wrapper {
                        position: relative;
                        display: flex;
                        align-items: center;
                        margin-top: 2rem;
                        width: 100%;
                    }
                    .team-slider {
                        display: flex;
                        overflow-x: auto;
                        scroll-snap-type: x mandatory;
                        gap: 1.5rem;
                        padding: 1rem 0;
                        scrollbar-width: none; /* Firefox */
                        -ms-overflow-style: none; /* IE/Edge */
                        flex-grow: 1;
                        scroll-behavior: smooth;
                    }
                    .team-slider::-webkit-scrollbar {
                        display: none; /* Chrome/Safari */
                    }
                    .team-member-h {
                        flex: 0 0 240px;
                        scroll-snap-align: start;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                        gap: 1rem;
                        padding: 2.5rem 1.5rem;
                        border: 1px solid var(--border-color);
                        background: rgba(255,255,255,0.02);
                        transition: var(--transition-snappy);
                    }
                    .team-member-h:hover {
                        border-color: var(--text-color);
                        transform: translateY(-8px);
                        background: transparent;
                        box-shadow: inset 0 0 15px rgba(255,255,255,0.05);
                    }
                    .team-slider .team-avatar {
                        width: 70px;
                        height: 70px;
                        border-radius: 50%;
                        background-color: var(--border-color);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-family: var(--font-heading);
                        color: var(--text-color);
                        font-size: 1.4rem;
                        margin: 0 auto;
                        transition: var(--transition-snappy);
                    }
                    .team-member-h:hover .team-avatar {
                        background-color: var(--text-color);
                        color: var(--bg-color);
                    }
                    .carousel-btn {
                        background: rgba(0,0,0,0.8);
                        border: 1px solid var(--border-color);
                        color: var(--text-color);
                        width: 45px;
                        height: 45px;
                        font-size: 1.2rem;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        transition: var(--transition-snappy);
                        flex-shrink: 0;
                        z-index: 10;
                    }
                    .carousel-btn:hover {
                        background: var(--text-color);
                        color: var(--bg-color);
                    }
                    .carousel-btn.prev-btn { margin-right: 15px; }
                    .carousel-btn.next-btn { margin-left: 15px; }
                    
                    @media(max-width: 600px) {
                        .carousel-btn { width: 35px; height: 35px; font-size: 1rem; }
                        .team-member-h { flex: 0 0 200px; padding: 1.5rem; }
                    }
                </style>

                <div class="carousel-wrapper">
                    <button type="button" class="carousel-btn prev-btn" onclick="document.getElementById('tslider').scrollBy({left: -260, behavior: 'smooth'})">❮</button>
                    <div class="team-slider" id="tslider">
                        <!-- Amin -->
                        <div class="team-member-h">
                            <div class="team-avatar">AY</div>
                            <div class="team-details" style="text-align: center;">
                                <h4 style="margin-bottom: 0.5rem; font-size: 1.1rem; color: var(--text-color);">Amin Yakubu</h4>
                                <p style="font-size: 0.85rem; color: #aaa;">Chief Medical Technologist</p>
                            </div>
                        </div>
                        <!-- Micheal -->
                        <div class="team-member-h">
                            <div class="team-avatar">MB</div>
                            <div class="team-details" style="text-align: center;">
                                <h4 style="margin-bottom: 0.5rem; font-size: 1.1rem; color: var(--text-color);">Micheal Owusu Budu</h4>
                                <p style="font-size: 0.85rem; color: #aaa;">AI Scientist</p>
                            </div>
                        </div>
                        <!-- Hafez -->
                        <div class="team-member-h">
                            <div class="team-avatar">HM</div>
                            <div class="team-details" style="text-align: center;">
                                <h4 style="margin-bottom: 0.5rem; font-size: 1.1rem; color: var(--text-color);">Hafez Mahamah</h4>
                                <p style="font-size: 0.85rem; color: #aaa;">Senior Technical Solution Specialist</p>
                            </div>
                        </div>
                        <!-- Mawuli -->
                        <div class="team-member-h">
                            <div class="team-avatar">MP</div>
                            <div class="team-details" style="text-align: center;">
                                <h4 style="margin-bottom: 0.5rem; font-size: 1.1rem; color: var(--text-color);">Mawuli Pomary</h4>
                                <p style="font-size: 0.85rem; color: #aaa;">Head of Emerging Technologist</p>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="carousel-btn next-btn" onclick="document.getElementById('tslider').scrollBy({left: 260, behavior: 'smooth'})">❯</button>
                </div>'''

    demo_html = re.sub(r'<h3 style="font-size: 2rem; margin-bottom: 1rem; border-top: 1px solid var\(--border-color\); padding-top: 2rem;">Meet the Solutions Node</h3>.*?</div>\s*</div>\s*<!-- Right Form Box -->', new_demo_experts + '\n            </div>\n\n            <!-- Right Form Box -->', demo_html, flags=re.DOTALL)
    
    with open(demo_path, 'w', encoding='utf-8') as f:
        f.write(demo_html)

print("Updates applied completely")
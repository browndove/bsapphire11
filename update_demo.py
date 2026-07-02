import re
import os

base_path = r'c:\Users\brite\Desktop\Data\Galamsey\Scripts\notifications\company-site'

# 1. Update index.html
with open(os.path.join(base_path, 'index.html'), 'r', encoding='utf-8') as f:
    html = f.read()

new_contact_section = r'''        <!-- Engage / Next Steps Block -->
        <section class="section" id="engage" style="padding: 0;">
            <div class="engage-container">
                <!-- Demo Half -->
                <div class="engage-half engage-demo slide-up" style="background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('file:///C:/Users/brite/Desktop/Data/Blvck_Sapphire/Website/Request%20demo.png'); border-right: 1px solid var(--border-color);">
                    <h2 class="engage-title">Ready to explore our solutions?</h2>
                    <p class="engage-desc">Schedule a custom architecture review with our systems team.</p>
                    <a href="demo.html" class="btn btn-primary btn-oval pulse-btn">Request a Demo</a>
                </div>
                
                <!-- Careers Half -->
                <div class="engage-half engage-careers slide-up delay-1" id="careers">
                    <h2 class="engage-title">Join the Nexus</h2>
                    <p class="engage-desc">We are actively looking for complex problems and top-tier engineers. View our current openings.</p>
                    <a href="mailto:careers@blvcksapphire.com" class="btn btn-outline btn-oval">Explore Careers</a>
                </div>
            </div>
        </section>'''

# Replace old contact section
html = re.sub(r'<!-- Contact & Careers Block -->.*?</section>', new_contact_section, html, flags=re.DOTALL)
with open(os.path.join(base_path, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(html)


# 2. Add new CSS for Engage Section and Demo Page
css_path = os.path.join(base_path, 'styles.css')
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

new_css = '''
/* Oval Buttons & Pulse */
.btn-oval {
    border-radius: 50px;
    padding: 16px 36px;
    font-size: 1rem;
    position: relative;
    overflow: hidden;
}

.pulse-btn {
    animation: pulseGlow 2.5s infinite;
}

@keyframes pulseGlow {
    0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
    70% { box-shadow: 0 0 0 15px rgba(255, 255, 255, 0); }
    100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
}

/* Engage Section */
.engage-container {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
}

.engage-half {
    flex: 1;
    min-width: 320px;
    padding: 140px 6%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    text-align: left;
    background-size: cover;
    background-position: center;
}

.engage-careers {
    background-color: var(--bg-color);
}

.engage-title {
    font-size: 3.5rem;
    margin-bottom: 1rem;
    line-height: 1.1;
}

.engage-desc {
    font-size: 1.2rem;
    max-width: 450px;
    margin-bottom: 3rem;
}

/* Demo Page Specifics */
.demo-page {
    padding-top: 150px;
    padding-bottom: 100px;
}

.demo-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 6rem;
}

.demo-info h1 {
    font-size: clamp(3rem, 5vw, 4.5rem);
    margin-bottom: 2rem;
}

.demo-steps {
    list-style: none;
    margin-bottom: 4rem;
}

.demo-steps li {
    font-size: 1.1rem;
    color: var(--text-muted);
    margin-bottom: 1.5rem;
    padding-left: 2rem;
    position: relative;
}

.demo-steps li::before {
    content: '→';
    position: absolute;
    left: 0;
    color: var(--text-color);
    font-family: var(--font-heading);
}

.team-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 2rem;
}

.team-member {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem;
    border: 1px solid var(--border-color);
    background: transparent;
    transition: var(--transition-snappy);
}

.team-member:hover {
    border-color: var(--text-color);
    transform: translateX(10px);
}

.team-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: var(--border-color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-heading);
    font-size: 1.2rem;
    color: var(--text-color);
}

.team-details h4 {
    font-size: 1.2rem;
    margin-bottom: 0.2rem;
}

.team-details p {
    font-size: 0.9rem;
    margin-bottom: 0.4rem;
}

.team-details .team-prev {
    font-size: 0.8rem;
    color: #666;
}

/* Demo Form Box */
.demo-form-box {
    background: #030303;
    padding: 3rem;
    border: 1px solid var(--border-color);
    position: sticky;
    top: 120px;
}

.demo-form-box h3 {
    font-size: 2rem;
    margin-bottom: 1rem;
}

.demo-form-box p.form-desc {
    margin-bottom: 2.5rem;
}

select {
    width: 100%;
    padding: 18px 0;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-color);
    font-family: var(--font-body);
    font-size: 1.1rem;
    transition: var(--transition-snappy);
}
select option {
    background: var(--bg-color);
    color: var(--text-color);
}
select:focus {
    outline: none;
    border-bottom-color: var(--text-color);
}

@media (max-width: 900px) {
    .demo-grid { grid-template-columns: 1fr; gap: 4rem; }
}
'''

if '/* Oval Buttons & Pulse */' not in css_content:
    with open(css_path, 'a', encoding='utf-8') as f:
        f.write('\n' + new_css)

# 3. Create demo.html
# Extract header and footer from index.html
header_match = re.search(r'(<!DOCTYPE html>.*?</header>)', html, flags=re.DOTALL)
footer_match = re.search(r'(<footer class="footer">.*?</html>)', html, flags=re.DOTALL)

if header_match and footer_match:
    header_html = header_match.group(1).replace('href="#', 'href="index.html#')
    
    demo_body = '''
    <main class="demo-page">
        <canvas id="bg-canvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; opacity: 0.3;"></canvas>
        <div class="container demo-grid">
            
            <!-- Left Info Panel -->
            <div class="demo-info slide-up">
                <h1>Get a custom architecture demo from an engineer.</h1>
                <p class="demo-subtitle" style="font-size:1.2rem; color:var(--text-color); margin-bottom: 1rem;">Here's how the protocol works:</p>
                <ul class="demo-steps">
                    <li>First, we will map out your exact process requirements on an intro call.</li>
                    <li>Then, we showcase a tailored run-through of how Blvcksapphire deploys in your specific environment.</li>
                    <li>Our team consists of battle-tested automation engineers — bring us your most complex technical problems.</li>
                </ul>

                <h3 style="font-size: 2rem; margin-bottom: 1rem; border-top: 1px solid var(--border-color); padding-top: 2rem;">Meet the Solutions Node</h3>
                <div class="team-list">
                    <!-- Niall -->
                    <div class="team-member">
                        <div class="team-avatar">NP</div>
                        <div class="team-details">
                            <h4>Niall Prendergast</h4>
                            <p>Senior Solutions Engineer</p>
                            <span class="team-prev">Previously: Engineering Manager at Komatsu</span>
                        </div>
                    </div>
                    <!-- Eric -->
                    <div class="team-member">
                        <div class="team-avatar">EB</div>
                        <div class="team-details">
                            <h4>Eric Burbank</h4>
                            <p>Technical Director, Enterprise Strategy</p>
                            <span class="team-prev">Previously: Product Development at iRobot</span>
                        </div>
                    </div>
                    <!-- Sam -->
                    <div class="team-member">
                        <div class="team-avatar">SE</div>
                        <div class="team-details">
                            <h4>Sam Ellis</h4>
                            <p>Solutions Engineer</p>
                            <span class="team-prev">Previously: Engineering at Raytheon and Hasbro</span>
                        </div>
                    </div>
                    <!-- Lucas -->
                    <div class="team-member">
                        <div class="team-avatar">LW</div>
                        <div class="team-details">
                            <h4>Lucas Walker</h4>
                            <p>Solutions Engineer</p>
                            <span class="team-prev">Previously: Engineering at Toyota</span>
                        </div>
                    </div>
                    <!-- Liam -->
                    <div class="team-member">
                        <div class="team-avatar">LW</div>
                        <div class="team-details">
                            <h4>Liam Waghorn</h4>
                            <p>Senior Solutions Engineer, Team Lead</p>
                            <span class="team-prev">Previously: Full Stack Architecture & Product</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Form Box -->
            <div class="demo-form-container slide-up delay-1">
                <div class="demo-form-box">
                    <h3>Book a call with an expert</h3>
                    <p class="form-desc text-muted">Once you execute this request, you'll be able to book time instantly.</p>
                    
                    <form>
                        <div class="grid-2" style="gap: 1rem;">
                            <div class="form-group" style="margin-bottom: 1.5rem;">
                                <input type="text" placeholder="First Name*" required>
                            </div>
                            <div class="form-group" style="margin-bottom: 1.5rem;">
                                <input type="text" placeholder="Last Name*" required>
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom: 2rem;">
                            <input type="email" placeholder="Business Email*" required>
                        </div>
                        <div class="form-group" style="margin-bottom: 2rem;">
                            <select required>
                                <option value="" disabled selected hidden>How did you securely route to us?</option>
                                <option value="search">Search Engine</option>
                                <option value="social">Social Network</option>
                                <option value="referral">Internal Referral</option>
                                <option value="other">Other Protocol</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: 2rem;">
                            <textarea placeholder="Anything specific you'd like to discuss during the demo?" rows="4"></textarea>
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-oval pulse-btn" style="width: 100%; border-radius: 5px;">Initiate Booking</button>
                        
                        <p style="font-size: 0.8rem; margin-top: 1.5rem; color: #555; line-height: 1.4;">
                            We store and process the telemetry in this form to respond to your request. For more information on how we securely handle data, please refer to our <a href="#" style="border-bottom: 1px solid #555;">Privacy Policy</a>.
                        </p>
                    </form>
                </div>
            </div>

        </div>
    </main>
    '''
    
    with open(os.path.join(base_path, 'demo.html'), 'w', encoding='utf-8') as f:
        f.write(header_html + demo_body + footer_match.group(1))

print("Sections updated and demo.html created successfully.")

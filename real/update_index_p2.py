import os

target_dir = r"c:\Users\brite\Desktop\Data\Galamsey\Scripts\notifications\company-site"
html_path = os.path.join(target_dir, "index.html")

with open(html_path, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "<!-- Solutions -->"
end_marker = "<!-- Insights -->"
parts = content.split(start_marker)
first_half = parts[0]
second_half = parts[1].split(end_marker)[1]

new_middle = """<!-- Solutions -->
        <section class="section" id="solutions">
            <div class="container">
                <div class="section-header slide-up">
                    <h2 class="section-title">Solutions</h2>
                    <p class="section-desc" style="font-size: 1.5rem; color: var(--text-color); margin-top: 0.5rem; font-weight: 300;">Powering progress across industries.</p>
                </div>
                
                <div class="industry-grid">
                    <!-- Healthcare -->
                    <a href="solutions.html#healthcare" class="industry-card slide-up" style="background-image: url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800');">
                        <div class="industry-overlay">
                            <h3>Healthcare</h3>
                        </div>
                    </a>
                    
                    <!-- Environmental -->
                    <a href="solutions.html#environmental" class="industry-card slide-up delay-1" style="background-image: url('https://images.unsplash.com/photo-1621644485741-2c09cb3dae98?auto=format&fit=crop&q=80&w=800');">
                        <div class="industry-overlay">
                            <h3>Environmental</h3>
                        </div>
                    </a>
                    
                    <!-- Security -->
                    <a href="solutions.html#security" class="industry-card slide-up delay-2" style="background-image: url('https://images.unsplash.com/photo-1557597774-9d273e3bfbf1?auto=format&fit=crop&q=80&w=800');">
                        <div class="industry-overlay">
                            <h3>Security</h3>
                        </div>
                    </a>
                    
                    <!-- Public Sector -->
                    <a href="solutions.html#public-sector" class="industry-card slide-up" style="background-image: url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800');">
                        <div class="industry-overlay">
                            <h3>Public Sector</h3>
                        </div>
                    </a>
                    
                    <!-- Technology -->
                    <a href="solutions.html#technology" class="industry-card slide-up delay-1" style="background-image: url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800');">
                        <div class="industry-overlay">
                            <h3>Technology</h3>
                        </div>
                    </a>
                </div>
            </div>
        </section>

        <!-- Insights -->"""

with open(html_path, "w", encoding="utf-8") as f:
    f.write(first_half + new_middle + second_half)

print("Updated index.html")
import re

path = r'c:\Users\brite\Desktop\Data\Galamsey\Scripts\notifications\company-site\solutions.html'
with open(path, 'r', encoding='utf-8') as f:
    html = f.read()

new_footer = """    <footer class="footer">
        <div class="container">
            <div class="footer-main">
                <!-- Brand Column -->
                <div class="footer-brand fade-in-up">
                    <a href="index.html" class="logo">Blvcksapphire</a>
                    <p class="footer-tagline" style="margin-top: 5px;">Products at the speed of thought.</p>
                    <div style="margin-top: 1.5rem; margin-bottom: 2rem;">
                        <a href="index.html#demo" class="btn btn-primary" style="padding: 10px 20px; font-size: 0.8rem;">Get a Demo</a>
                    </div>
                    <div class="footer-socials">
                        <a href="#" aria-label="LinkedIn">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                        </a>
                        <a href="#" aria-label="X (Twitter)">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 4.04H5.078z"/>
                            </svg>
                        </a>
                        <a href="#" aria-label="YouTube">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                        </a>
                        <a href="#" aria-label="Facebook">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                        </a>
                    </div>
                </div>

                <!-- Links Column 1: Product -->
                <div class="footer-links-col fade-in-up delay-1">
                    <h4>Product</h4>
                    <ul>
                        <li><a href="#">Product Overview</a></li>
                        <li><a href="#">Build Your AI Strategy</a></li>
                        <li><a href="#">Integrations</a></li>
                        <li><a href="#">Security</a></li>
                    </ul>
                </div>

                <!-- Links Column 2: Resources -->
                <div class="footer-links-col fade-in-up delay-2">
                    <h4>Resources</h4>
                    <ul>
                        <li><a href="#">Blog</a></li>
                        <li><a href="#">Design Review Best Practices</a></li>
                        <li><a href="#">AI Tools For Engineers</a></li>
                        <li><a href="#">VA/VE Guide</a></li>
                    </ul>
                </div>

                <!-- Links Column 3: Company -->
                <div class="footer-links-col fade-in-up delay-3">
                    <h4>Company</h4>
                    <ul>
                        <li><a href="index.html#about">About Us</a></li>
                        <li><a href="index.html#careers">Careers</a></li>
                        <li><a href="#">News</a></li>
                        <li><a href="#">DES2026</a></li>
                        <li><a href="index.html#contact">Contact Us</a></li>
                    </ul>
                </div>
            </div>

            <div class="footer-bottom">
                <div class="footer-legal">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Sale</a>
                    <a href="#">Website Terms of Use</a>
                    <a href="#">Artwork Attribution</a>
                </div>
                <p>&copy; 2026 Blvcksapphire. All rights reserved.</p>
            </div>
        </div>
    </footer>"""

updated = re.sub(r'<footer class="footer">.*?</footer\s*>', new_footer, html, flags=re.DOTALL)
with open(path, 'w', encoding='utf-8') as f:
    f.write(updated)
print('Updated solutions.html footer')
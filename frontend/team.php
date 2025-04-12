<?php
/**
 * GigGatek - Team Page
 * Showcases company leadership and team members
 */

// Set page-specific variables
$pageTitle = "Our Team";
$pageDescription = "Meet the dedicated team behind GigGatek who are passionate about making quality refurbished technology accessible to everyone.";

// Include header
include_once 'includes/header.php';
?>

<main>
    <section class="page-header">
        <div class="container">
            <h1>Our Team</h1>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="index.php">Home</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Our Team</li>
                </ol>
            </nav>
        </div>
    </section>

    <section class="team-content">
        <div class="container">
            <div class="team-intro animate-on-scroll">
                <h2>Meet the People Behind GigGatek</h2>
                <p class="lead">Our diverse team of tech enthusiasts, engineers, and customer advocates work together to deliver quality refurbished technology and exceptional service.</p>
                <p>At GigGatek, we believe our greatest asset is our people. From our skilled technicians who meticulously refurbish each device to our customer support specialists who ensure your complete satisfaction, every team member plays a vital role in our mission to make technology accessible to all.</p>
            </div>

            <div class="leadership-section animate-on-scroll">
                <h3>Leadership Team</h3>
                <div class="team-grid">
                    <div class="team-member">
                        <div class="member-image">
                            <img src="img/team/michael-chen.jpg" alt="Michael Chen - Co-Founder & CEO" class="rounded">
                        </div>
                        <div class="member-info">
                            <h4>Michael Chen</h4>
                            <p class="member-title">Co-Founder & CEO</p>
                            <p class="member-bio">With over 15 years in the tech industry, Michael leads GigGatek's strategic vision and operations. His background in computer engineering and sustainable business practices drives our commitment to quality and accessibility.</p>
                            <div class="member-social">
                                <a href="#" aria-label="LinkedIn profile"><i class="fab fa-linkedin"></i></a>
                                <a href="#" aria-label="Twitter profile"><i class="fab fa-twitter"></i></a>
                            </div>
                        </div>
                    </div>

                    <div class="team-member">
                        <div class="member-image">
                            <img src="img/team/sarah-rodriguez.jpg" alt="Sarah Rodriguez - Co-Founder & CTO" class="rounded">
                        </div>
                        <div class="member-info">
                            <h4>Sarah Rodriguez</h4>
                            <p class="member-title">Co-Founder & CTO</p>
                            <p class="member-bio">Sarah oversees all technical operations and quality control processes. Her expertise in hardware diagnostics and refurbishment techniques ensures every device meets our rigorous standards.</p>
                            <div class="member-social">
                                <a href="#" aria-label="LinkedIn profile"><i class="fab fa-linkedin"></i></a>
                                <a href="#" aria-label="GitHub profile"><i class="fab fa-github"></i></a>
                            </div>
                        </div>
                    </div>

                    <div class="team-member">
                        <div class="member-image">
                            <img src="img/team/david-patel.jpg" alt="David Patel - COO" class="rounded">
                        </div>
                        <div class="member-info">
                            <h4>David Patel</h4>
                            <p class="member-title">Chief Operations Officer</p>
                            <p class="member-bio">David manages our day-to-day operations, supply chain, and logistics. His background in operations management helps ensure we deliver quality products efficiently and sustainably.</p>
                            <div class="member-social">
                                <a href="#" aria-label="LinkedIn profile"><i class="fab fa-linkedin"></i></a>
                            </div>
                        </div>
                    </div>

                    <div class="team-member">
                        <div class="member-image">
                            <img src="img/team/jennifer-wong.jpg" alt="Jennifer Wong - CMO" class="rounded">
                        </div>
                        <div class="member-info">
                            <h4>Jennifer Wong</h4>
                            <p class="member-title">Chief Marketing Officer</p>
                            <p class="member-bio">Jennifer leads our marketing and customer experience initiatives. Her passion for sustainable technology and accessible design helps us connect with customers who share our values.</p>
                            <div class="member-social">
                                <a href="#" aria-label="LinkedIn profile"><i class="fab fa-linkedin"></i></a>
                                <a href="#" aria-label="Twitter profile"><i class="fab fa-twitter"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="departments-section animate-on-scroll">
                <h3>Our Departments</h3>
                
                <div class="department-tabs">
                    <ul class="nav nav-tabs" id="departmentTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="tech-tab" data-bs-toggle="tab" data-bs-target="#tech" type="button" role="tab" aria-controls="tech" aria-selected="true">Technical</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="customer-tab" data-bs-toggle="tab" data-bs-target="#customer" type="button" role="tab" aria-controls="customer" aria-selected="false">Customer Support</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="operations-tab" data-bs-toggle="tab" data-bs-target="#operations" type="button" role="tab" aria-controls="operations" aria-selected="false">Operations</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="marketing-tab" data-bs-toggle="tab" data-bs-target="#marketing" type="button" role="tab" aria-controls="marketing" aria-selected="false">Marketing</button>
                        </li>
                    </ul>
                    
                    <div class="tab-content" id="departmentTabsContent">
                        <div class="tab-pane fade show active" id="tech" role="tabpanel" aria-labelledby="tech-tab">
                            <div class="department-content">
                                <div class="department-image">
                                    <img src="img/team/technical-team.jpg" alt="GigGatek Technical Team" class="rounded">
                                </div>
                                <div class="department-info">
                                    <h4>Technical Team</h4>
                                    <p>Our technical team consists of skilled engineers and technicians who meticulously refurbish, test, and certify every device. With backgrounds ranging from computer engineering to electronics repair, this team ensures that each product meets our rigorous quality standards.</p>
                                    <ul class="department-highlights">
                                        <li>Hardware diagnostics and repair</li>
                                        <li>Software installation and optimization</li>
                                        <li>Quality assurance testing</li>
                                        <li>Technical documentation</li>
                                        <li>R&D for refurbishment processes</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-pane fade" id="customer" role="tabpanel" aria-labelledby="customer-tab">
                            <div class="department-content">
                                <div class="department-image">
                                    <img src="img/team/customer-support-team.jpg" alt="GigGatek Customer Support Team" class="rounded">
                                </div>
                                <div class="department-info">
                                    <h4>Customer Support Team</h4>
                                    <p>Our customer support specialists are dedicated to providing exceptional service throughout your GigGatek experience. From helping you choose the right product to addressing any concerns after purchase, this team ensures your complete satisfaction.</p>
                                    <ul class="department-highlights">
                                        <li>Pre-purchase consultation</li>
                                        <li>Technical support</li>
                                        <li>Rental program assistance</li>
                                        <li>Warranty claims processing</li>
                                        <li>Customer feedback collection</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-pane fade" id="operations" role="tabpanel" aria-labelledby="operations-tab">
                            <div class="department-content">
                                <div class="department-image">
                                    <img src="img/team/operations-team.jpg" alt="GigGatek Operations Team" class="rounded">
                                </div>
                                <div class="department-info">
                                    <h4>Operations Team</h4>
                                    <p>Our operations team manages the logistics, inventory, and facilities that keep GigGatek running smoothly. From sourcing quality used equipment to ensuring timely shipping, this team is the backbone of our daily operations.</p>
                                    <ul class="department-highlights">
                                        <li>Supply chain management</li>
                                        <li>Inventory control</li>
                                        <li>Shipping and fulfillment</li>
                                        <li>Facilities management</li>
                                        <li>Sustainability initiatives</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-pane fade" id="marketing" role="tabpanel" aria-labelledby="marketing-tab">
                            <div class="department-content">
                                <div class="department-image">
                                    <img src="img/team/marketing-team.jpg" alt="GigGatek Marketing Team" class="rounded">
                                </div>
                                <div class="department-info">
                                    <h4>Marketing Team</h4>
                                    <p>Our marketing team spreads the word about GigGatek's mission and products. Through digital campaigns, content creation, and community engagement, this team helps us connect with customers who share our values of accessibility and sustainability.</p>
                                    <ul class="department-highlights">
                                        <li>Digital marketing</li>
                                        <li>Content creation</li>
                                        <li>Social media management</li>
                                        <li>Community outreach</li>
                                        <li>Brand development</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="join-team-section animate-on-scroll">
                <h3>Join Our Team</h3>
                <p>We're always looking for passionate individuals who share our mission of making technology accessible while reducing electronic waste. If you're interested in joining our team, check out our current openings or send us your resume.</p>
                <div class="cta-buttons">
                    <a href="careers.php" class="btn btn-primary">View Open Positions</a>
                    <a href="contact.php" class="btn btn-outline">Contact Us</a>
                </div>
            </div>
        </div>
    </section>
</main>

<style>
    /* Page-specific styles */
    .team-content {
        padding: 3rem 0;
    }
    
    .team-intro {
        margin-bottom: 4rem;
        text-align: center;
    }
    
    .team-intro .lead {
        font-size: 1.25rem;
        margin: 1.5rem 0;
    }
    
    .leadership-section, .departments-section {
        margin: 4rem 0;
    }
    
    .leadership-section h3, .departments-section h3 {
        text-align: center;
        margin-bottom: 2rem;
    }
    
    .team-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 30px;
    }
    
    .team-member {
        background-color: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .team-member:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    }
    
    .member-image {
        height: 250px;
        overflow: hidden;
    }
    
    .member-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
    }
    
    .team-member:hover .member-image img {
        transform: scale(1.05);
    }
    
    .member-info {
        padding: 1.5rem;
    }
    
    .member-info h4 {
        margin-top: 0;
        margin-bottom: 0.5rem;
        color: #333;
    }
    
    .member-title {
        color: #007bff;
        font-weight: 500;
        margin-bottom: 1rem;
    }
    
    .member-bio {
        color: #555;
        margin-bottom: 1rem;
    }
    
    .member-social {
        display: flex;
        gap: 10px;
    }
    
    .member-social a {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: #f0f0f0;
        color: #555;
        transition: background-color 0.3s, color 0.3s;
    }
    
    .member-social a:hover {
        background-color: #007bff;
        color: white;
    }
    
    .department-tabs {
        margin-top: 2rem;
    }
    
    .nav-tabs {
        border-bottom: 2px solid #f0f0f0;
        margin-bottom: 2rem;
        display: flex;
        flex-wrap: wrap;
    }
    
    .nav-tabs .nav-item {
        margin-bottom: -2px;
    }
    
    .nav-tabs .nav-link {
        border: none;
        border-bottom: 2px solid transparent;
        color: #555;
        font-weight: 500;
        padding: 0.75rem 1.5rem;
        transition: color 0.3s, border-color 0.3s;
    }
    
    .nav-tabs .nav-link:hover {
        color: #007bff;
        border-color: transparent;
    }
    
    .nav-tabs .nav-link.active {
        color: #007bff;
        border-color: #007bff;
        background-color: transparent;
    }
    
    .department-content {
        display: flex;
        flex-wrap: wrap;
        gap: 30px;
        align-items: flex-start;
    }
    
    .department-image {
        flex: 1;
        min-width: 300px;
    }
    
    .department-image img {
        width: 100%;
        height: auto;
        border-radius: 8px;
    }
    
    .department-info {
        flex: 2;
        min-width: 300px;
    }
    
    .department-info h4 {
        margin-top: 0;
        color: #333;
        margin-bottom: 1rem;
    }
    
    .department-highlights {
        list-style-type: none;
        padding-left: 0;
        margin-top: 1.5rem;
    }
    
    .department-highlights li {
        padding: 0.5rem 0;
        border-bottom: 1px solid #f0f0f0;
        position: relative;
        padding-left: 1.5rem;
    }
    
    .department-highlights li:before {
        content: '\f00c';
        font-family: 'Font Awesome 5 Free';
        font-weight: 900;
        color: #007bff;
        position: absolute;
        left: 0;
    }
    
    .join-team-section {
        margin: 4rem 0;
        text-align: center;
        padding: 3rem;
        background-color: #f8f9fa;
        border-radius: 8px;
    }
    
    .cta-buttons {
        margin-top: 2rem;
    }
    
    .cta-buttons .btn {
        margin: 0.5rem;
    }
    
    @media (max-width: 768px) {
        .team-grid {
            grid-template-columns: 1fr;
        }
        
        .department-content {
            flex-direction: column;
        }
        
        .department-image, .department-info {
            width: 100%;
        }
    }
</style>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize Bootstrap tabs
        const triggerTabList = [].slice.call(document.querySelectorAll('#departmentTabs button'));
        triggerTabList.forEach(function(triggerEl) {
            const tabTrigger = new bootstrap.Tab(triggerEl);
            
            triggerEl.addEventListener('click', function(event) {
                event.preventDefault();
                tabTrigger.show();
            });
        });
    });
</script>

<?php
// Include footer
include_once 'includes/footer.php';
?>
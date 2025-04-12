<?php
/**
 * GigGatek - Our Story Page
 * Company history and mission statement
 */

// Set page-specific variables
$pageTitle = "Our Story";
$pageDescription = "Learn about GigGatek's journey, mission, and commitment to making quality refurbished technology accessible to everyone.";

// Include header
include_once 'includes/header.php';
?>

<main>
    <section class="page-header">
        <div class="container">
            <h1>Our Story</h1>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="index.php">Home</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Our Story</li>
                </ol>
            </nav>
        </div>
    </section>

    <section class="our-story-content">
        <div class="container">
            <div class="story-intro animate-on-scroll">
                <h2>From Garage to Global: The GigGatek Journey</h2>
                <div class="story-image">
                    <img src="img/about/founders.jpg" alt="GigGatek founders in their first workshop" class="rounded shadow">
                </div>
                <p class="lead">What started as a passion project in a small garage has grown into a mission to make quality technology accessible to everyone.</p>
                <p>Founded in 2018 by tech enthusiasts Michael Chen and Sarah Rodriguez, GigGatek began with a simple idea: give high-quality refurbished computer hardware a second life while making technology more affordable and sustainable.</p>
            </div>

            <div class="timeline animate-on-scroll">
                <h3>Our Journey</h3>
                <div class="timeline-container">
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-date">2018</div>
                        <div class="timeline-content">
                            <h4>The Beginning</h4>
                            <p>GigGatek is founded in a small garage in Seattle. The first month, we refurbished just 5 laptops and sold them locally.</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-date">2019</div>
                        <div class="timeline-content">
                            <h4>First Workshop</h4>
                            <p>We moved to our first official workshop and expanded our team to 5 technicians. Our monthly refurbishment capacity grew to 100 devices.</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-date">2020</div>
                        <div class="timeline-content">
                            <h4>Online Expansion</h4>
                            <p>Launched our e-commerce platform and began shipping nationwide. Introduced our first rent-to-own program to help more people access technology during challenging times.</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-date">2022</div>
                        <div class="timeline-content">
                            <h4>Certification & Growth</h4>
                            <p>Received industry certification for our refurbishment processes. Expanded to a 15,000 sq ft facility and grew our team to 25 employees.</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-date">2024</div>
                        <div class="timeline-content">
                            <h4>Today & Beyond</h4>
                            <p>Now serving customers across the country with thousands of devices refurbished monthly. Launched our sustainability initiative to reduce e-waste and give back to communities in need.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mission-vision animate-on-scroll">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mission-card">
                            <h3><i class="fas fa-bullseye"></i> Our Mission</h3>
                            <p>To make quality technology accessible to everyone while reducing electronic waste through professional refurbishment and flexible ownership options.</p>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="vision-card">
                            <h3><i class="fas fa-eye"></i> Our Vision</h3>
                            <p>A world where technology is accessible, sustainable, and empowers people from all walks of life to achieve their potential.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="values-section animate-on-scroll">
                <h3>Our Core Values</h3>
                <div class="values-grid">
                    <div class="value-card">
                        <div class="value-icon">
                            <i class="fas fa-recycle"></i>
                        </div>
                        <h4>Sustainability</h4>
                        <p>We're committed to extending the lifecycle of technology products and reducing e-waste through professional refurbishment.</p>
                    </div>
                    <div class="value-card">
                        <div class="value-icon">
                            <i class="fas fa-handshake"></i>
                        </div>
                        <h4>Accessibility</h4>
                        <p>We believe everyone deserves access to quality technology, regardless of their financial situation.</p>
                    </div>
                    <div class="value-card">
                        <div class="value-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h4>Quality</h4>
                        <p>Every device we refurbish undergoes rigorous testing and quality control to ensure reliable performance.</p>
                    </div>
                    <div class="value-card">
                        <div class="value-icon">
                            <i class="fas fa-heart"></i>
                        </div>
                        <h4>Community</h4>
                        <p>We're building a community of conscious consumers who value both technology and environmental responsibility.</p>
                    </div>
                </div>
            </div>

            <div class="impact-section animate-on-scroll">
                <h3>Our Impact</h3>
                <div class="impact-stats">
                    <div class="impact-stat">
                        <div class="stat-number" data-count="50000">0</div>
                        <div class="stat-label">Devices Refurbished</div>
                    </div>
                    <div class="impact-stat">
                        <div class="stat-number" data-count="2500">0</div>
                        <div class="stat-label">Tons of E-Waste Prevented</div>
                    </div>
                    <div class="impact-stat">
                        <div class="stat-number" data-count="15000">0</div>
                        <div class="stat-label">Customers Served</div>
                    </div>
                    <div class="impact-stat">
                        <div class="stat-number" data-count="1000">0</div>
                        <div class="stat-label">Devices Donated</div>
                    </div>
                </div>
            </div>

            <div class="cta-section animate-on-scroll">
                <h3>Join Our Journey</h3>
                <p>We're just getting started, and we'd love for you to be part of our story. Whether you're looking for quality refurbished technology, want to join our team, or are interested in our sustainability initiatives, we welcome you to the GigGatek community.</p>
                <div class="cta-buttons">
                    <a href="products.php" class="btn btn-primary">Shop Our Products</a>
                    <a href="careers.php" class="btn btn-secondary">Join Our Team</a>
                    <a href="contact.php" class="btn btn-outline">Contact Us</a>
                </div>
            </div>
        </div>
    </section>
</main>

<style>
    /* Page-specific styles */
    .our-story-content {
        padding: 3rem 0;
    }
    
    .story-intro {
        margin-bottom: 4rem;
        text-align: center;
    }
    
    .story-intro .lead {
        font-size: 1.25rem;
        margin: 1.5rem 0;
    }
    
    .story-image {
        margin: 2rem 0;
        text-align: center;
    }
    
    .story-image img {
        max-width: 100%;
        height: auto;
        max-height: 400px;
    }
    
    .timeline {
        margin: 4rem 0;
    }
    
    .timeline h3 {
        text-align: center;
        margin-bottom: 2rem;
    }
    
    .timeline-container {
        position: relative;
        max-width: 800px;
        margin: 0 auto;
    }
    
    .timeline-container::after {
        content: '';
        position: absolute;
        width: 4px;
        background-color: #f0f0f0;
        top: 0;
        bottom: 0;
        left: 50%;
        margin-left: -2px;
    }
    
    .timeline-item {
        padding: 10px 40px;
        position: relative;
        width: 50%;
        box-sizing: border-box;
    }
    
    .timeline-item:nth-child(odd) {
        left: 0;
    }
    
    .timeline-item:nth-child(even) {
        left: 50%;
    }
    
    .timeline-dot {
        position: absolute;
        width: 20px;
        height: 20px;
        right: -10px;
        background-color: #007bff;
        border-radius: 50%;
        top: 15px;
        z-index: 1;
    }
    
    .timeline-item:nth-child(even) .timeline-dot {
        left: -10px;
    }
    
    .timeline-date {
        position: absolute;
        right: -100px;
        top: 12px;
        font-weight: bold;
        color: #007bff;
    }
    
    .timeline-item:nth-child(even) .timeline-date {
        left: -100px;
        right: auto;
    }
    
    .timeline-content {
        padding: 20px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    
    .timeline-content h4 {
        margin-top: 0;
        color: #333;
    }
    
    .mission-vision {
        margin: 4rem 0;
    }
    
    .mission-card, .vision-card {
        padding: 2rem;
        border-radius: 8px;
        height: 100%;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .mission-card:hover, .vision-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    }
    
    .mission-card {
        background-color: #f8f9fa;
    }
    
    .vision-card {
        background-color: #e9f7fe;
    }
    
    .mission-card h3, .vision-card h3 {
        margin-top: 0;
        color: #333;
    }
    
    .mission-card i, .vision-card i {
        margin-right: 10px;
        color: #007bff;
    }
    
    .values-section {
        margin: 4rem 0;
    }
    
    .values-section h3 {
        text-align: center;
        margin-bottom: 2rem;
    }
    
    .values-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 30px;
    }
    
    .value-card {
        padding: 2rem;
        border-radius: 8px;
        background-color: white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        text-align: center;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .value-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    }
    
    .value-icon {
        font-size: 2.5rem;
        color: #007bff;
        margin-bottom: 1rem;
    }
    
    .value-card h4 {
        margin-top: 0;
        color: #333;
    }
    
    .impact-section {
        margin: 4rem 0;
        text-align: center;
    }
    
    .impact-section h3 {
        margin-bottom: 2rem;
    }
    
    .impact-stats {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
    }
    
    .impact-stat {
        padding: 1.5rem;
        margin: 1rem;
        min-width: 200px;
    }
    
    .stat-number {
        font-size: 3rem;
        font-weight: bold;
        color: #007bff;
        margin-bottom: 0.5rem;
    }
    
    .stat-label {
        font-size: 1.1rem;
        color: #555;
    }
    
    .cta-section {
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
        .timeline-container::after {
            left: 31px;
        }
        
        .timeline-item {
            width: 100%;
            padding-left: 70px;
            padding-right: 25px;
        }
        
        .timeline-item:nth-child(even) {
            left: 0;
        }
        
        .timeline-dot {
            left: 21px;
            right: auto;
        }
        
        .timeline-item:nth-child(even) .timeline-dot {
            left: 21px;
        }
        
        .timeline-date {
            position: relative;
            right: auto;
            left: auto;
            top: auto;
            display: block;
            margin-bottom: 10px;
        }
        
        .timeline-item:nth-child(even) .timeline-date {
            left: auto;
        }
        
        .values-grid {
            grid-template-columns: 1fr;
        }
        
        .impact-stat {
            width: 100%;
        }
    }
</style>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Animate stats counting
        const stats = document.querySelectorAll('.stat-number');
        
        const animateStats = () => {
            stats.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-count'));
                const count = +stat.innerText;
                const speed = target / 100; // Adjust for faster/slower animation
                
                if(count < target) {
                    stat.innerText = Math.ceil(count + speed);
                    setTimeout(animateStats, 20);
                } else {
                    stat.innerText = target.toLocaleString();
                }
            });
        };
        
        // Start animation when section is in viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStats();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        const impactSection = document.querySelector('.impact-section');
        if (impactSection) {
            observer.observe(impactSection);
        }
    });
</script>

<?php
// Include footer
include_once 'includes/footer.php';
?>
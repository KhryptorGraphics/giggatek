<?php
/**
 * GigGatek Rent-to-Own Program Page
 * 
 * This page displays information about the rent-to-own program,
 * showcases featured products available for rental, and provides
 * an interactive calculator for users to explore payment options.
 */

// Start session for user tracking
session_start();

// Include common functions and header
include_once('includes/config.php');
include_once('includes/functions.php');
$pageTitle = "Rent-to-Own Program | GigGatek";
$metaDescription = "GigGatek's flexible rent-to-own program for refurbished computer hardware. Choose from GPUs, CPUs, and complete systems with affordable monthly payments.";
include_once('includes/header.php');
?>

<main class="rent-to-own-page">
    <!-- Hero banner -->
    <section class="hero-banner">
        <div class="container">
            <div class="hero-content">
                <h1>Rent-to-Own Program</h1>
                <p class="hero-subtitle">Flexible options for refurbished hardware</p>
                <p class="hero-description">
                    Get the hardware you need today with affordable monthly payments. 
                    Choose your terms, build your credit, and own your equipment.
                </p>
                <a href="#calculator" class="btn btn-primary btn-lg">Calculate Your Rate</a>
                <a href="#featured-products" class="btn btn-outline btn-lg">Browse Products</a>
            </div>
        </div>
    </section>
    
    <!-- Program benefits -->
    <section class="benefits-section">
        <div class="container">
            <h2 class="section-title">Program Benefits</h2>
            
            <div class="benefits-grid">
                <div class="benefit-card">
                    <div class="benefit-icon">
                        <i class="fas fa-wallet"></i>
                    </div>
                    <h3>Affordable Monthly Payments</h3>
                    <p>Low monthly rates that fit your budget with no large upfront costs.</p>
                </div>
                
                <div class="benefit-card">
                    <div class="benefit-icon">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                    <h3>Flexible Rental Terms</h3>
                    <p>Choose from 3, 6, or 12-month rental periods to suit your needs.</p>
                </div>
                
                <div class="benefit-card">
                    <div class="benefit-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3>Quality Hardware</h3>
                    <p>All products are professionally refurbished and thoroughly tested.</p>
                </div>
                
                <div class="benefit-card">
                    <div class="benefit-icon">
                        <i class="fas fa-tags"></i>
                    </div>
                    <h3>Early Buyout Options</h3>
                    <p>Flexibility to purchase your hardware at any time during your rental period.</p>
                </div>
            </div>
        </div>
    </section>
    
    <!-- How it works -->
    <section class="how-it-works">
        <div class="container">
            <h2 class="section-title">How It Works</h2>
            
            <div class="process-steps">
                <div class="process-step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h3>Browse & Select</h3>
                        <p>Browse our inventory of refurbished hardware and select the product you need.</p>
                    </div>
                </div>
                
                <div class="process-step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h3>Choose Your Terms</h3>
                        <p>Select your preferred rental period and review your monthly payment amount.</p>
                    </div>
                </div>
                
                <div class="process-step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h3>Complete Application</h3>
                        <p>Fill out our simple application form and get approved in minutes.</p>
                    </div>
                </div>
                
                <div class="process-step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <h3>Receive Your Hardware</h3>
                        <p>We'll ship your hardware directly to your door, ready for immediate use.</p>
                    </div>
                </div>
                
                <div class="process-step">
                    <div class="step-number">5</div>
                    <div class="step-content">
                        <h3>Make Monthly Payments</h3>
                        <p>Pay your affordable monthly rate and build toward ownership.</p>
                    </div>
                </div>
                
                <div class="process-step">
                    <div class="step-number">6</div>
                    <div class="step-content">
                        <h3>Own Your Hardware</h3>
                        <p>Complete your payment schedule and the hardware is 100% yours.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Payment calculator -->
    <section id="calculator" class="payment-calculator">
        <div class="container">
            <h2 class="section-title">Payment Calculator</h2>
            
            <div class="calculator-container">
                <div class="calculator-product-selection">
                    <label for="product-select">Select a Product:</label>
                    <select id="product-select" class="form-control">
                        <option value="">-- Select a product --</option>
                        <?php
                        // Get featured products for the dropdown
                        $featuredProducts = []; // This would normally be pulled from the database
                        
                        // For development, we'll use some placeholder products
                        $featuredProducts = [
                            ['product_id' => 1, 'name' => 'Refurbished GPU Model X', 'purchase_price' => 399.99],
                            ['product_id' => 2, 'name' => 'Refurbished CPU Model Y', 'purchase_price' => 249.99],
                            ['product_id' => 3, 'name' => 'Refurbished System Z', 'purchase_price' => 899.99],
                        ];
                        
                        foreach ($featuredProducts as $product) {
                            echo '<option value="' . $product['product_id'] . '" data-price="' . $product['purchase_price'] . '">' . 
                                 $product['name'] . ' ($' . number_format($product['purchase_price'], 2) . ')</option>';
                        }
                        ?>
                    </select>
                    
                    <div class="product-details" id="product-details">
                        <div class="product-image-container">
                            <img id="product-image" src="assets/placeholder-product.jpg" alt="Product Image">
                            <span id="condition-rating" class="condition-badge">Good</span>
                        </div>
                        <div class="product-info">
                            <h3 id="product-name">Select a product above</h3>
                            <p id="product-description">Product description will appear here.</p>
                            <div id="product-specifications"></div>
                        </div>
                    </div>
                </div>
                
                <div class="calculator-controls">
                    <div class="term-selection">
                        <h3>Rental Term</h3>
                        <div class="term-options">
                            <div class="term-option" data-term="3">
                                <span class="term-value">3</span>
                                <span class="term-unit">months</span>
                            </div>
                            <div class="term-option" data-term="6">
                                <span class="term-value">6</span>
                                <span class="term-unit">months</span>
                            </div>
                            <div class="term-option active" data-term="12">
                                <span class="term-value">12</span>
                                <span class="term-unit">months</span>
                            </div>
                        </div>
                        
                        <div class="term-slider-container">
                            <label for="term-slider">Or select a custom term: <span id="selected-term">12</span> months</label>
                            <div id="term-slider" class="slider"></div>
                        </div>
                    </div>
                    
                    <div class="calculation-results">
                        <div class="result-box">
                            <div class="result-label">Monthly Payment</div>
                            <div class="result-value" id="monthly-payment">$0.00</div>
                        </div>
                        
                        <div class="result-box">
                            <div class="result-label">Purchase Price</div>
                            <div class="result-value" id="purchase-price">$0.00</div>
                        </div>
                        
                        <div class="result-box">
                            <div class="result-label">Total Cost</div>
                            <div class="result-value" id="total-cost">$0.00</div>
                        </div>
                        
                        <div class="result-box">
                            <div class="result-label">Rental Premium</div>
                            <div class="result-value" id="rental-premium">0%</div>
                        </div>
                    </div>
                </div>
                
                <div class="calculator-details">
                    <h3>Buyout Options</h3>
                    <p>You can buy your rented hardware at any time by paying the remaining amount due.</p>
                    
                    <div class="buyout-options">
                        <div class="buyout-option">
                            <h4>After 3 Months</h4>
                            <div class="buyout-price" id="buyout-3months">$0.00</div>
                        </div>
                        
                        <div class="buyout-option">
                            <h4>After 6 Months</h4>
                            <div class="buyout-price" id="buyout-6months">$0.00</div>
                        </div>
                        
                        <div class="buyout-option">
                            <h4>After 9 Months</h4>
                            <div class="buyout-price" id="buyout-9months">$0.00</div>
                        </div>
                    </div>
                    
                    <div id="comparison-chart" class="comparison-chart">
                        <div class="chart-placeholder">
                            <p>Select a product to view cost comparison chart</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Featured products -->
    <section id="featured-products" class="featured-products">
        <div class="container">
            <h2 class="section-title">Featured Products for Rent-to-Own</h2>
            
            <div class="product-grid">
                <?php
                // This would normally be pulled from the database
                // For now, we'll use the same placeholder products
                
                foreach ($featuredProducts as $product) {
                    $monthlyRate = number_format($product['purchase_price'] / 24, 2);
                    
                    echo '
                    <div class="product-card">
                        <div class="product-image">
                            <img src="assets/placeholder-product.jpg" alt="' . $product['name'] . '">
                            <span class="condition-badge good">Good</span>
                        </div>
                        <div class="product-details">
                            <h3 class="product-title">' . $product['name'] . '</h3>
                            <div class="product-pricing">
                                <div class="rent-price">$' . $monthlyRate . '/month</div>
                                <div class="buy-price">$' . number_format($product['purchase_price'], 2) . ' outright</div>
                            </div>
                            <div class="product-actions">
                                <a href="product.php?id=' . $product['product_id'] . '" class="btn btn-outline">Details</a>
                                <a href="cart.php?action=add&product_id=' . $product['product_id'] . '&type=rental" class="btn btn-primary">Rent Now</a>
                            </div>
                        </div>
                    </div>
                    ';
                }
                ?>
            </div>
            
            <div class="view-all-products">
                <a href="products.php?category=all&rental=true" class="btn btn-lg btn-secondary">
                    View All Rental Products
                </a>
            </div>
        </div>
    </section>
    
    <!-- FAQ section -->
    <section class="faq-section">
        <div class="container">
            <h2 class="section-title">Frequently Asked Questions</h2>
            
            <div class="faq-container">
                <div class="faq-item">
                    <div class="faq-question">
                        <span>Do I need to pass a credit check to qualify?</span>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="faq-answer">
                        <p>While we do perform a basic credit check, our approval process considers multiple factors beyond just your credit score. Many customers with limited or less-than-perfect credit can still qualify for our rent-to-own program.</p>
                    </div>
                </div>
                
                <div class="faq-item">
                    <div class="faq-question">
                        <span>What happens if I miss a payment?</span>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="faq-answer">
                        <p>We understand that financial situations can change. If you miss a payment, please contact our customer service team as soon as possible. We offer a grace period and can work with you to adjust your payment schedule if needed. Continued missed payments without communication may result in recovery of the hardware.</p>
                    </div>
                </div>
                
                <div class="faq-item">
                    <div class="faq-question">
                        <span>Can I upgrade my hardware during my rental period?</span>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="faq-answer">
                        <p>Yes! Our upgrade program allows you to apply a portion of your rental payments toward a newer model. Contact our customer service team to learn about current upgrade offers for your specific hardware.</p>
                    </div>
                </div>
                
                <div class="faq-item">
                    <div class="faq-question">
                        <span>What warranty is included with rent-to-own products?</span>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="faq-answer">
                        <p>All of our rent-to-own products include a warranty for the duration of your rental period. This covers hardware failures and defects (not including accidental damage). Once you've completed your payments and own the hardware, a standard 90-day ownership warranty applies.</p>
                    </div>
                </div>
                
                <div class="faq-item">
                    <div class="faq-question">
                        <span>Can I return the hardware if I no longer need it?</span>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="faq-answer">
                        <p>Yes, you can return the hardware at any time during your rental period, though early termination fees may apply depending on your contract terms. Please contact our customer service team to arrange a return.</p>
                    </div>
                </div>
                
                <div class="faq-item">
                    <div class="faq-question">
                        <span>Do you ship internationally for rent-to-own orders?</span>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="faq-answer">
                        <p>Currently, our rent-to-own program is only available to customers within the United States. We hope to expand to international markets in the future.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Call to action -->
    <section class="cta-section">
        <div class="container">
            <div class="cta-content">
                <h2>Ready to get started?</h2>
                <p>Browse our collection of refurbished computer hardware and find the perfect equipment for your needs.</p>
                <div class="cta-buttons">
                    <a href="products.php?rental=true" class="btn btn-primary btn-lg">Browse Rental Products</a>
                    <a href="contact.php" class="btn btn-outline btn-lg">Contact Us</a>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Testimonials -->
    <section class="testimonials-section">
        <div class="container">
            <h2 class="section-title">What Our Customers Say</h2>
            
            <div class="testimonials-slider">
                <div class="testimonial">
                    <div class="testimonial-content">
                        <p>"The rent-to-own program at GigGatek allowed me to get a high-end GPU that I couldn't afford upfront. The monthly payments were easy to manage, and the hardware was in excellent condition!"</p>
                    </div>
                    <div class="testimonial-author">
                        <div class="author-image">
                            <img src="assets/testimonial-1.jpg" alt="Customer Photo">
                        </div>
                        <div class="author-info">
                            <h4>Michael T.</h4>
                            <p>Game Developer</p>
                        </div>
                    </div>
                </div>
                
                <div class="testimonial">
                    <div class="testimonial-content">
                        <p>"I was skeptical about refurbished hardware, but GigGatek's products are like new. Their rent-to-own program helped me equip my entire home office with quality hardware on a budget."</p>
                    </div>
                    <div class="testimonial-author">
                        <div class="author-image">
                            <img src="assets/testimonial-2.jpg" alt="Customer Photo">
                        </div>
                        <div class="author-info">
                            <h4>Sarah K.</h4>
                            <p>Freelance Designer</p>
                        </div>
                    </div>
                </div>
                
                <div class="testimonial">
                    <div class="testimonial-content">
                        <p>"When my computer died right before finals, I couldn't afford a new one. GigGatek's rent-to-own program was a lifesaver! Great hardware, affordable payments, and now I own it outright."</p>
                    </div>
                    <div class="testimonial-author">
                        <div class="author-image">
                            <img src="assets/testimonial-3.jpg" alt="Customer Photo">
                        </div>
                        <div class="author-info">
                            <h4>Jason M.</h4>
                            <p>Computer Science Student</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</main>

<!-- Initialize FAQ toggles -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', function() {
            const isOpen = item.classList.contains('active');
            
            // Close all FAQs
            faqItems.forEach(faq => {
                faq.classList.remove('active');
                faq.querySelector('.faq-answer').style.maxHeight = null;
            });
            
            // Open this FAQ if it wasn't already open
            if (!isOpen) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
});
</script>

<!-- Include the rent-to-own calculator script -->
<script src="js/rent-to-own.js"></script>

<?php include_once('includes/footer.php'); ?>

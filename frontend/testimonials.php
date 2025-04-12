<?php
/**
 * GigGatek - Testimonials Page
 * Customer testimonials and reviews with submission form for authenticated users
 */

// Set page-specific variables
$pageTitle = "Customer Testimonials";
$pageDescription = "Read what our customers have to say about their experience with GigGatek's refurbished technology and rent-to-own program.";

// Include header
include_once 'includes/header.php';

// Check if user is logged in (for testimonial submission)
$isLoggedIn = isset($_SESSION['user_id']);
$userId = $isLoggedIn ? $_SESSION['user_id'] : null;
$username = $isLoggedIn ? $_SESSION['username'] : null;

// Get testimonial category from URL if filtering
$category = isset($_GET['category']) ? $_GET['category'] : null;

// Function to get star rating HTML
function getStarRating($rating) {
    $fullStars = floor($rating);
    $halfStar = ($rating - $fullStars) >= 0.5;
    $emptyStars = 5 - $fullStars - ($halfStar ? 1 : 0);
    
    $html = '<div class="star-rating">';
    
    // Full stars
    for ($i = 0; $i < $fullStars; $i++) {
        $html .= '<i class="fas fa-star"></i>';
    }
    
    // Half star
    if ($halfStar) {
        $html .= '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Empty stars
    for ($i = 0; $i < $emptyStars; $i++) {
        $html .= '<i class="far fa-star"></i>';
    }
    
    $html .= '<span class="rating-text">' . $rating . ' out of 5</span>';
    $html .= '</div>';
    
    return $html;
}
?>

<main>
    <section class="page-header">
        <div class="container">
            <h1>Customer Testimonials</h1>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="index.php">Home</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Testimonials</li>
                </ol>
            </nav>
        </div>
    </section>

    <section class="testimonials-content">
        <div class="container">
            <div class="testimonials-intro animate-on-scroll">
                <h2>What Our Customers Say</h2>
                <p class="lead">Don't just take our word for it. Here's what our customers have to say about their experience with GigGatek's refurbished technology and rent-to-own program.</p>
                
                <?php if ($isLoggedIn): ?>
                    <div class="cta-button">
                        <a href="#submit-testimonial" class="btn btn-primary">Share Your Experience</a>
                    </div>
                <?php else: ?>
                    <div class="cta-button">
                        <a href="login.php?redirect=testimonials.php#submit-testimonial" class="btn btn-primary">Log In to Share Your Experience</a>
                    </div>
                <?php endif; ?>
            </div>
            
            <div class="testimonials-filters animate-on-scroll">
                <div class="filter-categories">
                    <span>Filter by:</span>
                    <a href="testimonials.php" class="<?php echo !$category ? 'active' : ''; ?>">All</a>
                    <a href="testimonials.php?category=laptops" class="<?php echo $category === 'laptops' ? 'active' : ''; ?>">Laptops</a>
                    <a href="testimonials.php?category=desktops" class="<?php echo $category === 'desktops' ? 'active' : ''; ?>">Desktops</a>
                    <a href="testimonials.php?category=smartphones" class="<?php echo $category === 'smartphones' ? 'active' : ''; ?>">Smartphones</a>
                    <a href="testimonials.php?category=rent-to-own" class="<?php echo $category === 'rent-to-own' ? 'active' : ''; ?>">Rent-to-Own</a>
                </div>
                <div class="filter-sort">
                    <label for="sort-testimonials">Sort by:</label>
                    <select id="sort-testimonials" class="form-select">
                        <option value="newest">Newest First</option>
                        <option value="highest">Highest Rated</option>
                        <option value="lowest">Lowest Rated</option>
                    </select>
                </div>
            </div>
            
            <div class="featured-testimonial animate-on-scroll">
                <?php
                // In a real application, this would fetch from the database
                // For now, we'll use a static example
                $featuredTestimonial = [
                    'id' => 1,
                    'user_id' => 101,
                    'username' => 'Emily Johnson',
                    'avatar' => 'img/testimonials/emily-johnson.jpg',
                    'rating' => 5,
                    'title' => 'Life-Changing Rent-to-Own Program',
                    'content' => 'As a graduate student on a tight budget, I needed a reliable laptop but couldn\'t afford to pay the full price upfront. GigGatek\'s rent-to-own program was exactly what I needed. The refurbished MacBook Pro I received was in pristine condition—it looked and performed like new! The monthly payments were manageable, and the process was transparent with no hidden fees. The laptop has been essential for my research and coursework, and I\'m now just two payments away from owning it outright. I\'ve already recommended GigGatek to several of my classmates who were in similar situations.',
                    'date' => '2025-03-28',
                    'category' => 'rent-to-own',
                    'product' => 'MacBook Pro (2022)',
                    'verified' => true
                ];
                ?>
                
                <div class="testimonial-card featured">
                    <div class="testimonial-header">
                        <div class="user-info">
                            <img src="<?php echo $featuredTestimonial['avatar']; ?>" alt="<?php echo $featuredTestimonial['username']; ?>" class="user-avatar">
                            <div class="user-details">
                                <h3 class="user-name"><?php echo $featuredTestimonial['username']; ?></h3>
                                <?php if ($featuredTestimonial['verified']): ?>
                                    <span class="verified-badge"><i class="fas fa-check-circle"></i> Verified Customer</span>
                                <?php endif; ?>
                            </div>
                        </div>
                        <div class="testimonial-meta">
                            <span class="testimonial-date"><?php echo date('F j, Y', strtotime($featuredTestimonial['date'])); ?></span>
                            <span class="testimonial-product"><?php echo $featuredTestimonial['product']; ?></span>
                            <span class="testimonial-category"><?php echo ucfirst($featuredTestimonial['category']); ?></span>
                        </div>
                    </div>
                    
                    <div class="testimonial-content">
                        <h4 class="testimonial-title"><?php echo $featuredTestimonial['title']; ?></h4>
                        <?php echo getStarRating($featuredTestimonial['rating']); ?>
                        <p class="testimonial-text"><?php echo $featuredTestimonial['content']; ?></p>
                    </div>
                    
                    <div class="featured-badge">
                        <i class="fas fa-award"></i> Featured Testimonial
                    </div>
                </div>
            </div>
            
            <div class="testimonials-grid animate-on-scroll">
                <?php
                // In a real application, this would fetch from the database
                // For now, we'll use static examples
                $testimonials = [
                    [
                        'id' => 2,
                        'user_id' => 102,
                        'username' => 'Marcus Chen',
                        'avatar' => 'img/testimonials/marcus-chen.jpg',
                        'rating' => 4.5,
                        'title' => 'Great Value for Small Business Needs',
                        'content' => 'As a small business owner, I needed to equip my team with reliable computers without breaking the bank. GigGatek\'s refurbished desktops were the perfect solution. The machines arrived well-packaged, looked almost new, and have been running flawlessly for our daily operations. The 1-year warranty gave me peace of mind, and their customer service was responsive when I had questions about upgrading RAM on one of the units. Highly recommend for other small businesses looking to optimize their IT budget.',
                        'date' => '2025-03-15',
                        'category' => 'desktops',
                        'product' => 'Dell OptiPlex (2023)',
                        'verified' => true
                    ],
                    [
                        'id' => 3,
                        'user_id' => 103,
                        'username' => 'Sophia Rodriguez',
                        'avatar' => 'img/testimonials/sophia-rodriguez.jpg',
                        'rating' => 5,
                        'title' => 'Smartphone Like New at Half the Price',
                        'content' => 'I was skeptical about buying a refurbished smartphone, but GigGatek exceeded my expectations. The iPhone 13 Pro I purchased was in immaculate condition—no scratches, perfect battery health, and all features working flawlessly. It came with all original accessories and even a screen protector already applied. The best part? I saved over $400 compared to buying new. The detailed grading system on their website made it easy to know exactly what condition to expect. This won\'t be my last purchase from GigGatek!',
                        'date' => '2025-03-10',
                        'category' => 'smartphones',
                        'product' => 'iPhone 13 Pro',
                        'verified' => true
                    ],
                    [
                        'id' => 4,
                        'user_id' => 104,
                        'username' => 'James Wilson',
                        'avatar' => 'img/testimonials/james-wilson.jpg',
                        'rating' => 4,
                        'title' => 'Solid Gaming Laptop, Minor Cosmetic Issues',
                        'content' => 'I purchased a refurbished gaming laptop (Certified Grade B) for college and gaming. Performance-wise, it\'s excellent—handles all my engineering software and games without issues. The only reason for 4 stars instead of 5 is that there were a few more cosmetic scratches on the lid than I expected from the description. Nothing major, and certainly not worth paying hundreds more for a new one. Battery life is great, and the 90-day warranty was recently extended after I reported a minor issue with the charging port. Overall, very satisfied with the value.',
                        'date' => '2025-02-28',
                        'category' => 'laptops',
                        'product' => 'ASUS ROG Strix',
                        'verified' => true
                    ],
                    [
                        'id' => 5,
                        'user_id' => 105,
                        'username' => 'Aisha Patel',
                        'avatar' => 'img/testimonials/aisha-patel.jpg',
                        'rating' => 5,
                        'title' => 'Perfect for Remote Work Setup',
                        'content' => 'When my company went remote, I needed to upgrade my home office setup quickly. GigGatek\'s refurbished ultrawide monitor and docking station were exactly what I needed. The monitor arrived in perfect condition, and the colors are vibrant and accurate—important for my design work. The whole process from ordering to delivery was smooth, and their customer service team was helpful in recommending compatible accessories. I\'ve since purchased a refurbished mechanical keyboard as well. Great quality products at reasonable prices!',
                        'date' => '2025-02-15',
                        'category' => 'accessories',
                        'product' => 'Dell UltraSharp 34" Monitor',
                        'verified' => true
                    ],
                    [
                        'id' => 6,
                        'user_id' => 106,
                        'username' => 'Robert Kim',
                        'avatar' => 'img/testimonials/robert-kim.jpg',
                        'rating' => 4.5,
                        'title' => 'Rent-to-Own Made Technology Accessible',
                        'content' => 'After losing my job, I couldn\'t afford to replace my broken laptop, which I desperately needed for job hunting. GigGatek\'s rent-to-own program was a lifesaver. The application process was straightforward, and I was approved quickly despite my temporary financial situation. The refurbished ThinkPad I received has been reliable throughout my job search and now in my new position. The flexible payment options helped me manage my budget during a difficult time, and the transparent terms meant no surprises. I\'ve now paid it off completely and own a great laptop that helped me get back on my feet.',
                        'date' => '2025-02-10',
                        'category' => 'rent-to-own',
                        'product' => 'Lenovo ThinkPad X1',
                        'verified' => true
                    ]
                ];
                
                foreach ($testimonials as $testimonial):
                    // Skip if filtering by category and this doesn't match
                    if ($category && $testimonial['category'] !== $category) continue;
                ?>
                    <div class="testimonial-card">
                        <div class="testimonial-header">
                            <div class="user-info">
                                <img src="<?php echo $testimonial['avatar']; ?>" alt="<?php echo $testimonial['username']; ?>" class="user-avatar">
                                <div class="user-details">
                                    <h3 class="user-name"><?php echo $testimonial['username']; ?></h3>
                                    <?php if ($testimonial['verified']): ?>
                                        <span class="verified-badge"><i class="fas fa-check-circle"></i> Verified Customer</span>
                                    <?php endif; ?>
                                </div>
                            </div>
                            <div class="testimonial-meta">
                                <span class="testimonial-date"><?php echo date('F j, Y', strtotime($testimonial['date'])); ?></span>
                                <span class="testimonial-product"><?php echo $testimonial['product']; ?></span>
                                <span class="testimonial-category"><?php echo ucfirst($testimonial['category']); ?></span>
                            </div>
                        </div>
                        
                        <div class="testimonial-content">
                            <h4 class="testimonial-title"><?php echo $testimonial['title']; ?></h4>
                            <?php echo getStarRating($testimonial['rating']); ?>
                            <p class="testimonial-text"><?php echo $testimonial['content']; ?></p>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
            
            <div class="pagination-container animate-on-scroll">
                <ul class="pagination">
                    <li class="page-item disabled"><a class="page-link" href="#"><i class="fas fa-chevron-left"></i></a></li>
                    <li class="page-item active"><a class="page-link" href="#">1</a></li>
                    <li class="page-item"><a class="page-link" href="#">2</a></li>
                    <li class="page-item"><a class="page-link" href="#">3</a></li>
                    <li class="page-item"><a class="page-link" href="#"><i class="fas fa-chevron-right"></i></a></li>
                </ul>
            </div>
            
            <!-- Testimonial submission form -->
            <div class="testimonial-form-section animate-on-scroll" id="submit-testimonial">
                <h3>Share Your Experience</h3>
                <p>We value your feedback! Please share your experience with GigGatek's products or services to help other customers make informed decisions.</p>
                
                <?php if ($isLoggedIn): ?>
                    <form action="api/testimonials/submit.php" method="post" class="testimonial-form">
                        <div class="form-group">
                            <label for="testimonial-title">Title</label>
                            <input type="text" id="testimonial-title" name="title" class="form-control" placeholder="Summarize your experience" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="testimonial-rating">Rating</label>
                            <div class="rating-input">
                                <div class="star-rating-select">
                                    <input type="radio" id="star5" name="rating" value="5" required>
                                    <label for="star5"><i class="fas fa-star"></i></label>
                                    
                                    <input type="radio" id="star4" name="rating" value="4">
                                    <label for="star4"><i class="fas fa-star"></i></label>
                                    
                                    <input type="radio" id="star3" name="rating" value="3">
                                    <label for="star3"><i class="fas fa-star"></i></label>
                                    
                                    <input type="radio" id="star2" name="rating" value="2">
                                    <label for="star2"><i class="fas fa-star"></i></label>
                                    
                                    <input type="radio" id="star1" name="rating" value="1">
                                    <label for="star1"><i class="fas fa-star"></i></label>
                                </div>
                                <span class="rating-text">Select your rating</span>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="testimonial-category">Category</label>
                            <select id="testimonial-category" name="category" class="form-select" required>
                                <option value="">Select a category</option>
                                <option value="laptops">Laptops</option>
                                <option value="desktops">Desktops</option>
                                <option value="smartphones">Smartphones</option>
                                <option value="tablets">Tablets</option>
                                <option value="accessories">Accessories</option>
                                <option value="rent-to-own">Rent-to-Own Program</option>
                                <option value="customer-service">Customer Service</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="testimonial-product">Product (if applicable)</label>
                            <input type="text" id="testimonial-product" name="product" class="form-control" placeholder="e.g., Dell XPS 13, iPhone 12, etc.">
                        </div>
                        
                        <div class="form-group">
                            <label for="testimonial-content">Your Experience</label>
                            <textarea id="testimonial-content" name="content" class="form-control" rows="5" placeholder="Please share details about your experience with our products or services" required></textarea>
                        </div>
                        
                        <div class="form-group form-check">
                            <input type="checkbox" id="testimonial-terms" name="terms" class="form-check-input" required>
                            <label for="testimonial-terms" class="form-check-label">I confirm that this is my honest opinion based on my personal experience with GigGatek. I understand that my username will be displayed with this testimonial.</label>
                        </div>
                        
                        <button type="submit" class="btn btn-primary">Submit Testimonial</button>
                    </form>
                <?php else: ?>
                    <div class="login-prompt">
                        <p>Please <a href="login.php?redirect=testimonials.php#submit-testimonial">log in</a> to share your testimonial. If you don't have an account yet, you can <a href="register.php?redirect=testimonials.php#submit-testimonial">register here</a>.</p>
                    </div>
                <?php endif; ?>
            </div>
            
            <div class="testimonial-guidelines animate-on-scroll">
                <h3>Testimonial Guidelines</h3>
                <p>We welcome all honest feedback from verified customers. To ensure a helpful and respectful environment, please follow these guidelines when submitting your testimonial:</p>
                <ul>
                    <li>Share your personal experience with our products or services</li>
                    <li>Be specific about what you liked or disliked</li>
                    <li>Keep your language respectful and appropriate</li>
                    <li>Avoid including personal information (e.g., order numbers, contact details)</li>
                    <li>Focus on providing helpful information for other customers</li>
                </ul>
                <p>All testimonials are reviewed before being published. We reserve the right to edit or reject submissions that don't meet our guidelines.</p>
            </div>
        </div>
    </section>
</main>

<style>
    /* Page-specific styles */
    .testimonials-content {
        padding: 3rem 0;
    }
    
    .testimonials-intro {
        margin-bottom: 3rem;
        text-align: center;
    }
    
    .testimonials-intro .lead {
        font-size: 1.25rem;
        margin: 1.5rem 0;
    }
    
    .cta-button {
        margin-top: 1.5rem;
    }
    
    .testimonials-filters {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        flex-wrap: wrap;
    }
    
    .filter-categories {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
    }
    
    .filter-categories span {
        font-weight: 500;
        color: #555;
    }
    
    .filter-categories a {
        padding: 5px 15px;
        border-radius: 20px;
        color: #555;
        text-decoration: none;
        transition: all 0.3s;
    }
    
    .filter-categories a.active,
    .filter-categories a:hover {
        background-color: #007bff;
        color: white;
    }
    
    .filter-sort {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .filter-sort label {
        margin-bottom: 0;
    }
    
    .filter-sort select {
        padding: 5px 10px;
        border-radius: 4px;
        border: 1px solid #ddd;
    }
    
    .featured-testimonial {
        margin-bottom: 3rem;
    }
    
    .testimonial-card {
        background-color: white;
        border-radius: 8px;
        padding: 2rem;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        margin-bottom: 2rem;
        position: relative;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .testimonial-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    }
    
    .testimonial-card.featured {
        border: 2px solid #007bff;
        background-color: #f8f9ff;
    }
    
    .featured-badge {
        position: absolute;
        top: -12px;
        right: 20px;
        background-color: #007bff;
        color: white;
        padding: 5px 15px;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 500;
    }
    
    .featured-badge i {
        margin-right: 5px;
        color: #ffd700;
    }
    
    .testimonial-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 15px;
    }
    
    .user-info {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .user-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        object-fit: cover;
    }
    
    .user-details {
        display: flex;
        flex-direction: column;
    }
    
    .user-name {
        margin: 0;
        font-size: 1.1rem;
    }
    
    .verified-badge {
        color: #28a745;
        font-size: 0.9rem;
    }
    
    .verified-badge i {
        margin-right: 5px;
    }
    
    .testimonial-meta {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        color: #777;
        font-size: 0.9rem;
    }
    
    .testimonial-meta span {
        margin-bottom: 5px;
    }
    
    .testimonial-content {
        margin-bottom: 1rem;
    }
    
    .testimonial-title {
        margin-top: 0;
        margin-bottom: 1rem;
        color: #333;
    }
    
    .star-rating {
        color: #ffc107;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
    }
    
    .star-rating i {
        margin-right: 3px;
    }
    
    .rating-text {
        margin-left: 10px;
        color: #777;
        font-size: 0.9rem;
    }
    
    .testimonial-text {
        line-height: 1.7;
    }
    
    .testimonials-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 30px;
        margin-bottom: 3rem;
    }
    
    /* Testimonial form styles */
    .testimonial-form-section {
        background-color: white;
        border-radius: 8px;
        padding: 2rem;
        margin-bottom: 3rem;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    
    .testimonial-form-section h3 {
        margin-top: 0;
        margin-bottom: 1rem;
    }
    
    .testimonial-form {
        margin-top: 2rem;
    }
    
    .form-group {
        margin-bottom: 1.5rem;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
    }
    
    .rating-input {
        display: flex;
        align-items: center;
    }
    
    .star-rating-select {
        display: flex;
        flex-direction: row-reverse;
        gap: 5px;
    }
    
    .star-rating-select input {
        display: none;
    }
    
    .star-rating-select label {
        cursor: pointer;
        color: #ddd;
        font-size: 1.5rem;
        margin-bottom: 0;
    }
    
    .star-rating-select label:hover,
    .star-rating-select label:hover ~ label,
    .star-rating-select input:checked ~ label {
        color: #ffc107;
    }
    
    .login-prompt {
        background-color: #f8f9fa;
        padding: 2rem;
        text-align: center;
        border-radius: 8px;
    }
    
    .testimonial-guidelines {
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 2rem;
    }
    
    .testimonial-guidelines h3 {
        margin-top: 0;
        margin-bottom: 1rem;
    }
    
    .testimonial-guidelines ul {
        margin-bottom: 1.5rem;
        padding-left: 1.5rem;
    }
    
    .testimonial-guidelines li {
        margin-bottom: 0.5rem;
    }
    
    @media (max-width: 768px) {
        .testimonials-filters {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
        }
        
        .testimonial-header {
            flex-direction: column;
        }
        
        .testimonial-meta {
            align-items: flex-start;
        }
        
        .testimonials-grid {
            grid-template-columns: 1fr;
        }
    }
</style>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Sort testimonials functionality
        const sortSelect = document.getElementById('sort-testimonials');
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                // In a real application, this would reload the page with a sort parameter
                // For now, we'll just simulate a page reload
                const sortValue = this.value;
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('sort', sortValue);
                window.location.href = currentUrl.toString();
            });
        }
        
        // Star rating selection
        const ratingInputs = document.querySelectorAll('.star-rating-select input');
        const ratingText = document.querySelector('.rating-input .rating-text');
        
        ratingInputs.forEach(input => {
            input.addEventListener('change', function() {
                if (ratingText) {
                    ratingText.textContent = `${this.value} out of 5`;
                }
            });
        });
    });
</script>

<?php
// Include footer
include_once 'includes/footer.php';
?>
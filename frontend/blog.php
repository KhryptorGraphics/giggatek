<?php
/**
 * GigGatek - Blog Page
 * Blog listing with articles and commenting functionality
 */

// Set page-specific variables
$pageTitle = "Blog";
$pageDescription = "Stay updated with the latest news, tips, and insights about refurbished technology, sustainability, and more from GigGatek.";

// Include header
include_once 'includes/header.php';

// Check if user is logged in (for commenting)
$isLoggedIn = isset($_SESSION['user_id']);
$userId = $isLoggedIn ? $_SESSION['user_id'] : null;
$username = $isLoggedIn ? $_SESSION['username'] : null;

// Get blog post ID from URL if viewing a single post
$postId = isset($_GET['id']) ? intval($_GET['id']) : null;

// Function to get formatted date
function formatDate($dateString) {
    $date = new DateTime($dateString);
    return $date->format('F j, Y');
}
?>

<main>
    <section class="page-header">
        <div class="container">
            <h1>GigGatek Blog</h1>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="index.php">Home</a></li>
                    <?php if ($postId): ?>
                        <li class="breadcrumb-item"><a href="blog.php">Blog</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Article</li>
                    <?php else: ?>
                        <li class="breadcrumb-item active" aria-current="page">Blog</li>
                    <?php endif; ?>
                </ol>
            </nav>
        </div>
    </section>

    <section class="blog-content">
        <div class="container">
            <?php if ($postId): ?>
                <!-- Single blog post view -->
                <div class="single-post animate-on-scroll" id="post-<?php echo $postId; ?>">
                    <?php
                    // In a real application, this would fetch from the database
                    // For now, we'll use a static example
                    $post = [
                        'id' => $postId,
                        'title' => 'Understanding Refurbished Technology: Quality, Sustainability, and Value',
                        'date' => '2025-03-15',
                        'author' => 'Michael Chen',
                        'author_image' => 'img/team/michael-chen.jpg',
                        'category' => 'Education',
                        'image' => 'img/blog/refurbished-tech.jpg',
                        'content' => '<p class="lead">In a world where technology evolves at lightning speed, refurbished devices offer a sustainable and cost-effective alternative to buying new. But what exactly does "refurbished" mean, and how can you ensure you\'re getting a quality product?</p>
                        <p>When we talk about refurbished technology at GigGatek, we\'re referring to pre-owned devices that have undergone a comprehensive restoration process. Unlike simply "used" products, refurbished items are thoroughly inspected, repaired, and tested to ensure they meet specific quality standards before being resold.</p>
                        <h3>The Refurbishment Process</h3>
                        <p>Our refurbishment process includes several critical steps:</p>
                        <ol>
                            <li><strong>Initial Assessment:</strong> Each device undergoes a thorough inspection to identify any issues or components that need replacement.</li>
                            <li><strong>Data Wiping:</strong> All previous user data is completely and securely erased using industry-standard methods.</li>
                            <li><strong>Repairs and Replacements:</strong> Damaged or worn components are repaired or replaced with quality parts.</li>
                            <li><strong>Cleaning and Cosmetic Restoration:</strong> Devices are thoroughly cleaned, and cosmetic issues are addressed.</li>
                            <li><strong>Software Installation:</strong> Operating systems and essential software are freshly installed.</li>
                            <li><strong>Quality Testing:</strong> Each device undergoes extensive testing to ensure it meets our performance standards.</li>
                            <li><strong>Final Inspection:</strong> A final quality check ensures the device is ready for its new owner.</li>
                        </ol>',
                        'tags' => ['Refurbished', 'Sustainability', 'Technology', 'E-waste'],
                        'comment_count' => 8
                    ];
                    ?>
                    
                    <div class="post-header">
                        <h2><?php echo $post['title']; ?></h2>
                        <div class="post-meta">
                            <div class="author-info">
                                <img src="<?php echo $post['author_image']; ?>" alt="<?php echo $post['author']; ?>" class="author-image">
                                <span class="author-name"><?php echo $post['author']; ?></span>
                            </div>
                            <div class="post-details">
                                <span class="post-date"><i class="far fa-calendar-alt"></i> <?php echo formatDate($post['date']); ?></span>
                                <span class="post-category"><i class="far fa-folder"></i> <?php echo $post['category']; ?></span>
                                <span class="post-comments"><i class="far fa-comments"></i> <?php echo $post['comment_count']; ?> Comments</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="post-image">
                        <img src="<?php echo $post['image']; ?>" alt="<?php echo $post['title']; ?>" class="img-fluid rounded">
                    </div>
                    
                    <div class="post-content">
                        <?php echo $post['content']; ?>
                    </div>
                    
                    <div class="post-tags">
                        <?php foreach ($post['tags'] as $tag): ?>
                            <a href="blog.php?tag=<?php echo urlencode($tag); ?>" class="tag"><?php echo $tag; ?></a>
                        <?php endforeach; ?>
                    </div>
                    
                    <!-- Comments section -->
                    <div class="comments-section" id="comments">
                        <h3>Comments (<?php echo $post['comment_count']; ?>)</h3>
                        
                        <div class="comments-list">
                            <?php
                            // In a real application, this would fetch from the database
                            // For now, we'll use static examples
                            $comments = [
                                [
                                    'id' => 1,
                                    'user_id' => 101,
                                    'username' => 'TechEnthusiast',
                                    'avatar' => 'img/avatars/user1.jpg',
                                    'date' => '2025-04-01 14:23:45',
                                    'content' => 'Great article! I\'ve been using refurbished laptops for years and have had excellent experiences. The environmental impact is something more people should consider when making tech purchases.',
                                    'likes' => 12,
                                    'replies' => []
                                ],
                                [
                                    'id' => 2,
                                    'user_id' => 102,
                                    'username' => 'EcoConsumer',
                                    'avatar' => 'img/avatars/user2.jpg',
                                    'date' => '2025-04-02 09:15:22',
                                    'content' => 'I was skeptical about refurbished tech until I bought my first refurbished laptop last year. The quality was indistinguishable from new, and I saved over $400! Never going back to buying new again.',
                                    'likes' => 8,
                                    'replies' => []
                                ]
                            ];
                            
                            foreach ($comments as $comment):
                            ?>
                                <div class="comment" id="comment-<?php echo $comment['id']; ?>">
                                    <div class="comment-avatar">
                                        <img src="<?php echo $comment['avatar']; ?>" alt="<?php echo $comment['username']; ?>">
                                    </div>
                                    <div class="comment-content">
                                        <div class="comment-header">
                                            <h4 class="comment-username"><?php echo $comment['username']; ?></h4>
                                            <span class="comment-date"><?php echo formatDate(substr($comment['date'], 0, 10)); ?></span>
                                        </div>
                                        <div class="comment-text">
                                            <?php echo $comment['content']; ?>
                                        </div>
                                        <div class="comment-actions">
                                            <button class="btn-like" data-comment-id="<?php echo $comment['id']; ?>">
                                                <i class="far fa-thumbs-up"></i> Like (<?php echo $comment['likes']; ?>)
                                            </button>
                                            <button class="btn-reply" data-comment-id="<?php echo $comment['id']; ?>">
                                                <i class="far fa-comment"></i> Reply
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                        
                        <!-- Comment form -->
                        <div class="comment-form-container">
                            <h3>Leave a Comment</h3>
                            <?php if ($isLoggedIn): ?>
                                <form action="api/blog/add-comment.php" method="post" class="comment-form">
                                    <input type="hidden" name="post_id" value="<?php echo $postId; ?>">
                                    <div class="form-group">
                                        <label for="comment">Your Comment</label>
                                        <textarea name="comment" id="comment" placeholder="Share your thoughts..." required class="form-control"></textarea>
                                    </div>
                                    <button type="submit" class="btn btn-primary">Post Comment</button>
                                </form>
                            <?php else: ?>
                                <p class="login-prompt">Please <a href="login.php?redirect=blog.php?id=<?php echo $postId; ?>#comments">log in</a> to leave a comment.</p>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            <?php else: ?>
                <!-- Blog listing view -->
                <div class="blog-intro animate-on-scroll">
                    <h2>Latest Articles & Insights</h2>
                    <p class="lead">Stay updated with the latest news, tips, and insights about refurbished technology, sustainability, and more from the GigGatek team.</p>
                </div>
                
                <div class="blog-filters animate-on-scroll">
                    <div class="filter-categories">
                        <span>Categories:</span>
                        <a href="blog.php" class="active">All</a>
                        <a href="blog.php?category=education">Education</a>
                        <a href="blog.php?category=guides">Guides</a>
                        <a href="blog.php?category=sustainability">Sustainability</a>
                        <a href="blog.php?category=news">News</a>
                    </div>
                    <div class="filter-search">
                        <form action="blog.php" method="get">
                            <input type="text" name="search" placeholder="Search articles..." class="form-control">
                            <button type="submit"><i class="fas fa-search"></i></button>
                        </form>
                    </div>
                </div>
                
                <div class="featured-post animate-on-scroll">
                    <div class="featured-post-image">
                        <a href="blog.php?id=1">
                            <img src="img/blog/refurbished-tech.jpg" alt="Understanding Refurbished Technology: Quality, Sustainability, and Value" class="img-fluid">
                        </a>
                    </div>
                    <div class="featured-post-content">
                        <div class="post-category">Featured</div>
                        <h3><a href="blog.php?id=1">Understanding Refurbished Technology: Quality, Sustainability, and Value</a></h3>
                        <div class="post-meta">
                            <span class="post-date"><i class="far fa-calendar-alt"></i> March 15, 2025</span>
                            <span class="post-author"><i class="far fa-user"></i> Michael Chen</span>
                            <span class="post-comments"><i class="far fa-comments"></i> 8 Comments</span>
                        </div>
                        <p>In a world where technology evolves at lightning speed, refurbished devices offer a sustainable and cost-effective alternative to buying new. But what exactly does "refurbished" mean, and how can you ensure you're getting a quality product?</p>
                        <a href="blog.php?id=1" class="btn btn-primary">Read More</a>
                    </div>
                </div>
                
                <div class="blog-grid animate-on-scroll">
                    <?php
                    // In a real application, this would fetch from the database
                    // For now, we'll use static examples
                    $posts = [
                        [
                            'id' => 2,
                            'title' => 'The E-Waste Crisis: How Refurbished Tech Helps',
                            'date' => '2025-04-02',
                            'author' => 'Sarah Rodriguez',
                            'category' => 'Sustainability',
                            'image' => 'img/blog/e-waste-crisis.jpg',
                            'excerpt' => 'Electronic waste is one of the fastest-growing waste streams globally. Learn how choosing refurbished technology can help combat this growing environmental crisis.',
                            'comment_count' => 5
                        ],
                        [
                            'id' => 3,
                            'title' => 'Buying Guide: How to Choose the Right Refurbished Laptop',
                            'date' => '2025-03-25',
                            'author' => 'David Patel',
                            'category' => 'Guides',
                            'image' => 'img/blog/buying-guide.jpg',
                            'excerpt' => 'Looking for a refurbished laptop but not sure where to start? This comprehensive guide will walk you through everything you need to consider to make the right choice.',
                            'comment_count' => 12
                        ],
                        [
                            'id' => 4,
                            'title' => 'Rent-to-Own vs. Buying: Which Option is Right for You?',
                            'date' => '2025-03-10',
                            'author' => 'Jennifer Wong',
                            'category' => 'Education',
                            'image' => 'img/blog/rent-to-own.jpg',
                            'excerpt' => 'Explore the pros and cons of rent-to-own programs compared to outright purchases. We break down the financial considerations to help you make an informed decision.',
                            'comment_count' => 7
                        ]
                    ];
                    
                    foreach ($posts as $post):
                    ?>
                        <div class="post-card">
                            <div class="post-image">
                                <a href="blog.php?id=<?php echo $post['id']; ?>">
                                    <img src="<?php echo $post['image']; ?>" alt="<?php echo $post['title']; ?>" class="img-fluid">
                                </a>
                                <div class="post-category"><?php echo $post['category']; ?></div>
                            </div>
                            <div class="post-info">
                                <h3><a href="blog.php?id=<?php echo $post['id']; ?>"><?php echo $post['title']; ?></a></h3>
                                <div class="post-meta">
                                    <span class="post-date"><i class="far fa-calendar-alt"></i> <?php echo formatDate($post['date']); ?></span>
                                    <span class="post-author"><i class="far fa-user"></i> <?php echo $post['author']; ?></span>
                                </div>
                                <p><?php echo $post['excerpt']; ?></p>
                                <div class="post-footer">
                                    <a href="blog.php?id=<?php echo $post['id']; ?>" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
                                    <span class="post-comments"><i class="far fa-comments"></i> <?php echo $post['comment_count']; ?></span>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </section>
</main>

<style>
    /* Page-specific styles */
    .blog-content {
        padding: 3rem 0;
    }
    
    .blog-intro {
        margin-bottom: 3rem;
        text-align: center;
    }
    
    .blog-intro .lead {
        font-size: 1.25rem;
        margin: 1.5rem 0;
    }
    
    .blog-filters {
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
    
    .filter-search {
        position: relative;
        max-width: 300px;
        width: 100%;
    }
    
    .filter-search input {
        padding-right: 40px;
    }
    
    .filter-search button {
        position: absolute;
        right: 0;
        top: 0;
        height: 100%;
        width: 40px;
        background: none;
        border: none;
        color: #555;
    }
    
    .featured-post {
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 3rem;
        background-color: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    
    .featured-post-image {
        flex: 1;
        min-width: 300px;
    }
    
    .featured-post-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .featured-post-content {
        flex: 2;
        min-width: 300px;
        padding: 2rem;
    }
    
    .post-category {
        display: inline-block;
        padding: 3px 10px;
        background-color: #007bff;
        color: white;
        border-radius: 4px;
        font-size: 0.8rem;
        margin-bottom: 1rem;
    }
    
    .featured-post h3 {
        margin-top: 0;
        margin-bottom: 1rem;
    }
    
    .featured-post h3 a {
        color: #333;
        text-decoration: none;
        transition: color 0.3s;
    }
    
    .featured-post h3 a:hover {
        color: #007bff;
    }
    
    .post-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        margin-bottom: 1rem;
        color: #777;
        font-size: 0.9rem;
    }
    
    .post-meta i {
        margin-right: 5px;
    }
    
    .blog-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 30px;
        margin-bottom: 3rem;
    }
    
    .post-card {
        background-color: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .post-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    }
    
    .post-image {
        position: relative;
    }
    
    .post-image img {
        width: 100%;
        height: 200px;
        object-fit: cover;
    }
    
    .post-image .post-category {
        position: absolute;
        top: 15px;
        left: 15px;
        margin-bottom: 0;
    }
    
    .post-info {
        padding: 1.5rem;
    }
    
    .post-info h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        font-size: 1.25rem;
    }
    
    .post-info h3 a {
        color: #333;
        text-decoration: none;
        transition: color 0.3s;
    }
    
    .post-info h3 a:hover {
        color: #007bff;
    }
    
    .post-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #f0f0f0;
    }
    
    .read-more {
        color: #007bff;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.3s;
    }
    
    .read-more i {
        margin-left: 5px;
        transition: transform 0.3s;
    }
    
    .read-more:hover {
        color: #0056b3;
    }
    
    .read-more:hover i {
        transform: translateX(3px);
    }
    
    .post-comments {
        color: #777;
        font-size: 0.9rem;
    }
    
    /* Single post styles */
    .single-post {
        background-color: white;
        border-radius: 8px;
        padding: 2rem;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    
    .post-header {
        margin-bottom: 2rem;
    }
    
    .post-header h2 {
        margin-top: 0;
        margin-bottom: 1rem;
    }
    
    .author-info {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .author-image {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 10px;
        object-fit: cover;
    }
    
    .author-name {
        font-weight: 500;
    }
    
    .post-details {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
    }
    
    .post-content {
        margin: 2rem 0;
        line-height: 1.7;
    }
    
    .post-content h3 {
        margin-top: 2rem;
        margin-bottom: 1rem;
    }
    
    .post-content p {
        margin-bottom: 1.5rem;
    }
    
    .post-content ul,
    .post-content ol {
        margin-bottom: 1.5rem;
        padding-left: 1.5rem;
    }
    
    .post-content li {
        margin-bottom: 0.5rem;
    }
    
    .post-tags {
        margin: 2rem 0;
    }
    
    .tag {
        display: inline-block;
        padding: 5px 10px;
        background-color: #f0f0f0;
        color: #555;
        border-radius: 4px;
        margin-right: 10px;
        margin-bottom: 10px;
        text-decoration: none;
        transition: background-color 0.3s, color 0.3s;
    }
    
    .tag:hover {
        background-color: #007bff;
        color: white;
    }
    
    /* Comments section */
    .comments-section {
        margin-top: 3rem;
        padding-top: 2rem;
        border-top: 1px solid #f0f0f0;
    }
    
    .comments-section h3 {
        margin-bottom: 2rem;
    }
    
    .comments-list {
        margin-bottom: 3rem;
    }
    
    .comment {
        display: flex;
        margin-bottom: 2rem;
    }
    
    .comment-avatar {
        flex-shrink: 0;
        margin-right: 1rem;
    }
    
    .comment-avatar img {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
    }
    
    .comment-content {
        flex-grow: 1;
    }
    
    .comment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    
    .comment-username {
        margin: 0;
        font-size: 1rem;
    }
    
    .comment-date {
        color: #777;
        font-size: 0.9rem;
    }
    
    .comment-text {
        margin-bottom: 1rem;
        line-height: 1.5;
    }
    
    .comment-actions {
        display: flex;
        gap: 15px;
    }
    
    .btn-like,
    .btn-reply {
        background: none;
        border: none;
        color: #777;
        cursor: pointer;
        transition: color 0.3s;
        padding: 0;
    }
    
    .btn-like:hover,
    .btn-reply:hover {
        color: #007bff;
    }
    
    .comment-form-container {
        background-color: #f8f9fa;
        padding: 2rem;
        border-radius: 8px;
    }
    
    .comment-form-container h3 {
        margin-top: 0;
        margin-bottom: 1.5rem;
    }
    
    .comment-form .form-group {
        margin-bottom: 1.5rem;
    }
    
    .comment-form label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
    }
    
    .comment-form textarea {
        width: 100%;
        min-height: 150px;
        padding: 1rem;
        border: 1px solid #ddd;
        border-radius: 4px;
    }
    
    .login-prompt {
        text-align: center;
        padding: 2rem;
        background-color: #f8f9fa;
        border-radius: 8px;
    }
    
    @media (max-width: 768px) {
        .featured-post {
            flex-direction: column;
        }
        
        .blog-grid {
            grid-template-columns: 1fr;
        }
        
        .blog-filters {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
        }
        
        .filter-search {
            max-width: 100%;
        }
    }
</style>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Reply button functionality
        const replyButtons = document.querySelectorAll('.btn-reply');
        replyButtons.forEach(button => {
            button.addEventListener('click', function() {
                const commentId = this.getAttribute('data-comment-id');
                const replyForm = document.getElementById(`reply-form-${commentId}`);
                
                if (replyForm) {
                    replyForm.style.display = replyForm.style.display === 'none' ? 'block' : 'none';
                }
            });
        });
        
        // Like button functionality
        const likeButtons = document.querySelectorAll('.btn-like');
        likeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const commentId = this.getAttribute('data-comment-id');
                
                // In a real application, this would send an AJAX request to the server
                // For now, we'll just update the UI
                const likeCount = parseInt(this.textContent.match(/\d+/)[0]) + 1;
                this.innerHTML = `<i class="fas fa-thumbs-up"></i> Like (${likeCount})`;
                this.classList.add('liked');
                this.disabled = true;
            });
        });
    });
</script>

<?php
// Include footer
include_once 'includes/footer.php';
?>

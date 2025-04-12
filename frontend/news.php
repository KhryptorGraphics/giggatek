<?php
/**
 * GigGatek - News & Press Page
 * Company news, press releases, and media coverage
 */

// Set page-specific variables
$pageTitle = "News & Press";
$pageDescription = "Stay updated with the latest news, press releases, and media coverage about GigGatek and our mission to make quality refurbished technology accessible to everyone.";

// Include header
include_once 'includes/header.php';

// Get news article ID from URL if viewing a single article
$articleId = isset($_GET['id']) ? intval($_GET['id']) : null;

// Function to get formatted date
function formatDate($dateString) {
    $date = new DateTime($dateString);
    return $date->format('F j, Y');
}
?>

<main>
    <section class="page-header">
        <div class="container">
            <h1>News & Press</h1>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="index.php">Home</a></li>
                    <?php if ($articleId): ?>
                        <li class="breadcrumb-item"><a href="news.php">News & Press</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Article</li>
                    <?php else: ?>
                        <li class="breadcrumb-item active" aria-current="page">News & Press</li>
                    <?php endif; ?>
                </ol>
            </nav>
        </div>
    </section>

    <section class="news-content">
        <div class="container">
            <?php if ($articleId): ?>
                <!-- Single news article view -->
                <div class="single-article animate-on-scroll" id="article-<?php echo $articleId; ?>">
                    <?php
                    // In a real application, this would fetch from the database
                    // For now, we'll use a static example
                    $article = [
                        'id' => $articleId,
                        'title' => 'GigGatek Expands Operations with New Refurbishment Facility',
                        'date' => '2025-03-20',
                        'category' => 'Press Release',
                        'image' => 'img/news/facility-expansion.jpg',
                        'content' => '<p class="lead">GigGatek is proud to announce the opening of our new 25,000 square foot refurbishment facility, marking a significant milestone in our mission to make quality technology accessible to all while reducing electronic waste.</p>
                        <p>The new facility, located in Seattle\'s industrial district, will increase our refurbishment capacity by 200% and create over 50 new jobs in the local community. This expansion comes in response to growing demand for high-quality refurbished electronics and our commitment to scaling our environmental impact.</p>
                        <h3>Increased Capacity, Enhanced Quality</h3>
                        <p>The state-of-the-art facility features:</p>
                        <ul>
                            <li>Advanced diagnostic equipment for comprehensive testing</li>
                            <li>Specialized repair stations for various device types</li>
                            <li>Enhanced quality control processes</li>
                            <li>Expanded inventory management systems</li>
                            <li>Improved packaging and shipping operations</li>
                        </ul>
                        <p>"This expansion represents a major step forward in our mission," said Michael Chen, Co-Founder and CEO of GigGatek. "With our increased capacity, we\'ll be able to save thousands more devices from landfills while providing even more consumers with affordable, high-quality technology options."</p>
                        <h3>Environmental Impact</h3>
                        <p>The new facility is designed with sustainability in mind, featuring:</p>
                        <ul>
                            <li>Solar panels providing 40% of the facility\'s energy needs</li>
                            <li>Advanced e-waste processing capabilities</li>
                            <li>Water reclamation systems for cleaning operations</li>
                            <li>Energy-efficient lighting and climate control</li>
                        </ul>
                        <p>By 2026, GigGatek aims to divert over 500,000 pounds of electronic waste from landfills annually through its refurbishment operations.</p>
                        <h3>Community Investment</h3>
                        <p>The expansion will create over 50 new jobs, including technical positions, quality assurance specialists, and operations staff. GigGatek is partnering with local technical colleges to develop training programs for refurbishment technicians, creating pathways to employment in the growing circular economy.</p>
                        <p>"We\'re not just building a facility; we\'re investing in our community and our planet\'s future," said Sarah Rodriguez, Co-Founder and CTO. "Every device we refurbish represents both an environmental win and an opportunity to make technology more accessible."</p>
                        <h3>About GigGatek</h3>
                        <p>Founded in 2018, GigGatek is a leader in the refurbished technology market, providing high-quality refurbished computers, smartphones, and other devices at affordable prices. Through its innovative rent-to-own program and rigorous quality standards, GigGatek is working to bridge the digital divide while promoting sustainable technology consumption.</p>',
                        'source' => 'GigGatek Press Office',
                        'contact' => 'press@giggatek.com'
                    ];
                    ?>
                    
                    <div class="article-header">
                        <span class="article-category"><?php echo $article['category']; ?></span>
                        <h2><?php echo $article['title']; ?></h2>
                        <div class="article-meta">
                            <span class="article-date"><i class="far fa-calendar-alt"></i> <?php echo formatDate($article['date']); ?></span>
                            <span class="article-source"><i class="far fa-newspaper"></i> <?php echo $article['source']; ?></span>
                        </div>
                    </div>
                    
                    <div class="article-image">
                        <img src="<?php echo $article['image']; ?>" alt="<?php echo $article['title']; ?>" class="img-fluid rounded">
                    </div>
                    
                    <div class="article-content">
                        <?php echo $article['content']; ?>
                    </div>
                    
                    <div class="article-footer">
                        <div class="contact-info">
                            <h4>Media Contact</h4>
                            <p><i class="far fa-envelope"></i> <?php echo $article['contact']; ?></p>
                        </div>
                        
                        <div class="share-links">
                            <span>Share this article:</span>
                            <a href="#" aria-label="Share on Facebook" class="share-link facebook"><i class="fab fa-facebook-f"></i></a>
                            <a href="#" aria-label="Share on Twitter" class="share-link twitter"><i class="fab fa-twitter"></i></a>
                            <a href="#" aria-label="Share on LinkedIn" class="share-link linkedin"><i class="fab fa-linkedin-in"></i></a>
                            <a href="#" aria-label="Share via Email" class="share-link email"><i class="far fa-envelope"></i></a>
                        </div>
                    </div>
                    
                    <!-- Related articles -->
                    <div class="related-articles">
                        <h3>Related News</h3>
                        <div class="article-grid">
                            <div class="article-card">
                                <div class="article-image">
                                    <a href="news.php?id=2">
                                        <img src="img/news/partnership.jpg" alt="GigGatek Announces Partnership with Local Schools" class="img-fluid">
                                    </a>
                                </div>
                                <div class="article-info">
                                    <span class="article-category">Community</span>
                                    <h4><a href="news.php?id=2">GigGatek Announces Partnership with Local Schools</a></h4>
                                    <div class="article-meta">
                                        <span class="article-date">April 5, 2025</span>
                                    </div>
                                </div>
                            </div>
                            <div class="article-card">
                                <div class="article-image">
                                    <a href="news.php?id=3">
                                        <img src="img/news/award.jpg" alt="GigGatek Wins Sustainability Excellence Award" class="img-fluid">
                                    </a>
                                </div>
                                <div class="article-info">
                                    <span class="article-category">Awards</span>
                                    <h4><a href="news.php?id=3">GigGatek Wins Sustainability Excellence Award</a></h4>
                                    <div class="article-meta">
                                        <span class="article-date">March 12, 2025</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            <?php else: ?>
                <!-- News listing view -->
                <div class="news-intro animate-on-scroll">
                    <h2>Latest News & Press Releases</h2>
                    <p class="lead">Stay updated with the latest announcements, press releases, and media coverage about GigGatek and our mission to make quality refurbished technology accessible to everyone.</p>
                </div>
                
                <div class="news-filters animate-on-scroll">
                    <div class="filter-categories">
                        <span>Categories:</span>
                        <a href="news.php" class="active">All</a>
                        <a href="news.php?category=press-release">Press Releases</a>
                        <a href="news.php?category=media-coverage">Media Coverage</a>
                        <a href="news.php?category=awards">Awards</a>
                        <a href="news.php?category=community">Community</a>
                    </div>
                    <div class="filter-search">
                        <form action="news.php" method="get">
                            <input type="text" name="search" placeholder="Search news..." class="form-control">
                            <button type="submit"><i class="fas fa-search"></i></button>
                        </form>
                    </div>
                </div>
                
                <div class="featured-article animate-on-scroll">
                    <div class="featured-article-image">
                        <a href="news.php?id=1">
                            <img src="img/news/facility-expansion.jpg" alt="GigGatek Expands Operations with New Refurbishment Facility" class="img-fluid">
                        </a>
                    </div>
                    <div class="featured-article-content">
                        <span class="article-category">Press Release</span>
                        <h3><a href="news.php?id=1">GigGatek Expands Operations with New Refurbishment Facility</a></h3>
                        <div class="article-meta">
                            <span class="article-date"><i class="far fa-calendar-alt"></i> March 20, 2025</span>
                            <span class="article-source"><i class="far fa-newspaper"></i> GigGatek Press Office</span>
                        </div>
                        <p>GigGatek is proud to announce the opening of our new 25,000 square foot refurbishment facility, marking a significant milestone in our mission to make quality technology accessible to all while reducing electronic waste.</p>
                        <a href="news.php?id=1" class="btn btn-primary">Read More</a>
                    </div>
                </div>
                
                <div class="article-grid animate-on-scroll">
                    <?php
                    // In a real application, this would fetch from the database
                    // For now, we'll use static examples
                    $articles = [
                        [
                            'id' => 2,
                            'title' => 'GigGatek Announces Partnership with Local Schools',
                            'date' => '2025-04-05',
                            'category' => 'Community',
                            'source' => 'GigGatek Press Office',
                            'image' => 'img/news/partnership.jpg',
                            'excerpt' => 'GigGatek is partnering with Seattle Public Schools to provide refurbished laptops to students in need, helping to bridge the digital divide in education.'
                        ],
                        [
                            'id' => 3,
                            'title' => 'GigGatek Wins Sustainability Excellence Award',
                            'date' => '2025-03-12',
                            'category' => 'Awards',
                            'source' => 'GigGatek Press Office',
                            'image' => 'img/news/award.jpg',
                            'excerpt' => 'GigGatek has been recognized with the 2025 Sustainability Excellence Award for our innovative approach to extending the lifecycle of electronic devices.'
                        ],
                        [
                            'id' => 4,
                            'title' => 'Tech Today: "GigGatek Revolutionizes Refurbished Market"',
                            'date' => '2025-02-28',
                            'category' => 'Media Coverage',
                            'source' => 'Tech Today',
                            'image' => 'img/news/media-coverage.jpg',
                            'excerpt' => 'Leading technology publication Tech Today features GigGatek in an in-depth article about our innovative approach to the refurbished technology market.'
                        ],
                        [
                            'id' => 5,
                            'title' => 'GigGatek Launches Certified Refurbishment Program',
                            'date' => '2025-02-15',
                            'category' => 'Press Release',
                            'source' => 'GigGatek Press Office',
                            'image' => 'img/news/certification.jpg',
                            'excerpt' => 'Our new Certified Refurbishment Program sets industry-leading standards for quality, reliability, and transparency in refurbished technology.'
                        ],
                        [
                            'id' => 6,
                            'title' => 'GigGatek Featured on "The Future of Tech" Podcast',
                            'date' => '2025-01-30',
                            'category' => 'Media Coverage',
                            'source' => 'The Future of Tech Podcast',
                            'image' => 'img/news/podcast.jpg',
                            'excerpt' => 'Co-founders Michael Chen and Sarah Rodriguez discuss the future of sustainable technology and the growing refurbished market on the popular tech podcast.'
                        ],
                        [
                            'id' => 7,
                            'title' => 'GigGatek Hosts E-Waste Collection Drive',
                            'date' => '2025-01-15',
                            'category' => 'Community',
                            'source' => 'GigGatek Press Office',
                            'image' => 'img/news/e-waste-drive.jpg',
                            'excerpt' => 'Our community e-waste collection drive collected over 5,000 pounds of electronic waste for responsible recycling and refurbishment.'
                        ]
                    ];
                    
                    foreach ($articles as $article):
                    ?>
                        <div class="article-card">
                            <div class="article-image">
                                <a href="news.php?id=<?php echo $article['id']; ?>">
                                    <img src="<?php echo $article['image']; ?>" alt="<?php echo $article['title']; ?>" class="img-fluid">
                                </a>
                                <span class="article-category"><?php echo $article['category']; ?></span>
                            </div>
                            <div class="article-info">
                                <h3><a href="news.php?id=<?php echo $article['id']; ?>"><?php echo $article['title']; ?></a></h3>
                                <div class="article-meta">
                                    <span class="article-date"><i class="far fa-calendar-alt"></i> <?php echo formatDate($article['date']); ?></span>
                                    <span class="article-source"><i class="far fa-newspaper"></i> <?php echo $article['source']; ?></span>
                                </div>
                                <p><?php echo $article['excerpt']; ?></p>
                                <div class="article-footer">
                                    <a href="news.php?id=<?php echo $article['id']; ?>" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
                                </div>
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
                
                <div class="press-contact animate-on-scroll">
                    <h3>Press Contact</h3>
                    <p>For media inquiries, please contact our press office:</p>
                    <div class="contact-info">
                        <p><i class="far fa-envelope"></i> <a href="mailto:press@giggatek.com">press@giggatek.com</a></p>
                        <p><i class="fas fa-phone"></i> <a href="tel:+12065550123">(206) 555-0123</a></p>
                    </div>
                    <a href="contact.php?dept=press" class="btn btn-primary">Contact Press Office</a>
                </div>
                
                <div class="press-kit animate-on-scroll">
                    <h3>Press Kit</h3>
                    <p>Download our press kit for company information, high-resolution logos, product images, and executive bios.</p>
                    <a href="#" class="btn btn-outline-primary">Download Press Kit</a>
                </div>
            <?php endif; ?>
        </div>
    </section>
</main>

<style>
    /* Page-specific styles */
    .news-content {
        padding: 3rem 0;
    }
    
    .news-intro {
        margin-bottom: 3rem;
        text-align: center;
    }
    
    .news-intro .lead {
        font-size: 1.25rem;
        margin: 1.5rem 0;
    }
    
    .news-filters {
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
    
    .featured-article {
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 3rem;
        background-color: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    
    .featured-article-image {
        flex: 1;
        min-width: 300px;
    }
    
    .featured-article-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .featured-article-content {
        flex: 2;
        min-width: 300px;
        padding: 2rem;
    }
    
    .article-category {
        display: inline-block;
        padding: 3px 10px;
        background-color: #007bff;
        color: white;
        border-radius: 4px;
        font-size: 0.8rem;
        margin-bottom: 1rem;
    }
    
    .featured-article h3 {
        margin-top: 0;
        margin-bottom: 1rem;
    }
    
    .featured-article h3 a {
        color: #333;
        text-decoration: none;
        transition: color 0.3s;
    }
    
    .featured-article h3 a:hover {
        color: #007bff;
    }
    
    .article-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        margin-bottom: 1rem;
        color: #777;
        font-size: 0.9rem;
    }
    
    .article-meta i {
        margin-right: 5px;
    }
    
    .article-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 30px;
        margin-bottom: 3rem;
    }
    
    .article-card {
        background-color: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .article-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    }
    
    .article-image {
        position: relative;
    }
    
    .article-image img {
        width: 100%;
        height: 200px;
        object-fit: cover;
    }
    
    .article-image .article-category {
        position: absolute;
        top: 15px;
        left: 15px;
        margin-bottom: 0;
    }
    
    .article-info {
        padding: 1.5rem;
    }
    
    .article-info h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        font-size: 1.25rem;
    }
    
    .article-info h3 a {
        color: #333;
        text-decoration: none;
        transition: color 0.3s;
    }
    
    .article-info h3 a:hover {
        color: #007bff;
    }
    
    .article-footer {
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
    
    /* Single article styles */
    .single-article {
        background-color: white;
        border-radius: 8px;
        padding: 2rem;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    
    .article-header {
        margin-bottom: 2rem;
    }
    
    .article-header h2 {
        margin-top: 1rem;
        margin-bottom: 1rem;
    }
    
    .article-image {
        margin-bottom: 2rem;
    }
    
    .article-image img {
        width: 100%;
        height: auto;
        border-radius: 8px;
    }
    
    .article-content {
        margin-bottom: 2rem;
        line-height: 1.7;
    }
    
    .article-content h3 {
        margin-top: 2rem;
        margin-bottom: 1rem;
    }
    
    .article-content p {
        margin-bottom: 1.5rem;
    }
    
    .article-content ul,
    .article-content ol {
        margin-bottom: 1.5rem;
        padding-left: 1.5rem;
    }
    
    .article-content li {
        margin-bottom: 0.5rem;
    }
    
    .article-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid #f0f0f0;
    }
    
    .contact-info h4 {
        margin-top: 0;
        margin-bottom: 0.5rem;
    }
    
    .contact-info p {
        margin-bottom: 0.5rem;
    }
    
    .share-links {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .share-link {
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
    
    .share-link:hover {
        background-color: #007bff;
        color: white;
    }
    
    .related-articles {
        margin-top: 3rem;
        padding-top: 2rem;
        border-top: 1px solid #f0f0f0;
    }
    
    .related-articles h3 {
        margin-bottom: 1.5rem;
    }
    
    .press-contact,
    .press-kit {
        background-color: white;
        border-radius: 8px;
        padding: 2rem;
        margin-bottom: 2rem;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    
    .press-contact h3,
    .press-kit h3 {
        margin-top: 0;
        margin-bottom: 1rem;
    }
    
    .contact-info {
        margin: 1.5rem 0;
    }
    
    .contact-info p {
        margin-bottom: 0.5rem;
    }
    
    .contact-info i {
        width: 20px;
        margin-right: 10px;
        color: #007bff;
    }
    
    @media (max-width: 768px) {
        .featured-article {
            flex-direction: column;
        }
        
        .article-grid {
            grid-template-columns: 1fr;
        }
        
        .news-filters {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
        }
        
        .filter-search {
            max-width: 100%;
        }
        
        .article-footer {
            flex-direction: column;
            gap: 20px;
            align-items: flex-start;
        }
    }
</style>

<?php
// Include footer
include_once 'includes/footer.php';
?>
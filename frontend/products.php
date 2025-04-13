<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Products - GigGatek</title>
    <meta name="description" content="Browse our selection of quality refurbished computer hardware including GPUs, CPUs, memory, storage, and complete systems.">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">family=Montserrat:wght@400;500;600;700;800<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">family=Roboto:wght@400;500;700<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/framework.css">
    <link rel="stylesheet" href="css/modern-update.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/filters.css">
    <link rel="stylesheet" href="css/notifications.css">
    <link rel="stylesheet" href="css/wishlist.css">

    <style>
        /* Additional styles for products page */
        .products-container {
            display: grid;
            grid-template-columns: 250px 1fr;
            gap: 30px;
            margin: 30px 0 60px;
        }

        .banner-section {
            margin-bottom: 50px;
        }

        .banner {
            background-color: var(--primary-light);
            border-radius: var(--border-radius);
            padding: 30px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            align-items: center;
        }

        @media (max-width: 768px) {
            .banner {
                grid-template-columns: 1fr;
                text-align: center;
            }

            .banner-image {
                grid-row: 1;
            }

            .banner-content {
                grid-row: 2;
            }
        }

        .banner-content h2 {
            margin-bottom: 15px;
            font-size: 1.8rem;
        }

        .banner-content p {
            margin-bottom: 20px;
        }

        .banner-features {
            margin-bottom: 20px;
            padding-left: 20px;
        }

        .banner-features li {
            margin-bottom: 8px;
        }

        .banner-image img {
            max-width: 100%;
            border-radius: var(--border-radius);
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <a href="index.php" class="logo-link"><img src="img/logo.png" alt="GigGatek Logo" id="logo"></a>
            <nav>
                <ul>
                    <li><a href="index.php">Home</a></li>
                    <li><a href="products.php" class="active">Products</a></li>
                    <li><a href="rent-to-own.php">Rent-to-Own</a></li>
                    <li><a href="#">Support</a></li>
                    <li><a href="login.php">Account</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <main class="container">
        <section class="banner-section">
            <div class="banner">
                <div class="banner-content">
                    <h2>Quality Refurbished Hardware at Great Prices</h2>
                    <p>All our products are thoroughly tested and certified to ensure they meet our high-quality standards.</p>
                    <ul class="banner-features">
                        <li>Every item rigorously tested</li>
                        <li>Performance-verified components</li>
                        <li>All products include warranty</li>
                        <li>Rent-to-own options available on all items</li>
                    </ul>
                </div>
                <div class="banner-image">
                    <img src="img/products-banner.png" alt="Refurbished Hardware">
                </div>
            </div>
        </section>

        <div class="products-container">
            <aside class="filter-sidebar">
                <h3>Filter Products</h3>

                <div class="filter-group">
                    <h4>Category</h4>
                    <div class="filter-options">
                        <div class="filter-option">
                            <label>
                                <input type="checkbox" name="category" value="gpus"> Graphics Cards
                            </label>
                        </div>
                        <div class="filter-option">
                            <label>
                                <input type="checkbox" name="category" value="cpus"> Processors
                            </label>
                        </div>
                        <div class="filter-option">
                            <label>
                                <input type="checkbox" name="category" value="motherboards"> Motherboards
                            </label>
                        </div>
                        <div class="filter-option">
                            <label>
                                <input type="checkbox" name="category" value="memory"> Memory (RAM)
                            </label>
                        </div>
                        <div class="filter-option">
                            <label>
                                <input type="checkbox" name="category" value="storage"> Storage
                            </label>
                        </div>
                        <div class="filter-option">
                            <label>
                                <input type="checkbox" name="category" value="systems"> Complete Systems
                            </label>
                        </div>
                    </div>
                </div>

                <div class="filter-group">
                    <h4>Condition</h4>
                    <div class="filter-options">
                        <div class="filter-option">
                            <label>
                                <input type="checkbox" name="condition" value="excellent"> Excellent
                            </label>
                        </div>
                        <div class="filter-option">
                            <label>
                                <input type="checkbox" name="condition" value="good"> Good
                            </label>
                        </div>
                        <div class="filter-option">
                            <label>
                                <input type="checkbox" name="condition" value="fair"> Fair
                            </label>
                        </div>
                    </div>
                </div>

                <div class="filter-group">
                    <h4>Price Range</h4>
                    <input type="range" min="0" max="2000" value="2000" class="range-slider" id="price-range">
                    <div class="range-values">
                        <span>$0</span>
                        <span id="price-value">$2000+</span>
                    </div>
                </div>

                <div class="filter-group">
                    <h4>Brands</h4>
                    <div class="filter-options">
                        <div class="filter-option">
                            <label>
                                <input type="checkbox" name="brand" value="nvidia"> NVIDIA
                            </label>
                        </div>
                        <div class="filter-option">
                            <label>
                                <input type="checkbox" name="brand" value="amd"> AMD
                            </label>
                        </div>
                        <div class="filter-option">
                            <label>
                                <input type="checkbox" name="brand" value="intel"> Intel
                            </label>
                        </div>
                        <div class="filter-option">
                            <label>
                                <input type="checkbox" name="brand" value="corsair"> Corsair
                            </label>
                        </div>
                        <div class="filter-option">
                            <label>
                                <input type="checkbox" name="brand" value="samsung"> Samsung
                            </label>
                        </div>
                        <div class="filter-option">
                            <label>
                                <input type="checkbox" name="brand" value="seagate"> Seagate
                            </label>
                        </div>
                    </div>
                </div>

                <div class="filter-actions">
                    <button id="clear-filters" class="btn btn-secondary">Clear All Filters</button>
                </div>
            </aside>

            <div class="products-main">
                <div class="products-header">
                    <div class="products-count">
                        Showing <strong>24</strong> of <strong>72</strong> products
                    </div>
                    <div class="d-flex align-items-center">
                        <div class="sorting-options">
                            <label for="sort-by">Sort by:</label>
                            <select id="sort-by" class="form-control">
                                <option value="featured">Featured</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="newest">Newest First</option>
                            </select>
                        </div>
                        <div class="view-toggle">
                            <span>View:</span>
                            <button class="view-button active" data-view="grid">⊞</button>
                            <button class="view-button" data-view="list">≡</button>
                        </div>
                    </div>
                </div>

                <div class="product-grid" id="products-container">
                    <!-- Products will be loaded dynamically via JavaScript -->
                    <div class="loading">Loading products...</div>
                </div>

                <ul class="pagination">
                    <!-- Pagination will be generated dynamically via JavaScript -->
                </ul>
            </div>
        </div>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2025 GigGatek. All rights reserved.</p>
            <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Contact Us</a></li>
            </ul>
        </div>
    </footer>

    <!-- Include configuration and utility scripts -->
    <script src="js/config.js"></script>
    <script src="js/auth.js"></script>
    <script src="js/notifications.js"></script>

    <!-- Include product filtering and cart scripts -->
    <script src="js/product-filters.js"></script>
    <script src="js/cart.js"></script>
    <script src="js/wishlist.js"></script>
    <script>
        // Animation on scroll
        function animateOnScroll() {
            const elements = document.querySelectorAll(".animate-on-scroll");
            elements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                const elementVisible = 150;
                if (elementTop < window.innerHeight - elementVisible) {
                    element.classList.add("animated");
                }
            });
        }

        // Run on page load
        document.addEventListener("DOMContentLoaded", animateOnScroll);

        // Run on scroll
        window.addEventListener("scroll", animateOnScroll);

        // Header scroll effect
        window.addEventListener("scroll", function() {
            const header = document.querySelector("header");
            if (window.scrollY > 50) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        });
    </script>
</body>
</html>

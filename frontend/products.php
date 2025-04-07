<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Products - GigGatek</title>
    <meta name="description" content="Browse our selection of quality refurbished computer hardware including GPUs, CPUs, memory, storage, and complete systems.">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/framework.css">
    <link rel="stylesheet" href="css/style.css">
    <style>
        /* Additional styles for products page */
        .products-container {
            display: grid;
            grid-template-columns: 250px 1fr;
            gap: 30px;
            margin: 30px 0 60px;
        }
        
        @media (max-width: 992px) {
            .products-container {
                grid-template-columns: 1fr;
            }
            
            .filter-sidebar {
                margin-bottom: 30px;
            }
        }
        
        .products-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .sorting-options {
            display: flex;
            align-items: center;
        }
        
        .sorting-options label {
            margin-right: 10px;
        }
        
        .products-count {
            color: var(--medium);
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
        
        .view-toggle {
            display: flex;
            align-items: center;
            margin-left: 20px;
        }
        
        .view-toggle span {
            margin-right: 10px;
            color: var(--medium);
        }
        
        .view-button {
            background: none;
            border: 1px solid #dee2e6;
            width: 30px;
            height: 30px;
            border-radius: var(--border-radius-sm);
            margin: 0 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all var(--transition-fast);
        }
        
        .view-button:hover, .view-button.active {
            background-color: var(--primary-light);
            border-color: var(--primary);
            color: var(--primary);
        }
        
        .range-slider {
            width: 100%;
            margin: 15px 0;
        }
        
        .range-values {
            display: flex;
            justify-content: space-between;
            margin-top: 5px;
            font-size: 0.9rem;
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
                    <button class="btn btn-primary">Apply Filters</button>
                    <button class="btn btn-secondary mt-2">Reset</button>
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
                    <!-- Product 1 -->
                    <div class="product-item">
                        <div class="condition-badge condition-excellent">Excellent</div>
                        <img src="img/products/gpu-rtx3080.png" alt="NVIDIA GeForce RTX 3080">
                        <h4>NVIDIA GeForce RTX 3080 10GB GDDR6X</h4>
                        <div class="price">$599.99</div>
                        <div class="rent-price">From $69.99/mo with Rent-to-Own</div>
                        <a href="product.php?id=1" class="btn btn-primary">View Details</a>
                    </div>
                    
                    <!-- Product 2 -->
                    <div class="product-item">
                        <div class="condition-badge condition-good">Good</div>
                        <img src="img/products/cpu-ryzen9.png" alt="AMD Ryzen 9 5900X">
                        <h4>AMD Ryzen 9 5900X 12-Core Processor</h4>
                        <div class="price">$349.99</div>
                        <div class="rent-price">From $39.99/mo with Rent-to-Own</div>
                        <a href="product.php?id=2" class="btn btn-primary">View Details</a>
                    </div>
                    
                    <!-- Product 3 -->
                    <div class="product-item">
                        <div class="condition-badge condition-excellent">Excellent</div>
                        <img src="img/products/ram-corsair.png" alt="Corsair Vengeance RGB Pro 32GB">
                        <h4>Corsair Vengeance RGB Pro 32GB (2x16GB) DDR4 3200MHz</h4>
                        <div class="price">$129.99</div>
                        <div class="rent-price">From $16.99/mo with Rent-to-Own</div>
                        <a href="product.php?id=3" class="btn btn-primary">View Details</a>
                    </div>
                    
                    <!-- Product 4 -->
                    <div class="product-item">
                        <div class="condition-badge condition-good">Good</div>
                        <img src="img/products/pc-gaming.png" alt="Gaming PC - RTX 3070, i7, 16GB RAM">
                        <h4>Gaming PC - RTX 3070, i7-12700K, 16GB RAM, 1TB SSD</h4>
                        <div class="price">$1,299.99</div>
                        <div class="rent-price">From $134.99/mo with Rent-to-Own</div>
                        <a href="product.php?id=4" class="btn btn-primary">View Details</a>
                    </div>
                    
                    <!-- Product 5 -->
                    <div class="product-item">
                        <div class="condition-badge condition-fair">Fair</div>
                        <img src="img/products/gpu-rtx3070.png" alt="NVIDIA GeForce RTX 3070">
                        <h4>NVIDIA GeForce RTX 3070 8GB GDDR6</h4>
                        <div class="price">$449.99</div>
                        <div class="rent-price">From $49.99/mo with Rent-to-Own</div>
                        <a href="product.php?id=5" class="btn btn-primary">View Details</a>
                    </div>
                    
                    <!-- Product 6 -->
                    <div class="product-item">
                        <div class="condition-badge condition-excellent">Excellent</div>
                        <img src="img/products/ssd-samsung.png" alt="Samsung 970 EVO Plus 1TB SSD">
                        <h4>Samsung 970 EVO Plus 1TB NVMe SSD</h4>
                        <div class="price">$119.99</div>
                        <div class="rent-price">From $14.99/mo with Rent-to-Own</div>
                        <a href="product.php?id=6" class="btn btn-primary">View Details</a>
                    </div>
                    
                    <!-- Products 7-12 (repeated for demonstration) -->
                    <div class="product-item">
                        <div class="condition-badge condition-good">Good</div>
                        <img src="img/products/cpu-intel.png" alt="Intel Core i9-12900K">
                        <h4>Intel Core i9-12900K 16-Core Processor</h4>
                        <div class="price">$429.99</div>
                        <div class="rent-price">From $49.99/mo with Rent-to-Own</div>
                        <a href="product.php?id=7" class="btn btn-primary">View Details</a>
                    </div>
                    
                    <div class="product-item">
                        <div class="condition-badge condition-excellent">Excellent</div>
                        <img src="img/products/motherboard-asus.png" alt="ASUS ROG Strix X570-E Gaming">
                        <h4>ASUS ROG Strix X570-E Gaming Motherboard</h4>
                        <div class="price">$189.99</div>
                        <div class="rent-price">From $24.99/mo with Rent-to-Own</div>
                        <a href="product.php?id=8" class="btn btn-primary">View Details</a>
                    </div>
                    
                    <div class="product-item">
                        <div class="condition-badge condition-fair">Fair</div>
                        <img src="img/products/ram-gskill.png" alt="G.Skill Trident Z Neo 64GB">
                        <h4>G.Skill Trident Z Neo 64GB (4x16GB) DDR4 3600MHz</h4>
                        <div class="price">$259.99</div>
                        <div class="rent-price">From $29.99/mo with Rent-to-Own</div>
                        <a href="product.php?id=9" class="btn btn-primary">View Details</a>
                    </div>
                    
                    <div class="product-item">
                        <div class="condition-badge condition-good">Good</div>
                        <img src="img/products/ssd-wd.png" alt="WD Black SN850 2TB SSD">
                        <h4>WD Black SN850 2TB NVMe SSD</h4>
                        <div class="price">$229.99</div>
                        <div class="rent-price">From $26.99/mo with Rent-to-Own</div>
                        <a href="product.php?id=10" class="btn btn-primary">View Details</a>
                    </div>
                    
                    <div class="product-item">
                        <div class="condition-badge condition-excellent">Excellent</div>
                        <img src="img/products/pc-workstation.png" alt="Workstation PC">
                        <h4>Workstation PC - Threadripper, Quadro RTX 4000, 64GB RAM</h4>
                        <div class="price">$1,899.99</div>
                        <div class="rent-price">From $194.99/mo with Rent-to-Own</div>
                        <a href="product.php?id=11" class="btn btn-primary">View Details</a>
                    </div>
                    
                    <div class="product-item">
                        <div class="condition-badge condition-good">Good</div>
                        <img src="img/products/gpu-amd.png" alt="AMD Radeon RX 6800 XT">
                        <h4>AMD Radeon RX 6800 XT 16GB GDDR6</h4>
                        <div class="price">$499.99</div>
                        <div class="rent-price">From $59.99/mo with Rent-to-Own</div>
                        <a href="product.php?id=12" class="btn btn-primary">View Details</a>
                    </div>
                </div>
                
                <ul class="pagination">
                    <li class="active"><a href="#">1</a></li>
                    <li><a href="#">2</a></li>
                    <li><a href="#">3</a></li>
                    <li><a href="#">4</a></li>
                    <li><a href="#">5</a></li>
                    <li><a href="#">Next &raquo;</a></li>
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

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Price range slider
            const priceRange = document.getElementById('price-range');
            const priceValue = document.getElementById('price-value');
            
            priceRange.addEventListener('input', function() {
                const value = this.value;
                priceValue.textContent = value >= 2000 ? '$2000+' : '$' + value;
            });
            
            // View toggle functionality
            const viewButtons = document.querySelectorAll('.view-button');
            const productsContainer = document.getElementById('products-container');
            
            viewButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const view = this.dataset.view;
                    
                    // Remove active class from all buttons
                    viewButtons.forEach(btn => btn.classList.remove('active'));
                    
                    // Add active class to clicked button
                    this.classList.add('active');
                    
                    // Change view
                    if (view === 'grid') {
                        productsContainer.className = 'product-grid';
                    } else {
                        productsContainer.className = 'product-list';
                    }
                });
            });
        });
    </script>
</body>
</html>

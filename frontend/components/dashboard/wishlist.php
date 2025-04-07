<?php
/**
 * GigGatek Dashboard Wishlist Component
 * Contains the wishlist tab content
 */
?>
<!-- Wishlist Tab -->
<div class="dashboard-tab <?php echo $active_tab === 'wishlist' ? 'active' : ''; ?>" id="wishlist-tab">
    <div class="dashboard-header">
        <h2>My Wishlist</h2>
    </div>
    
    <div class="product-grid">
        <!-- Product 1 -->
        <div class="product-item">
            <div class="condition-badge condition-excellent">Excellent</div>
            <img src="img/products/gpu-rtx3090.png" alt="NVIDIA GeForce RTX 3090">
            <h4>NVIDIA GeForce RTX 3090 24GB GDDR6X</h4>
            <div class="price">$899.99</div>
            <div class="rent-price">From $99.99/mo with Rent-to-Own</div>
            <div class="wishlist-actions">
                <a href="product.php?id=13" class="btn btn-primary">View Details</a>
                <a href="#" class="btn btn-outline-primary">Add to Cart</a>
                <a href="#" class="btn btn-sm btn-outline-danger remove-wishlist">Remove</a>
            </div>
        </div>
        
        <!-- Product 2 -->
        <div class="product-item">
            <div class="condition-badge condition-good">Good</div>
            <img src="img/products/motherboard-asus.png" alt="ASUS ROG Strix X570-E Gaming">
            <h4>ASUS ROG Strix X570-E Gaming Motherboard</h4>
            <div class="price">$189.99</div>
            <div class="rent-price">From $24.99/mo with Rent-to-Own</div>
            <div class="wishlist-actions">
                <a href="product.php?id=8" class="btn btn-primary">View Details</a>
                <a href="#" class="btn btn-outline-primary">Add to Cart</a>
                <a href="#" class="btn btn-sm btn-outline-danger remove-wishlist">Remove</a>
            </div>
        </div>
        
        <!-- Product 3 -->
        <div class="product-item">
            <div class="condition-badge condition-excellent">Excellent</div>
            <img src="img/products/cpu-intel.png" alt="Intel Core i9-12900K">
            <h4>Intel Core i9-12900K 16-Core Processor</h4>
            <div class="price">$429.99</div>
            <div class="rent-price">From $49.99/mo with Rent-to-Own</div>
            <div class="wishlist-actions">
                <a href="product.php?id=7" class="btn btn-primary">View Details</a>
                <a href="#" class="btn btn-outline-primary">Add to Cart</a>
                <a href="#" class="btn btn-sm btn-outline-danger remove-wishlist">Remove</a>
            </div>
        </div>
        
        <!-- Product 4 -->
        <div class="product-item">
            <div class="condition-badge condition-fair">Fair</div>
            <img src="img/products/ram-gskill.png" alt="G.Skill Trident Z Neo 64GB">
            <h4>G.Skill Trident Z Neo 64GB (4x16GB) DDR4 3600MHz</h4>
            <div class="price">$259.99</div>
            <div class="rent-price">From $29.99/mo with Rent-to-Own</div>
            <div class="wishlist-actions">
                <a href="product.php?id=9" class="btn btn-primary">View Details</a>
                <a href="#" class="btn btn-outline-primary">Add to Cart</a>
                <a href="#" class="btn btn-sm btn-outline-danger remove-wishlist">Remove</a>
            </div>
        </div>
    </div>
</div>

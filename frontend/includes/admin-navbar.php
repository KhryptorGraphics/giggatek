<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
        <a class="navbar-brand" href="../admin/dashboard.php">GigGatek Admin</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
                <li class="nav-item">
                    <a class="navbar-link <?php echo (strpos($_SERVER['PHP_SELF'], 'dashboard.php') !== false) ? 'active' : ''; ?>" href="../admin/dashboard.php">Dashboard</a>
                </li>
                <li class="nav-item">
                    <a class="navbar-link <?php echo (strpos($_SERVER['PHP_SELF'], 'products.php') !== false) ? 'active' : ''; ?>" href="../admin/products.php">Products</a>
                </li>
                <li class="nav-item">
                    <a class="navbar-link <?php echo (strpos($_SERVER['PHP_SELF'], 'orders.php') !== false) ? 'active' : ''; ?>" href="../admin/orders.php">Orders</a>
                </li>
                <li class="nav-item">
                    <a class="navbar-link <?php echo (strpos($_SERVER['PHP_SELF'], 'rentals.php') !== false) ? 'active' : ''; ?>" href="../admin/rentals.php">Rentals</a>
                </li>
                <li class="nav-item">
                    <a class="navbar-link <?php echo (strpos($_SERVER['PHP_SELF'], 'customers.php') !== false) ? 'active' : ''; ?>" href="../admin/customers.php">Customers</a>
                </li>
                <li class="nav-item">
                    <a class="navbar-link <?php echo (strpos($_SERVER['PHP_SELF'], 'api-dashboard.php') !== false) ? 'active' : ''; ?>" href="../admin/api-dashboard.php">API Dashboard</a>
                </li>
                <li class="nav-item">
                    <a class="navbar-link <?php echo (strpos($_SERVER['PHP_SELF'], 'settings.php') !== false) ? 'active' : ''; ?>" href="../admin/settings.php">Settings</a>
                </li>
            </ul>
            <ul class="navbar-nav ms-auto">
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <?php echo htmlspecialchars(getCurrentUser()['name']); ?>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                        <li><a class="dropdown-item" href="../admin/profile.php">Profile</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="../logout.php">Logout</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</nav>

<?php displayFlashMessage(); ?>

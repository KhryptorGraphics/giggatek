<?php
$pageTitle = "About Us";
$pageDescription = "Learn about GigGatek's mission, values, and the team behind our commitment to making technology accessible to everyone.";
include 'includes/header.php';
?>

<main>
    <section class="page-header">
        <div class="container">
            <h1>About Us</h1>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="index.php">Home</a></li>
                    <li class="breadcrumb-item active" aria-current="page">About Us</li>
                </ol>
            </nav>
        </div>
    </section>

    <section class="about-content">
        <div class="container">
            <div class="about-summary animate-on-scroll" style="background-color:#f8f9fa; border-radius:8px; padding:30px; margin-bottom:30px; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
                <h2 style="color:#007bff; margin-top:0;">Our Mission</h2>
                <p style="font-size:18px; color:#444;">
                    At <strong>GigGatek</strong>, our mission is to make high-quality technology accessible and affordable for everyone. We believe in bridging the digital divide by offering expertly refurbished computer hardware through both direct purchase and flexible rent-to-own options.
                </p>
            </div>

            <div class="about-values animate-on-scroll" style="margin-bottom:40px;">
                <h2 style="color:#333;">Our Values</h2>
                <div style="display:flex; flex-wrap:wrap; gap:30px;">
                    <div class="info-card" style="flex:1; min-width:220px;">
                        <h4 style="color:#007bff;">Quality</h4>
                        <p>Every product undergoes rigorous testing and quality assurance to ensure reliability and performance.</p>
                    </div>
                    <div class="info-card" style="flex:1; min-width:220px;">
                        <h4 style="color:#007bff;">Affordability</h4>
                        <p>We offer competitive pricing and flexible payment options to fit every budget.</p>
                    </div>
                    <div class="info-card" style="flex:1; min-width:220px;">
                        <h4 style="color:#007bff;">Sustainability</h4>
                        <p>By refurbishing and reusing technology, we help reduce electronic waste and promote a greener planet.</p>
                    </div>
                    <div class="info-card" style="flex:1; min-width:220px;">
                        <h4 style="color:#007bff;">Customer Focus</h4>
                        <p>Our team is dedicated to providing exceptional service and support at every step of your journey.</p>
                    </div>
                </div>
            </div>

            <div class="about-story animate-on-scroll" style="margin-bottom:40px;">
                <h2 style="color:#333;">Our Story</h2>
                <p>
                    Founded by a team of passionate technologists and entrepreneurs, GigGatek was created to address the growing need for affordable, reliable computing. We saw too many people and organizations left behind by the high cost of new technology, and set out to change that by giving new life to expertly refurbished devices.
                </p>
                <p>
                    Today, we serve customers across the country, from students and families to small businesses and nonprofits. Our commitment to quality, transparency, and customer satisfaction has made us a trusted partner in technology.
                </p>
            </div>

            <div class="about-team animate-on-scroll" style="margin-bottom:40px;">
                <h2 style="color:#333;">Meet the Team</h2>
                <div style="display:flex; flex-wrap:wrap; gap:30px;">
                    <div class="info-card" style="flex:1; min-width:220px;">
                        <img src="img/team/founder.jpg" alt="Founder" style="width:80px; border-radius:50%; margin-bottom:10px;">
                        <h4 style="margin-bottom:5px;">Alex Kim</h4>
                        <p style="font-size:14px; color:#777;">Founder & CEO</p>
                        <p>Visionary leader with a passion for technology and social impact.</p>
                    </div>
                    <div class="info-card" style="flex:1; min-width:220px;">
                        <img src="img/team/cto.jpg" alt="CTO" style="width:80px; border-radius:50%; margin-bottom:10px;">
                        <h4 style="margin-bottom:5px;">Priya Patel</h4>
                        <p style="font-size:14px; color:#777;">Chief Technology Officer</p>
                        <p>Expert in hardware engineering and sustainable tech solutions.</p>
                    </div>
                    <div class="info-card" style="flex:1; min-width:220px;">
                        <img src="img/team/support.jpg" alt="Support Lead" style="width:80px; border-radius:50%; margin-bottom:10px;">
                        <h4 style="margin-bottom:5px;">Jordan Lee</h4>
                        <p style="font-size:14px; color:#777;">Customer Success Lead</p>
                        <p>Dedicated to ensuring every customer has a great experience.</p>
                    </div>
                </div>
            </div>

            <div class="about-contact animate-on-scroll" style="background-color:#f8f9fa; border-radius:8px; padding:30px; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
                <h2 style="color:#007bff;">Contact Us</h2>
                <p>
                    Have questions or want to learn more? Reach out to our team at <a href="mailto:support@giggatek.com">support@giggatek.com</a> or visit our <a href="contact.php">Contact page</a>.
                </p>
            </div>
        </div>
    </section>
</main>

<?php include 'includes/footer.php'; ?>

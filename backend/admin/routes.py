from flask import Blueprint, render_template

# Define the blueprint: 'admin', set its url prefix: app.url/admin
admin_bp = Blueprint('admin', __name__,
                     template_folder='../templates/admin', # Specify template folder relative to blueprint
                     url_prefix='/admin')

@admin_bp.route('/')
def dashboard():
    """Admin dashboard route."""
    # Logic to fetch dashboard data will go here
    return render_template('dashboard.html', title='Admin Dashboard')

@admin_bp.route('/products')
def manage_products():
    """Route to manage products."""
    # Logic to fetch products from DB will go here
    products = [] # Placeholder
    return render_template('products.html', title='Manage Products', products=products)

@admin_bp.route('/orders')
def manage_orders():
    """Route to manage orders."""
    # Logic to fetch orders from DB will go here
    orders = [] # Placeholder
    return render_template('orders.html', title='Manage Orders', orders=orders)

# Add more routes for CRUD operations (Create, Read, Update, Delete) later

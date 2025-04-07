"""
Email notification utility module for GigGatek platform.

This module provides functions for sending various types of transactional emails:
- Account-related emails (registration, password reset)
- Order notifications (confirmation, shipping, etc.)
- Rental notifications (payment reminders, receipts)

Emails are sent via SMTP using a configurable email service.
"""

import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from datetime import datetime, timedelta
import logging
from jinja2 import Environment, FileSystemLoader
import threading

# Initialize Jinja2 environment for email templates
template_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'templates/emails')
jinja_env = Environment(loader=FileSystemLoader(template_dir))

# Email configuration
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.example.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', 'notifications@giggatek.com')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', 'password')
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True').lower() == 'true'
EMAIL_FROM = os.environ.get('EMAIL_FROM', 'GigGatek <notifications@giggatek.com>')
EMAIL_REPLY_TO = os.environ.get('EMAIL_REPLY_TO', 'support@giggatek.com')

# Setup logging
logger = logging.getLogger(__name__)

def send_email_async(to_email, subject, html_content, text_content=None, attachments=None):
    """
    Send an email asynchronously to avoid blocking the main execution thread.
    
    Args:
        to_email: Recipient email address or list of addresses
        subject: Email subject
        html_content: HTML content of the email
        text_content: Plain text content (optional, will be generated from HTML if not provided)
        attachments: List of file paths to attach (optional)
    """
    thread = threading.Thread(
        target=_send_email,
        args=(to_email, subject, html_content, text_content, attachments)
    )
    thread.start()
    return thread

def _send_email(to_email, subject, html_content, text_content=None, attachments=None):
    """
    Internal function to send emails via SMTP.
    """
    if isinstance(to_email, str):
        to_email = [to_email]
    
    # Create message container
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = EMAIL_FROM
    msg['To'] = ', '.join(to_email)
    msg['Reply-To'] = EMAIL_REPLY_TO
    
    # Create the text/plain part if not provided
    if text_content is None:
        # Simple HTML to text conversion
        # In a production system, use a proper HTML to text converter
        text_content = html_content.replace('<br>', '\n').replace('<p>', '\n').replace('</p>', '\n')
        text_content = ''.join(text_content.split('<style>')[0])
        # Remove HTML tags
        import re
        text_content = re.sub(r'<[^>]+>', '', text_content)
    
    # Attach parts
    part1 = MIMEText(text_content, 'plain')
    part2 = MIMEText(html_content, 'html')
    msg.attach(part1)
    msg.attach(part2)
    
    # Add attachments if any
    if attachments:
        for file_path in attachments:
            try:
                with open(file_path, 'rb') as file:
                    part = MIMEApplication(file.read(), Name=os.path.basename(file_path))
                    part['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
                    msg.attach(part)
            except Exception as e:
                logger.error(f"Error attaching file {file_path}: {str(e)}")
    
    try:
        # Connect to SMTP server
        context = ssl.create_default_context()
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            if EMAIL_USE_TLS:
                server.starttls(context=context)
            server.login(EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
            server.sendmail(EMAIL_FROM, to_email, msg.as_string())
        logger.info(f"Email sent to {to_email}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

def render_template(template_name, context):
    """
    Render an email template with the given context.
    
    Args:
        template_name: Name of the template file (without extension)
        context: Dictionary of variables to pass to the template
    
    Returns:
        Rendered HTML content
    """
    try:
        template = jinja_env.get_template(f"{template_name}.html")
        return template.render(**context)
    except Exception as e:
        logger.error(f"Error rendering template {template_name}: {str(e)}")
        # Fallback to a simple message
        return f"""
        <html>
        <body>
            <h1>{context.get('subject', 'GigGatek Notification')}</h1>
            <p>There was an error rendering this email template.</p>
            <p>Please contact support for assistance.</p>
        </body>
        </html>
        """

# Account-related email functions

def send_welcome_email(user_email, user_name):
    """
    Send a welcome email to a newly registered user.
    
    Args:
        user_email: User's email address
        user_name: User's first name
    """
    subject = "Welcome to GigGatek!"
    context = {
        'user_name': user_name,
        'current_year': datetime.now().year,
        'subject': subject
    }
    html_content = render_template('welcome', context)
    return send_email_async(user_email, subject, html_content)

def send_password_reset_email(user_email, user_name, reset_token, reset_url=None):
    """
    Send a password reset email.
    
    Args:
        user_email: User's email address
        user_name: User's first name
        reset_token: Password reset token
        reset_url: Full URL for password reset (optional)
    """
    if reset_url is None:
        reset_url = f"https://giggatek.com/reset-password?token={reset_token}"
    
    subject = "GigGatek Password Reset"
    context = {
        'user_name': user_name,
        'reset_url': reset_url,
        'reset_token': reset_token,
        'expires_in': '1 hour',
        'current_year': datetime.now().year,
        'subject': subject
    }
    html_content = render_template('password_reset', context)
    return send_email_async(user_email, subject, html_content)

def send_account_verification_email(user_email, user_name, verification_token, verification_url=None):
    """
    Send an account verification email.
    
    Args:
        user_email: User's email address
        user_name: User's first name
        verification_token: Account verification token
        verification_url: Full URL for verification (optional)
    """
    if verification_url is None:
        verification_url = f"https://giggatek.com/verify-account?token={verification_token}"
    
    subject = "Verify Your GigGatek Account"
    context = {
        'user_name': user_name,
        'verification_url': verification_url,
        'verification_token': verification_token,
        'expires_in': '24 hours',
        'current_year': datetime.now().year,
        'subject': subject
    }
    html_content = render_template('account_verification', context)
    return send_email_async(user_email, subject, html_content)

# Order-related email functions

def send_order_confirmation_email(user_email, user_name, order_data):
    """
    Send an order confirmation email.
    
    Args:
        user_email: User's email address
        user_name: User's first name
        order_data: Dictionary containing order details (id, date, items, totals, etc.)
    """
    subject = f"Order Confirmation #{order_data['id']}"
    context = {
        'user_name': user_name,
        'order': order_data,
        'current_year': datetime.now().year,
        'subject': subject
    }
    html_content = render_template('order_confirmation', context)
    return send_email_async(user_email, subject, html_content)

def send_order_status_update_email(user_email, user_name, order_data, old_status, new_status):
    """
    Send an order status update email.
    
    Args:
        user_email: User's email address
        user_name: User's first name
        order_data: Dictionary containing order details
        old_status: Previous order status
        new_status: New order status
    """
    subject = f"Order #{order_data['id']} Status Update"
    context = {
        'user_name': user_name,
        'order': order_data,
        'old_status': old_status,
        'new_status': new_status,
        'current_year': datetime.now().year,
        'subject': subject
    }
    html_content = render_template('order_status_update', context)
    return send_email_async(user_email, subject, html_content)

def send_shipping_confirmation_email(user_email, user_name, order_data, tracking_number, carrier):
    """
    Send a shipping confirmation email.
    
    Args:
        user_email: User's email address
        user_name: User's first name
        order_data: Dictionary containing order details
        tracking_number: Shipment tracking number
        carrier: Shipping carrier (USPS, FedEx, etc.)
    """
    subject = f"Your GigGatek Order #{order_data['id']} Has Shipped"
    context = {
        'user_name': user_name,
        'order': order_data,
        'tracking_number': tracking_number,
        'carrier': carrier,
        'current_year': datetime.now().year,
        'subject': subject
    }
    html_content = render_template('shipping_confirmation', context)
    return send_email_async(user_email, subject, html_content)

# Rental-related email functions

def send_rental_confirmation_email(user_email, user_name, rental_data):
    """
    Send a rental confirmation email.
    
    Args:
        user_email: User's email address
        user_name: User's first name
        rental_data: Dictionary containing rental details
    """
    subject = f"Rental Confirmation #{rental_data['id']}"
    context = {
        'user_name': user_name,
        'rental': rental_data,
        'current_year': datetime.now().year,
        'subject': subject
    }
    html_content = render_template('rental_confirmation', context)
    return send_email_async(user_email, subject, html_content)

def send_rental_payment_reminder_email(user_email, user_name, rental_data, days_until_due):
    """
    Send a rental payment reminder email.
    
    Args:
        user_email: User's email address
        user_name: User's first name
        rental_data: Dictionary containing rental details
        days_until_due: Number of days until payment is due
    """
    subject = f"Payment Reminder for Rental #{rental_data['id']}"
    payment_date = datetime.strptime(rental_data['next_payment_date'], '%Y-%m-%d')
    
    context = {
        'user_name': user_name,
        'rental': rental_data,
        'payment_date': payment_date.strftime('%B %d, %Y'),
        'days_until_due': days_until_due,
        'amount_due': rental_data['monthly_rate'],
        'current_year': datetime.now().year,
        'subject': subject
    }
    html_content = render_template('rental_payment_reminder', context)
    return send_email_async(user_email, subject, html_content)

def send_rental_payment_receipt_email(user_email, user_name, rental_data, payment_data):
    """
    Send a rental payment receipt email.
    
    Args:
        user_email: User's email address
        user_name: User's first name
        rental_data: Dictionary containing rental details
        payment_data: Dictionary containing payment details
    """
    subject = f"Payment Receipt for Rental #{rental_data['id']}"
    context = {
        'user_name': user_name,
        'rental': rental_data,
        'payment': payment_data,
        'current_year': datetime.now().year,
        'subject': subject
    }
    html_content = render_template('rental_payment_receipt', context)
    return send_email_async(user_email, subject, html_content)

def send_rental_completion_email(user_email, user_name, rental_data):
    """
    Send a rental completion email when all payments are made.
    
    Args:
        user_email: User's email address
        user_name: User's first name
        rental_data: Dictionary containing rental details
    """
    subject = f"Congratulations on Completing Your Rental #{rental_data['id']}"
    context = {
        'user_name': user_name,
        'rental': rental_data,
        'current_year': datetime.now().year,
        'subject': subject
    }
    html_content = render_template('rental_completion', context)
    return send_email_async(user_email, subject, html_content)

# ---------------
# Batch email functions for administrative purposes
# ---------------

def send_upcoming_payment_reminders(db_connection):
    """
    Send payment reminders for rentals with payments due in the next 7 days.
    This function would typically be called by a scheduled task/cron job.
    
    Args:
        db_connection: Database connection object
    """
    cursor = db_connection.cursor(dictionary=True)
    
    # Get rentals with payments due in the next 7 days
    upcoming_date = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
    
    try:
        cursor.execute("""
            SELECT r.*, u.email, u.first_name, p.name as product_name
            FROM rentals r
            JOIN users u ON r.user_id = u.id
            JOIN products p ON r.product_id = p.id
            WHERE r.status = 'active'
            AND r.next_payment_date <= %s
            ORDER BY r.next_payment_date ASC
        """, (upcoming_date,))
        
        rentals = cursor.fetchall()
        
        for rental in rentals:
            payment_date = datetime.strptime(str(rental['next_payment_date']), '%Y-%m-%d')
            days_until_due = (payment_date - datetime.now()).days + 1
            
            # Skip if payment is already overdue
            if days_until_due < 0:
                continue
            
            send_rental_payment_reminder_email(
                rental['email'],
                rental['first_name'],
                rental,
                days_until_due
            )
            
            # Log that reminder was sent
            cursor.execute("""
                INSERT INTO email_log (
                    user_id, email_type, reference_id, sent_at
                ) VALUES (%s, %s, %s, NOW())
            """, (
                rental['user_id'],
                'rental_payment_reminder',
                rental['id']
            ))
        
        db_connection.commit()
        
    except Exception as e:
        logger.error(f"Error sending payment reminders: {str(e)}")
        db_connection.rollback()
    finally:
        cursor.close()

def send_order_update_digest(db_connection):
    """
    Send a digest of order updates for orders that have changed status in the last 24 hours.
    This function would typically be called by a scheduled task/cron job.
    
    Args:
        db_connection: Database connection object
    """
    cursor = db_connection.cursor(dictionary=True)
    
    try:
        # Get orders with status changes in the last 24 hours
        cursor.execute("""
            SELECT o.*, u.email, u.first_name, osh.old_status, osh.new_status, osh.created_at
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN (
                SELECT order_id, status as new_status,
                       LAG(status) OVER (PARTITION BY order_id ORDER BY created_at) as old_status,
                       created_at
                FROM order_status_history
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            ) osh ON o.id = osh.order_id
            WHERE osh.old_status IS NOT NULL
            ORDER BY u.id, o.id
        """)
        
        orders = cursor.fetchall()
        
        # Group orders by user
        user_orders = {}
        for order in orders:
            user_id = order['user_id']
            if user_id not in user_orders:
                user_orders[user_id] = {
                    'email': order['email'],
                    'first_name': order['first_name'],
                    'orders': []
                }
            user_orders[user_id]['orders'].append(order)
        
        # Send digest emails
        for user_id, data in user_orders.items():
            subject = f"GigGatek Order Updates"
            context = {
                'user_name': data['first_name'],
                'orders': data['orders'],
                'current_year': datetime.now().year,
                'subject': subject
            }
            html_content = render_template('order_update_digest', context)
            send_email_async(data['email'], subject, html_content)
            
            # Log that digest was sent
            cursor.execute("""
                INSERT INTO email_log (
                    user_id, email_type, reference_id, sent_at
                ) VALUES (%s, %s, %s, NOW())
            """, (
                user_id,
                'order_update_digest',
                None
            ))
        
        db_connection.commit()
        
    except Exception as e:
        logger.error(f"Error sending order update digests: {str(e)}")
        db_connection.rollback()
    finally:
        cursor.close()

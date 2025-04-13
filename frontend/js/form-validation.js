/**
 * GigGatek Form Validation Module
 * Provides reusable form validation functionality across the site
 */

class FormValidator {
    constructor(options = {}) {
        // Default options
        this.options = {
            errorClass: options.errorClass || 'form-error',
            successClass: options.successClass || 'form-success',
            errorMessageClass: options.errorMessageClass || 'error-message',
            validateOnBlur: options.validateOnBlur !== undefined ? options.validateOnBlur : true,
            validateOnInput: options.validateOnInput !== undefined ? options.validateOnInput : false,
            showSuccessState: options.showSuccessState !== undefined ? options.showSuccessState : true
        };
        
        // Store validation rules
        this.rules = {};
        
        // Store form elements
        this.form = null;
        this.fields = {};
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    /**
     * Initialize the form validator
     */
    init() {
        // Look for forms with data-validate attribute
        const forms = document.querySelectorAll('form[data-validate]');
        
        forms.forEach(form => {
            this.setupForm(form);
        });
    }
    
    /**
     * Setup validation for a specific form
     * @param {HTMLFormElement} form - The form element to validate
     * @param {Object} customRules - Custom validation rules for this form
     */
    setupForm(form, customRules = {}) {
        this.form = form;
        
        // Merge custom rules with default rules
        this.rules = { ...this.getDefaultRules(), ...customRules };
        
        // Get all form fields with data-validate attribute
        const fields = form.querySelectorAll('[data-validate]');
        
        // Store fields and add event listeners
        fields.forEach(field => {
            const name = field.name || field.id;
            this.fields[name] = field;
            
            // Add validation events
            if (this.options.validateOnBlur) {
                field.addEventListener('blur', () => this.validateField(field));
            }
            
            if (this.options.validateOnInput) {
                field.addEventListener('input', () => this.validateField(field));
            }
        });
        
        // Add form submit event listener
        form.addEventListener('submit', (e) => {
            const isValid = this.validateForm();
            
            if (!isValid) {
                e.preventDefault();
                
                // Focus the first invalid field
                const firstInvalidField = form.querySelector(`.${this.options.errorClass}`);
                if (firstInvalidField) {
                    firstInvalidField.focus();
                }
            }
        });
    }
    
    /**
     * Get default validation rules
     * @returns {Object} Default validation rules
     */
    getDefaultRules() {
        return {
            required: {
                validate: value => value.trim() !== '',
                message: 'This field is required'
            },
            email: {
                validate: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
                message: 'Please enter a valid email address'
            },
            phone: {
                validate: value => /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(value.trim()),
                message: 'Please enter a valid phone number'
            },
            zipcode: {
                validate: value => /^\d{5}(-\d{4})?$/.test(value.trim()),
                message: 'Please enter a valid ZIP code'
            },
            password: {
                validate: value => value.length >= 8,
                message: 'Password must be at least 8 characters long'
            },
            passwordStrength: {
                validate: value => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value),
                message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
            },
            creditCard: {
                validate: value => {
                    // Remove spaces and dashes
                    const cardNumber = value.replace(/[\s-]/g, '');
                    
                    // Check if the card number contains only digits
                    if (!/^\d+$/.test(cardNumber)) return false;
                    
                    // Check length (13-19 digits)
                    if (cardNumber.length < 13 || cardNumber.length > 19) return false;
                    
                    // Luhn algorithm (mod 10)
                    let sum = 0;
                    let double = false;
                    
                    // Loop from right to left
                    for (let i = cardNumber.length - 1; i >= 0; i--) {
                        let digit = parseInt(cardNumber.charAt(i));
                        
                        if (double) {
                            digit *= 2;
                            if (digit > 9) digit -= 9;
                        }
                        
                        sum += digit;
                        double = !double;
                    }
                    
                    return sum % 10 === 0;
                },
                message: 'Please enter a valid credit card number'
            },
            cvv: {
                validate: value => /^[0-9]{3,4}$/.test(value.trim()),
                message: 'Please enter a valid CVV code'
            },
            date: {
                validate: value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value)),
                message: 'Please enter a valid date in YYYY-MM-DD format'
            },
            minLength: {
                validate: (value, length) => value.length >= length,
                message: (length) => `Must be at least ${length} characters long`
            },
            maxLength: {
                validate: (value, length) => value.length <= length,
                message: (length) => `Must be no more than ${length} characters long`
            },
            min: {
                validate: (value, min) => parseFloat(value) >= min,
                message: (min) => `Must be at least ${min}`
            },
            max: {
                validate: (value, max) => parseFloat(value) <= max,
                message: (max) => `Must be no more than ${max}`
            },
            pattern: {
                validate: (value, pattern) => new RegExp(pattern).test(value),
                message: 'Please enter a valid value'
            },
            match: {
                validate: (value, targetField) => {
                    const targetValue = document.getElementById(targetField)?.value || '';
                    return value === targetValue;
                },
                message: (targetField) => {
                    const targetLabel = document.querySelector(`label[for="${targetField}"]`)?.textContent || 'other field';
                    return `Must match ${targetLabel}`;
                }
            }
        };
    }
    
    /**
     * Validate a specific field
     * @param {HTMLElement} field - The field to validate
     * @returns {boolean} Whether the field is valid
     */
    validateField(field) {
        // Get validation rules from data attribute
        const validationRules = field.dataset.validate.split(' ');
        const value = field.value;
        let isValid = true;
        let errorMessage = '';
        
        // Check each validation rule
        for (const rule of validationRules) {
            // Check if rule has parameters (e.g., minLength:8)
            const [ruleName, ruleParam] = rule.split(':');
            
            // Skip if rule doesn't exist
            if (!this.rules[ruleName]) continue;
            
            // Validate field
            const ruleObj = this.rules[ruleName];
            const isRuleValid = ruleParam 
                ? ruleObj.validate(value, ruleParam) 
                : ruleObj.validate(value);
            
            if (!isRuleValid) {
                isValid = false;
                errorMessage = typeof ruleObj.message === 'function' 
                    ? ruleObj.message(ruleParam) 
                    : ruleObj.message;
                break;
            }
        }
        
        // Update field state
        this.updateFieldState(field, isValid, errorMessage);
        
        return isValid;
    }
    
    /**
     * Validate the entire form
     * @returns {boolean} Whether the form is valid
     */
    validateForm() {
        let isValid = true;
        
        // Validate each field
        for (const fieldName in this.fields) {
            const field = this.fields[fieldName];
            const fieldValid = this.validateField(field);
            
            if (!fieldValid) {
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    /**
     * Update field state (valid/invalid)
     * @param {HTMLElement} field - The field to update
     * @param {boolean} isValid - Whether the field is valid
     * @param {string} errorMessage - Error message to display
     */
    updateFieldState(field, isValid, errorMessage) {
        // Remove existing state classes
        field.classList.remove(this.options.errorClass, this.options.successClass);
        
        // Remove existing error message
        const existingErrorMessage = field.parentNode.querySelector(`.${this.options.errorMessageClass}`);
        if (existingErrorMessage) {
            existingErrorMessage.remove();
        }
        
        if (isValid) {
            // Add success class if enabled
            if (this.options.showSuccessState) {
                field.classList.add(this.options.successClass);
            }
        } else {
            // Add error class
            field.classList.add(this.options.errorClass);
            
            // Add error message
            const errorElement = document.createElement('div');
            errorElement.className = this.options.errorMessageClass;
            errorElement.textContent = errorMessage;
            
            // Insert after the field
            field.parentNode.insertBefore(errorElement, field.nextSibling);
        }
    }
    
    /**
     * Reset form validation state
     */
    resetForm() {
        for (const fieldName in this.fields) {
            const field = this.fields[fieldName];
            
            // Remove state classes
            field.classList.remove(this.options.errorClass, this.options.successClass);
            
            // Remove error messages
            const errorMessage = field.parentNode.querySelector(`.${this.options.errorMessageClass}`);
            if (errorMessage) {
                errorMessage.remove();
            }
        }
    }
    
    /**
     * Add a custom validation rule
     * @param {string} name - Rule name
     * @param {Function} validateFn - Validation function
     * @param {string|Function} message - Error message or function that returns a message
     */
    addRule(name, validateFn, message) {
        this.rules[name] = {
            validate: validateFn,
            message: message
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create global form validator instance
    window.formValidator = new FormValidator();
});

// Export for module usage
export default FormValidator;

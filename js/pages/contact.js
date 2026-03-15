/**
 * Contact Page Module
 * Handles contact page functionality and form handling
 */

const ContactPage = (function() {
    'use strict';
    
    // Private variables
    let contactForm = null;
    
    /**
     * Initialize contact page
     */
    function init() {
        console.log('Contact page initialized');
        
        contactForm = document.getElementById('contactForm');
        
        if (contactForm) {
            setupFormHandler();
        }
        
        // Initialize extensible section
        initExtensibleSection();
        
        // Add input animations
        initInputAnimations();
    }
    
    /**
     * Set up form submission handler
     */
    function setupFormHandler() {
        contactForm.addEventListener('submit', handleFormSubmit);
        
        // Add real-time validation
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
    }
    
    /**
     * Handle form submission
     * @param {Event} e - Submit event
     */
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            showFormError('Please fill in all required fields correctly.');
            return;
        }
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());
        
        // Show loading state
        const submitBtn = contactForm.querySelector('.btn-submit');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        try {
            // Simulate API call (replace with actual fetch)
            await simulateApiCall(data);
            
            // Show success message
            showFormSuccess('Message sent successfully!');
            contactForm.reset();
            
        } catch (error) {
            console.error('Form submission error:', error);
            showFormError('Failed to send message. Please try again.');
            
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    
    /**
     * Simulate API call for demonstration
     * @param {Object} data - Form data
     * @returns {Promise}
     */
    function simulateApiCall(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Form data:', data);
                resolve({ success: true });
            }, 1500);
        });
    }
    
    /**
     * Validate entire form
     * @returns {boolean} True if form is valid
     */
    function validateForm() {
        let isValid = true;
        const inputs = contactForm.querySelectorAll('input[required], textarea[required]');
        
        inputs.forEach(input => {
            if (!validateField({ target: input })) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    /**
     * Validate individual field
     * @param {Event} e - Blur event
     * @returns {boolean} True if field is valid
     */
    function validateField(e) {
        const field = e.target;
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Remove existing error
        clearFieldError(e);
        
        // Check if empty
        if (field.required && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }
        
        // Show error if invalid
        if (!isValid) {
            showFieldError(field, errorMessage);
        }
        
        return isValid;
    }
    
    /**
     * Show field error
     * @param {HTMLElement} field - Field element
     * @param {string} message - Error message
     */
    function showFieldError(field, message) {
        field.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#dc2626';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        
        field.parentNode.appendChild(errorDiv);
    }
    
    /**
     * Clear field error
     * @param {Event} e - Input event
     */
    function clearFieldError(e) {
        const field = e.target;
        field.classList.remove('error');
        
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
    
    /**
     * Show form error message
     * @param {string} message - Error message
     */
    function showFormError(message) {
        showFormMessage(message, 'error');
    }
    
    /**
     * Show form success message
     * @param {string} message - Success message
     */
    function showFormSuccess(message) {
        showFormMessage(message, 'success');
    }
    
    /**
     * Show form message
     * @param {string} message - Message text
     * @param {string} type - Message type ('error' or 'success')
     */
    function showFormMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message form-message-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.padding = '1rem';
        messageDiv.style.marginTop = '1rem';
        messageDiv.style.borderRadius = '0.5rem';
        messageDiv.style.backgroundColor = type === 'error' ? '#fee2e2' : '#dcfce7';
        messageDiv.style.color = type === 'error' ? '#dc2626' : '#166534';
        
        contactForm.appendChild(messageDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
    
    /**
     * Initialize extensible section for future features
     */
    function initExtensibleSection() {
        const extensibleSection = document.getElementById('extensibleSection');
        
        if (extensibleSection) {
            // This section can be dynamically populated with:
            // - Blog posts
            // - Authentication forms
            // - Newsletter signup
            // - etc.
            
            // Example structure for future extensions
            const extensionPoint = document.createElement('div');
            extensionPoint.className = 'extension-point';
            extensionPoint.setAttribute('data-extension', 'true');
            
            extensibleSection.appendChild(extensionPoint);
        }
    }
    
    /**
     * Initialize input animations
     */
    function initInputAnimations() {
        const formGroups = document.querySelectorAll('.form-group');
        
        formGroups.forEach(group => {
            const input = group.querySelector('input, textarea');
            const label = group.querySelector('label');
            
            if (input && label) {
                // Check if input has value on load
                if (input.value) {
                    label.classList.add('float');
                }
                
                // Add focus/blur handlers
                input.addEventListener('focus', () => {
                    label.classList.add('float');
                });
                
                input.addEventListener('blur', () => {
                    if (!input.value) {
                        label.classList.remove('float');
                    }
                });
            }
        });
    }
    
    /**
     * Load dynamic content for extensible sections
     * @param {string} section - Section name to load content for
     * @param {Object} data - Data to populate section
     */
    function loadExtensionContent(section, data) {
        // This function can be extended to load various types of content
        const extensionPoint = document.querySelector(`[data-extension="${section}"]`);
        
        if (extensionPoint) {
            // Populate based on section type
            switch(section) {
                case 'blog':
                    // Load blog posts
                    break;
                case 'auth':
                    // Load authentication forms
                    break;
                default:
                    console.log(`Loading content for ${section}`);
            }
        }
    }
    
    // Public API
    return {
        init,
        loadExtensionContent
    };
})();
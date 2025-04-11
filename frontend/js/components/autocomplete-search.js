/**
 * Autocomplete Search Component
 * 
 * This component provides autocomplete search functionality.
 */

class AutocompleteSearch {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    
    if (!this.container) {
      throw new Error('Container element not found');
    }
    
    this.options = {
      placeholder: 'Search products...',
      minChars: 2,
      delay: 300,
      maxResults: 5,
      apiEndpoint: '/api/v1/search/suggestions',
      onSelect: null,
      onSearch: null,
      ...options
    };
    
    this.state = {
      query: '',
      suggestions: [],
      loading: false,
      focused: false,
      selectedIndex: -1,
      debounceTimer: null
    };
    
    this.init();
  }
  
  /**
   * Initialize component
   */
  init() {
    // Create component structure
    this.render();
    
    // Add event listeners
    this.addEventListeners();
  }
  
  /**
   * Render component
   */
  render() {
    this.container.innerHTML = `
      <div class="autocomplete-search">
        <div class="search-input-wrapper">
          <input type="text" class="search-input" placeholder="${this.options.placeholder}" value="${this.state.query}">
          <button type="button" class="search-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          <button type="button" class="clear-button ${this.state.query ? '' : 'hidden'}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div class="search-loader ${this.state.loading ? '' : 'hidden'}"></div>
        </div>
        <div class="suggestions-container ${this.state.focused && this.state.suggestions.length > 0 ? '' : 'hidden'}">
          <ul class="suggestions-list">
            ${this.renderSuggestions()}
          </ul>
        </div>
      </div>
    `;
    
    // Store references to elements
    this.elements = {
      input: this.container.querySelector('.search-input'),
      searchButton: this.container.querySelector('.search-button'),
      clearButton: this.container.querySelector('.clear-button'),
      loader: this.container.querySelector('.search-loader'),
      suggestionsContainer: this.container.querySelector('.suggestions-container'),
      suggestionsList: this.container.querySelector('.suggestions-list')
    };
  }
  
  /**
   * Render suggestions
   * 
   * @returns {string} Suggestions HTML
   */
  renderSuggestions() {
    if (!this.state.suggestions.length) {
      return '';
    }
    
    return this.state.suggestions.map((suggestion, index) => `
      <li class="suggestion-item ${index === this.state.selectedIndex ? 'selected' : ''}" data-index="${index}">
        ${this.renderSuggestionContent(suggestion)}
      </li>
    `).join('');
  }
  
  /**
   * Render suggestion content
   * 
   * @param {Object} suggestion - Suggestion data
   * @returns {string} Suggestion content HTML
   */
  renderSuggestionContent(suggestion) {
    if (suggestion.type === 'product') {
      return `
        <div class="suggestion-product">
          ${suggestion.image_url ? `<img src="${suggestion.image_url}" alt="${suggestion.text}" class="suggestion-image">` : ''}
          <div class="suggestion-details">
            <div class="suggestion-text">${this.highlightMatch(suggestion.text, this.state.query)}</div>
            ${suggestion.category ? `<div class="suggestion-category">${suggestion.category}</div>` : ''}
          </div>
        </div>
      `;
    } else {
      return `
        <div class="suggestion-text">${this.highlightMatch(suggestion.text, this.state.query)}</div>
      `;
    }
  }
  
  /**
   * Highlight matching text
   * 
   * @param {string} text - Text to highlight
   * @param {string} query - Query to match
   * @returns {string} Highlighted text
   */
  highlightMatch(text, query) {
    if (!query) {
      return text;
    }
    
    const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
  }
  
  /**
   * Add event listeners
   */
  addEventListeners() {
    // Input event
    if (this.elements.input) {
      this.elements.input.addEventListener('input', () => {
        this.state.query = this.elements.input.value;
        this.updateClearButton();
        this.debounceFetchSuggestions();
      });
      
      this.elements.input.addEventListener('focus', () => {
        this.state.focused = true;
        this.updateSuggestionsVisibility();
      });
      
      this.elements.input.addEventListener('blur', () => {
        // Delay hiding suggestions to allow clicking on them
        setTimeout(() => {
          this.state.focused = false;
          this.updateSuggestionsVisibility();
        }, 200);
      });
      
      this.elements.input.addEventListener('keydown', (event) => {
        this.handleKeyNavigation(event);
      });
    }
    
    // Search button
    if (this.elements.searchButton) {
      this.elements.searchButton.addEventListener('click', () => {
        this.search();
      });
    }
    
    // Clear button
    if (this.elements.clearButton) {
      this.elements.clearButton.addEventListener('click', () => {
        this.clearSearch();
      });
    }
    
    // Suggestions list
    if (this.elements.suggestionsList) {
      this.elements.suggestionsList.addEventListener('click', (event) => {
        const item = event.target.closest('.suggestion-item');
        if (item) {
          const index = parseInt(item.dataset.index);
          this.selectSuggestion(index);
        }
      });
    }
  }
  
  /**
   * Handle keyboard navigation
   * 
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyNavigation(event) {
    // If suggestions are not visible, don't handle navigation
    if (!this.state.focused || !this.state.suggestions.length) {
      return;
    }
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.state.selectedIndex = Math.min(this.state.selectedIndex + 1, this.state.suggestions.length - 1);
        this.updateSelectedSuggestion();
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        this.state.selectedIndex = Math.max(this.state.selectedIndex - 1, -1);
        this.updateSelectedSuggestion();
        break;
        
      case 'Enter':
        event.preventDefault();
        if (this.state.selectedIndex >= 0) {
          this.selectSuggestion(this.state.selectedIndex);
        } else {
          this.search();
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        this.state.focused = false;
        this.updateSuggestionsVisibility();
        this.elements.input.blur();
        break;
    }
  }
  
  /**
   * Update selected suggestion
   */
  updateSelectedSuggestion() {
    const items = this.elements.suggestionsList.querySelectorAll('.suggestion-item');
    
    items.forEach((item, index) => {
      if (index === this.state.selectedIndex) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
  }
  
  /**
   * Update clear button visibility
   */
  updateClearButton() {
    if (this.elements.clearButton) {
      if (this.state.query) {
        this.elements.clearButton.classList.remove('hidden');
      } else {
        this.elements.clearButton.classList.add('hidden');
      }
    }
  }
  
  /**
   * Update suggestions visibility
   */
  updateSuggestionsVisibility() {
    if (this.elements.suggestionsContainer) {
      if (this.state.focused && this.state.suggestions.length > 0) {
        this.elements.suggestionsContainer.classList.remove('hidden');
      } else {
        this.elements.suggestionsContainer.classList.add('hidden');
      }
    }
  }
  
  /**
   * Debounce fetch suggestions
   */
  debounceFetchSuggestions() {
    // Clear previous timer
    if (this.state.debounceTimer) {
      clearTimeout(this.state.debounceTimer);
    }
    
    // If query is too short, clear suggestions
    if (!this.state.query || this.state.query.length < this.options.minChars) {
      this.state.suggestions = [];
      this.state.selectedIndex = -1;
      this.render();
      return;
    }
    
    // Set new timer
    this.state.debounceTimer = setTimeout(() => {
      this.fetchSuggestions();
    }, this.options.delay);
  }
  
  /**
   * Fetch suggestions from API
   */
  async fetchSuggestions() {
    // Skip if query is too short
    if (!this.state.query || this.state.query.length < this.options.minChars) {
      return;
    }
    
    // Set loading state
    this.state.loading = true;
    this.updateLoader();
    
    try {
      // Build API URL
      const url = new URL(this.options.apiEndpoint, window.location.origin);
      url.searchParams.append('q', this.state.query);
      url.searchParams.append('limit', this.options.maxResults);
      
      // Fetch suggestions
      const response = await fetch(url);
      const data = await response.json();
      
      // Update state
      this.state.suggestions = data.suggestions || [];
      this.state.selectedIndex = -1;
      
      // Update UI
      this.render();
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      this.state.suggestions = [];
      this.state.selectedIndex = -1;
      this.render();
    } finally {
      // Clear loading state
      this.state.loading = false;
      this.updateLoader();
    }
  }
  
  /**
   * Update loader visibility
   */
  updateLoader() {
    if (this.elements.loader) {
      if (this.state.loading) {
        this.elements.loader.classList.remove('hidden');
      } else {
        this.elements.loader.classList.add('hidden');
      }
    }
  }
  
  /**
   * Select suggestion
   * 
   * @param {number} index - Suggestion index
   */
  selectSuggestion(index) {
    const suggestion = this.state.suggestions[index];
    
    if (!suggestion) {
      return;
    }
    
    // Handle different suggestion types
    if (suggestion.type === 'product') {
      // Set input value to product name
      this.state.query = suggestion.text;
      this.elements.input.value = suggestion.text;
      
      // Hide suggestions
      this.state.focused = false;
      this.updateSuggestionsVisibility();
      
      // Call onSelect callback
      if (typeof this.options.onSelect === 'function') {
        this.options.onSelect(suggestion);
      }
    } else {
      // For category, brand, or feature suggestions, search with that filter
      this.search(suggestion);
    }
  }
  
  /**
   * Search
   * 
   * @param {Object} suggestion - Selected suggestion (optional)
   */
  search(suggestion = null) {
    // Skip if query is empty
    if (!this.state.query && !suggestion) {
      return;
    }
    
    // Hide suggestions
    this.state.focused = false;
    this.updateSuggestionsVisibility();
    
    // Call onSearch callback
    if (typeof this.options.onSearch === 'function') {
      this.options.onSearch(this.state.query, suggestion);
    }
  }
  
  /**
   * Clear search
   */
  clearSearch() {
    // Clear query
    this.state.query = '';
    this.elements.input.value = '';
    
    // Clear suggestions
    this.state.suggestions = [];
    this.state.selectedIndex = -1;
    
    // Update UI
    this.updateClearButton();
    this.updateSuggestionsVisibility();
    
    // Focus input
    this.elements.input.focus();
  }
  
  /**
   * Set query
   * 
   * @param {string} query - Search query
   */
  setQuery(query) {
    this.state.query = query;
    this.elements.input.value = query;
    this.updateClearButton();
    
    if (query) {
      this.debounceFetchSuggestions();
    } else {
      this.state.suggestions = [];
      this.state.selectedIndex = -1;
      this.updateSuggestionsVisibility();
    }
  }
  
  /**
   * Get query
   * 
   * @returns {string} Current query
   */
  getQuery() {
    return this.state.query;
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AutocompleteSearch;
}

/**
 * GigGatek Frontend Monitoring Module
 * 
 * Provides client-side monitoring, error tracking, and performance metrics
 * reporting for the frontend application. Works with the ELK stack and
 * Prometheus monitoring system.
 */

const GigGatekMonitoring = (function() {
  // Configuration
  const config = {
    enabled: true,
    debug: false,
    apiEndpoint: '/api/logs',
    performanceEndpoint: '/api/metrics',
    sampleRate: 0.1, // Sample 10% of users for performance metrics
    errorSampleRate: 1.0, // Capture 100% of errors
    environment: window.ENVIRONMENT || 'production'
  };

  // Performance metrics
  let performanceTimings = {};
  let resourceTimings = [];
  
  // Error tracking
  let errorCount = 0;
  let lastError = null;
  
  // User session info
  const sessionId = generateSessionId();
  const deviceInfo = collectDeviceInfo();
  let userId = null;
  
  /**
   * Initialize the monitoring system
   * @param {Object} options - Configuration options
   */
  function init(options = {}) {
    // Merge options with defaults
    Object.assign(config, options);
    
    // Only run if enabled
    if (!config.enabled) return;
    
    // Set user ID if available
    if (window.auth && window.auth.user) {
      userId = window.auth.user.id;
    }
    
    // Initialize error tracking
    setupErrorTracking();
    
    // Initialize performance monitoring
    setupPerformanceMonitoring();
    
    // Log initialization
    if (config.debug) {
      console.log('GigGatek Monitoring initialized', { 
        sessionId, 
        deviceInfo,
        config 
      });
    }
    
    // Initial page view tracking
    trackPageView();
  }
  
  /**
   * Generate a unique session ID
   * @returns {string} Session ID
   */
  function generateSessionId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  /**
   * Collect device and browser information
   * @returns {Object} Device information
   */
  function collectDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screenSize: {
        width: window.screen.width,
        height: window.screen.height
      },
      pixelRatio: window.devicePixelRatio,
      platform: navigator.platform,
      doNotTrack: navigator.doNotTrack,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        rtt: navigator.connection.rtt,
        downlink: navigator.connection.downlink
      } : null
    };
  }
  
  /**
   * Set up error tracking
   */
  function setupErrorTracking() {
    // Global error handler
    window.addEventListener('error', function(event) {
      const error = {
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error ? event.error.stack : null
      };
      
      captureError('js_error', error);
      
      return false;
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', function(event) {
      const error = {
        message: event.reason ? (event.reason.message || 'Unhandled Promise rejection') : 'Unhandled Promise rejection',
        stack: event.reason && event.reason.stack ? event.reason.stack : null
      };
      
      captureError('unhandled_promise', error);
      
      return false;
    });
    
    // Ajax error tracking
    const originalFetch = window.fetch;
    window.fetch = async function(resource, options) {
      const startTime = performance.now();
      try {
        const response = await originalFetch(resource, options);
        const endTime = performance.now();
        
        // Track API performance
        if (typeof resource === 'string' && resource.includes('/api/')) {
          trackApiPerformance(
            resource,
            options ? options.method || 'GET' : 'GET',
            response.status,
            endTime - startTime
          );
        }
        
        // Track non-OK responses
        if (!response.ok) {
          captureError('api_error', {
            url: resource,
            method: options ? options.method || 'GET' : 'GET',
            status: response.status,
            statusText: response.statusText,
            duration: endTime - startTime
          });
        }
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        
        // Track network errors
        captureError('network_error', {
          url: resource,
          method: options ? options.method || 'GET' : 'GET',
          error: error.message,
          duration: endTime - startTime
        });
        
        throw error;
      }
    };
  }
  
  /**
   * Set up performance monitoring
   */
  function setupPerformanceMonitoring() {
    // Only monitor a sample of users for performance
    if (Math.random() > config.sampleRate) return;
    
    // Capture navigation timings
    if (performance && performance.timing) {
      // Wait for the page to load
      window.addEventListener('load', function() {
        // Give browser time to finalize performance metrics
        setTimeout(function() {
          collectPerformanceMetrics();
        }, 1000);
      });
    }
    
    // Set up PerformanceObserver for future metrics
    if (window.PerformanceObserver) {
      // Monitor resource timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          // Filter out non-critical or third-party resources to reduce noise
          const criticalEntries = entries.filter(entry => {
            // Only track resources from our domain or API
            return entry.name.includes(window.location.host) ||
                   (entry.initiatorType === 'fetch' && entry.name.includes('/api/'));
          });
          
          resourceTimings.push(...criticalEntries);
        });
        
        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (e) {
        if (config.debug) {
          console.error('Resource timing observer failed:', e);
        }
      }
      
      // Monitor Paint metrics (Core Web Vitals)
      try {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // Report FCP and LCP for Core Web Vitals
            if (entry.name === 'first-contentful-paint' || entry.name === 'largest-contentful-paint') {
              sendPerformanceMetric(entry.name, entry.startTime);
            }
          }
        });
        
        paintObserver.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
      } catch (e) {
        if (config.debug) {
          console.error('Paint observer failed:', e);
        }
      }
      
      // Monitor layout shifts (CLS)
      try {
        let cumulativeLayoutShift = 0;
        
        const layoutShiftObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // Only count layout shifts without recent user input
            if (!entry.hadRecentInput) {
              cumulativeLayoutShift += entry.value;
            }
          }
          
          // Report CLS periodically
          sendPerformanceMetric('cumulative-layout-shift', cumulativeLayoutShift);
        });
        
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        if (config.debug) {
          console.error('Layout shift observer failed:', e);
        }
      }
    }
  }
  
  /**
   * Collect and send performance metrics
   */
  function collectPerformanceMetrics() {
    const timing = performance.timing;
    
    performanceTimings = {
      // Navigation timing
      pageLoadTime: timing.loadEventEnd - timing.navigationStart,
      domReadyTime: timing.domContentLoadedEventEnd - timing.navigationStart,
      firstPaint: getFirstPaint(),
      connectionTime: timing.connectEnd - timing.connectStart,
      requestTime: timing.responseEnd - timing.requestStart,
      fetchTime: timing.responseEnd - timing.fetchStart,
      redirectTime: timing.redirectEnd - timing.redirectStart || 0,
      dnsLookupTime: timing.domainLookupEnd - timing.domainLookupStart,
      processingTime: timing.loadEventEnd - timing.responseEnd,
      
      // Memory info (where available)
      memory: window.performance.memory ? {
        usedJSHeapSize: window.performance.memory.usedJSHeapSize,
        totalJSHeapSize: window.performance.memory.totalJSHeapSize
      } : null
    };
    
    // Send performance metrics
    sendPerformanceData();
  }
  
  /**
   * Get the first paint time
   * @returns {number} First paint time in ms
   */
  function getFirstPaint() {
    if (window.performance && window.performance.getEntriesByType) {
      const paintMetrics = performance.getEntriesByType('paint');
      const firstPaint = paintMetrics.find(metric => metric.name === 'first-paint');
      if (firstPaint) {
        return firstPaint.startTime;
      }
    }
    return 0;
  }
  
  /**
   * Send collected performance data to the server
   */
  function sendPerformanceData() {
    const performanceData = {
      timestamp: new Date().toISOString(),
      sessionId,
      userId,
      page: window.location.pathname,
      timings: performanceTimings,
      resources: resourceTimings.slice(0, 10) // Limit to 10 resources
    };
    
    // Send to backend
    sendToServer(config.performanceEndpoint, performanceData);
  }
  
  /**
   * Send a specific performance metric
   * @param {string} name - Metric name
   * @param {number} value - Metric value
   */
  function sendPerformanceMetric(name, value) {
    const metricData = {
      timestamp: new Date().toISOString(),
      sessionId,
      userId,
      page: window.location.pathname,
      metric: name,
      value: value
    };
    
    // Send to backend
    sendToServer(config.performanceEndpoint, metricData);
  }
  
  /**
   * Track API call performance
   * @param {string} url - API URL
   * @param {string} method - HTTP method
   * @param {number} status - HTTP status code
   * @param {number} duration - Call duration in ms
   */
  function trackApiPerformance(url, method, status, duration) {
    const apiData = {
      timestamp: new Date().toISOString(),
      sessionId,
      userId,
      page: window.location.pathname,
      url,
      method,
      status,
      duration
    };
    
    // Send to backend
    sendToServer(config.performanceEndpoint, apiData);
  }
  
  /**
   * Capture an error
   * @param {string} type - Error type
   * @param {Object} error - Error details
   */
  function captureError(type, error) {
    // Update error count
    errorCount++;
    lastError = error;
    
    // Only sample some errors in production to reduce volume
    if (config.environment === 'production' && Math.random() > config.errorSampleRate) {
      return;
    }
    
    const errorData = {
      timestamp: new Date().toISOString(),
      sessionId,
      userId,
      page: window.location.pathname,
      url: window.location.href,
      referrer: document.referrer,
      type,
      error,
      deviceInfo
    };
    
    // Send to backend
    sendToServer(config.apiEndpoint, errorData, 'error');
  }
  
  /**
   * Track a page view
   */
  function trackPageView() {
    const pageViewData = {
      timestamp: new Date().toISOString(),
      sessionId,
      userId,
      page: window.location.pathname,
      url: window.location.href,
      referrer: document.referrer,
      title: document.title,
      deviceInfo
    };
    
    // Send to backend
    sendToServer(config.apiEndpoint, pageViewData, 'pageview');
  }
  
  /**
   * Track a user action
   * @param {string} action - Action name
   * @param {Object} data - Action data
   */
  function trackAction(action, data = {}) {
    const actionData = {
      timestamp: new Date().toISOString(),
      sessionId,
      userId,
      page: window.location.pathname,
      action,
      data
    };
    
    // Send to backend
    sendToServer(config.apiEndpoint, actionData, 'action');
  }
  
  /**
   * Send data to the server
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Data to send
   * @param {string} logType - Log type
   */
  function sendToServer(endpoint, data, logType = 'performance') {
    // Add common fields
    const payload = {
      ...data,
      type: logType,
      app: 'giggatek_frontend',
      environment: config.environment
    };
    
    // Use sendBeacon when available for better reliability during page unload
    if (navigator.sendBeacon && (logType === 'pageview' || logType === 'error')) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(endpoint, blob);
      return;
    }
    
    // Fall back to fetch for other cases
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // Use keepalive to ensure request completes even if page unloads
      keepalive: true
    }).catch(e => {
      if (config.debug) {
        console.error('Error sending monitoring data:', e);
      }
    });
  }
  
  // Public API
  return {
    init,
    trackPageView,
    trackAction,
    captureError
  };
})();

// Automatically initialize if global configuration is present
if (window.GIGGATEK_MONITORING_CONFIG) {
  GigGatekMonitoring.init(window.GIGGATEK_MONITORING_CONFIG);
}

// Expose monitoring to the global scope
window.GigGatekMonitoring = GigGatekMonitoring;

/**
 * Tests for the notification system
 */

// Import the NotificationSystem class
const NotificationSystem = require('../js/notifications').NotificationSystem;

describe('NotificationSystem', () => {
  let notifications;
  
  beforeEach(() => {
    // Reset DOM mocks
    document.querySelector.mockReset();
    document.getElementById.mockReset();
    document.createElement.mockReset();
    
    // Create a new instance for each test
    notifications = new NotificationSystem();
  });
  
  test('should create a notification container on initialization', () => {
    // Mock getElementById to return null (container doesn't exist yet)
    document.getElementById.mockReturnValue(null);
    
    // Mock createElement to return a div with methods
    const mockContainer = {
      id: '',
      className: '',
      appendChild: jest.fn()
    };
    document.createElement.mockReturnValue(mockContainer);
    
    // Initialize the notification system
    notifications.init();
    
    // Check if container was created with correct properties
    expect(document.createElement).toHaveBeenCalledWith('div');
    expect(mockContainer.id).toBe('notification-container');
    expect(mockContainer.className).toContain('notification-container');
    expect(document.body.appendChild).toHaveBeenCalledWith(mockContainer);
  });
  
  test('should show a notification with the correct type', () => {
    // Mock container
    const mockContainer = {
      appendChild: jest.fn()
    };
    notifications.container = mockContainer;
    
    // Mock createElement to return a div with methods
    const mockElement = {
      className: '',
      dataset: {},
      innerHTML: '',
      classList: {
        add: jest.fn()
      },
      addEventListener: jest.fn(),
      querySelector: jest.fn().mockReturnValue({
        style: {}
      })
    };
    document.createElement.mockReturnValue(mockElement);
    
    // Show a notification
    notifications.show('Test message', 'success');
    
    // Check if notification was created with correct properties
    expect(document.createElement).toHaveBeenCalledWith('div');
    expect(mockElement.className).toContain('notification');
    expect(mockElement.className).toContain('notification-success');
    expect(mockElement.innerHTML).toContain('Test message');
    expect(mockContainer.appendChild).toHaveBeenCalledWith(mockElement);
  });
  
  test('should close a notification', () => {
    // Create a mock notification
    const mockNotification = {
      id: 'test-id',
      element: {
        classList: {
          remove: jest.fn(),
          add: jest.fn()
        },
        parentNode: {
          removeChild: jest.fn()
        }
      },
      timer: 123,
      onClose: jest.fn()
    };
    
    // Add to active notifications
    notifications.activeNotifications = [mockNotification];
    
    // Mock setTimeout to execute callback immediately
    jest.spyOn(global, 'setTimeout').mockImplementation((callback) => {
      callback();
      return 999;
    });
    
    // Mock clearTimeout
    jest.spyOn(global, 'clearTimeout').mockImplementation(() => {});
    
    // Close the notification
    notifications.close('test-id');
    
    // Check if notification was closed correctly
    expect(clearTimeout).toHaveBeenCalledWith(123);
    expect(mockNotification.element.classList.remove).toHaveBeenCalledWith('visible');
    expect(mockNotification.element.classList.add).toHaveBeenCalledWith('hiding');
    expect(mockNotification.element.parentNode.removeChild).toHaveBeenCalledWith(mockNotification.element);
    expect(mockNotification.onClose).toHaveBeenCalled();
    expect(notifications.activeNotifications.length).toBe(0);
  });
  
  test('should handle notification queue correctly', () => {
    // Mock container
    const mockContainer = {
      appendChild: jest.fn()
    };
    notifications.container = mockContainer;
    
    // Mock createElement to return a div with methods
    const mockElement = {
      className: '',
      dataset: {},
      innerHTML: '',
      classList: {
        add: jest.fn()
      },
      addEventListener: jest.fn(),
      querySelector: jest.fn().mockReturnValue({
        style: {}
      })
    };
    document.createElement.mockReturnValue(mockElement);
    
    // Mock setTimeout to execute callback immediately
    jest.spyOn(global, 'setTimeout').mockImplementation((callback) => {
      callback();
      return 999;
    });
    
    // Set max notifications to 2
    notifications.options.maxNotifications = 2;
    
    // Show 3 notifications
    notifications.show('Message 1', 'success');
    notifications.show('Message 2', 'error');
    notifications.show('Message 3', 'warning');
    
    // Check if only 2 notifications were shown and 1 is in queue
    expect(mockContainer.appendChild).toHaveBeenCalledTimes(2);
    expect(notifications.queue.length).toBe(1);
    expect(notifications.queue[0].message).toBe('Message 3');
  });
  
  test('should provide shorthand methods for different notification types', () => {
    // Spy on show method
    jest.spyOn(notifications, 'show').mockImplementation(() => {});
    
    // Call shorthand methods
    notifications.success('Success message');
    notifications.error('Error message');
    notifications.warning('Warning message');
    notifications.info('Info message');
    
    // Check if show was called with correct parameters
    expect(notifications.show).toHaveBeenCalledTimes(4);
    expect(notifications.show).toHaveBeenCalledWith('Success message', 'success', {});
    expect(notifications.show).toHaveBeenCalledWith('Error message', 'error', {});
    expect(notifications.show).toHaveBeenCalledWith('Warning message', 'warning', {});
    expect(notifications.show).toHaveBeenCalledWith('Info message', 'info', {});
  });
});

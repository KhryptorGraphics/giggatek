/**
 * Jest setup file for GigGatek frontend tests
 */

// Mock browser globals
global.window = {
  location: {
    href: 'http://localhost/',
    origin: 'http://localhost',
    pathname: '/',
    search: ''
  },
  GigGatekConfig: {
    getApiEndpoint: (path) => `http://localhost/api${path}`
  },
  localStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  },
  sessionStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  },
  fetch: jest.fn(),
  alert: jest.fn(),
  confirm: jest.fn(),
  Stripe: jest.fn().mockImplementation(() => ({
    elements: jest.fn().mockReturnValue({
      create: jest.fn().mockReturnValue({
        mount: jest.fn(),
        on: jest.fn(),
        update: jest.fn()
      })
    }),
    confirmCardPayment: jest.fn(),
    handleCardAction: jest.fn(),
    retrievePaymentIntent: jest.fn(),
    createPaymentMethod: jest.fn()
  }))
};

// Mock document
global.document = {
  readyState: 'complete',
  querySelector: jest.fn(),
  querySelectorAll: jest.fn().mockReturnValue([]),
  getElementById: jest.fn(),
  createElement: jest.fn().mockReturnValue({
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn()
    },
    appendChild: jest.fn(),
    addEventListener: jest.fn()
  }),
  addEventListener: jest.fn(),
  body: {
    appendChild: jest.fn()
  },
  head: {
    appendChild: jest.fn()
  }
};

// Mock XMLHttpRequest
global.XMLHttpRequest = jest.fn().mockImplementation(() => ({
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
  readyState: 4,
  status: 200,
  responseText: '{}',
  onreadystatechange: null
}));

// Mock fetch API
global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    status: 200
  })
);

// Mock console methods
global.console = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

import '@testing-library/jest-dom'

jest.mock('next/navigation', () => require('next-router-mock'))

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

jest.mock('nanoid', () => ({
  nanoid: () => 'TEST123456789',
  customAlphabet: () => () => 'TEST1234'
}))

global.Request = class MockRequest {
  constructor(input, init = {}) {
    Object.defineProperty(this, 'url', {
      value: input,
      writable: false,
      enumerable: true,
      configurable: true
    })
    Object.defineProperty(this, 'method', {
      value: init?.method || 'GET',
      writable: false,
      enumerable: true,
      configurable: true
    })
    this.headers = new Map(Object.entries(init?.headers || {}))
    this.body = init?.body
  }
  
  async json() {
    return JSON.parse(this.body || '{}')
  }
}

global.Response = class MockResponse {
  constructor(body, init = {}) {
    this.body = body
    this.status = init.status || 200
    this.statusText = init.statusText || 'OK'
    this.headers = new Map(Object.entries(init.headers || {}))
  }
  
  async json() {
    return JSON.parse(this.body || '{}')
  }
  
  static json(data, init = {}) {
    return new MockResponse(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers
      }
    })
  }
}

import { Configs, Params, Payload, JsonApi } from './type'

class JsonApiFetch {
  private useBaseURL: boolean = true;
  private configs: Configs;
  private defaultOptions: RequestInit = {};
  private headers: Headers = new Headers();

  constructor(configs: Configs = {}) {
    this.configs = configs
    this.initHeaders()
  }

  static create(configs: Configs = {}) {
    return new JsonApiFetch(configs)
  }

  async request(url: string, options: RequestInit): Promise<JsonApi> {
    const response = await fetch(url, Object.assign(this.defaultOptions, options))

    return this.checkStatus(response)
  }

  async get(path: string, params?: Params): Promise<JsonApi> {
    const url = this.getFullUrl(path, params)

    return this.request(url, {
      method: 'GET',
      headers: this.headers,
    })
  }

  async sampleGet(path: string, params?: Params) {
    const url = this.getFullUrl(path, params)

    return await fetch(url)
  }

  async delete(path: string, params?: Params) {
    const url = this.getFullUrl(path, params)

    return await this.request(url, {
      method: 'DELETE',
      headers: this.headers,
    })
  }
  
  async post(path: string, payload: Payload) {
    const url = this.getFullUrl(path)

    return await this.request(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(payload),
    })
  }

  async put(path: string, payload: Payload) {
    const url = this.getFullUrl(path)

    return await this.request(url, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(payload),
    })
  }

  appendHeader(key: string, value: string): void {
    this.headers.append(key, value)
  }

  setDefaultOptions(options: RequestInit) {
    this.defaultOptions = options
  }

  getFullUrl(path: string, params?: Params): string {
    const paramsString = params ? this.serializeObject(params) : ''

    if (this.useBaseURL && !this.isUrl) {
      return this.configs.baseURL + path + paramsString
    }

    return path + paramsString
  }

  isUrl(url: string): boolean {
    const protocol = url.split('://')[0].toLowerCase()

    return protocol ? protocol.indexOf('http') > -1 : false
  }

  private initHeaders() {
    this.headers.set('Accept', 'application/json')
    this.headers.set('Content-Type', 'application/json')
  }

  private checkStatus(res: Response) {
    // handle no content
    if (res.status === 204) {
      return null
    }

    if (res.ok) {
      return res.json()
    }

    return res.json().then((err) => { throw err })
  }

  private serializeObject(obj: Params): string {
    if (obj && Object.keys(obj).length) {
      return '?' + Object.keys(obj)
        .map((key) => {
          const value = typeof obj[key] === 'object'
            ? JSON.stringify(obj[key])
            : obj[key]

          return `${key}=${encodeURIComponent(value)}`
        })
        .join('&')
    }

    return ''
  }
}

export default JsonApiFetch
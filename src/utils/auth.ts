// Aircall API Authentication Helper
// Handles Basic Auth for the Aircall API

const AIRCALL_API_HOST = 'https://api.aircall.io';
const AIRCALL_API_BASE = `${AIRCALL_API_HOST}/v1`;

export interface AircallCredentials {
  apiId: string;
  apiToken: string;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown>;
  params?: Record<string, string | number | boolean | undefined>;
}

export class AircallClient {
  private credentials: AircallCredentials;
  private authHeader: string;

  constructor(credentials: AircallCredentials) {
    this.credentials = credentials;
    this.authHeader = `Basic ${Buffer.from(
      `${credentials.apiId}:${credentials.apiToken}`
    ).toString('base64')}`;
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    // Endpoints default to /v1; paths starting with /v2/ target API v2 directly
    const base = endpoint.startsWith('/v2/') ? AIRCALL_API_HOST : AIRCALL_API_BASE;
    const url = new URL(`${base}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, params } = options;
    const url = this.buildUrl(endpoint, params);

    const headers: Record<string, string> = {
      Authorization: this.authHeader,
      'Content-Type': 'application/json',
    };

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage: string;

      try {
        const errorJson = JSON.parse(errorBody);
        errorMessage = errorJson.error || errorJson.message || errorBody;
      } catch {
        errorMessage = errorBody;
      }

      throw new Error(
        `Aircall API error (${response.status}): ${errorMessage}`
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  // Convenience methods
  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  async put<T>(
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  async patch<T>(
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Validate credentials by making a test request
  async validateCredentials(): Promise<boolean> {
    try {
      await this.get('/company');
      return true;
    } catch {
      return false;
    }
  }
}

// Factory function for creating authenticated client
export function createAircallClient(
  apiId?: string,
  apiToken?: string
): AircallClient {
  const id = apiId || process.env.AIRCALL_API_ID;
  const token = apiToken || process.env.AIRCALL_API_TOKEN;

  if (!id || !token) {
    throw new Error(
      'Aircall API credentials required. Set AIRCALL_API_ID and AIRCALL_API_TOKEN environment variables or pass them directly.'
    );
  }

  return new AircallClient({ apiId: id, apiToken: token });
}

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://fr-youhanna-makin.com/api/v1';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      async (config: AxiosRequestConfig) => {
        // Load token if not already loaded
        if (!this.token) {
          this.token = await AsyncStorage.getItem('auth_token');
        }

        if (this.token && config.headers) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized (e.g., clear token, redirect to login)
          this.clearToken();
        }
        return Promise.reject(error);
      }
    );
  }

  public async setToken(token: string): Promise<void> {
    this.token = token;
    await AsyncStorage.setItem('auth_token', token);
  }

  public async clearToken(): Promise<void> {
    this.token = null;
    await AsyncStorage.removeItem('auth_token');
  }

  public get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  public post<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  public put<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  public patch<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  public delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
}

export default new ApiClient(); 
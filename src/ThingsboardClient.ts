import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { AuthUser, LoginResponse, RequestConfig } from './model';

// Constants
const REFRESH_TOKEN_URL = '/api/auth/token';
const LOGIN_URL = '/api/auth/login';
const LOGOUT_URL = '/api/auth/logout';

import { TelemetryWebsocketService } from './service/TelemetryWebsocketService';
import { DeviceService } from './service/DeviceService';
import { AttributeService } from './service/AttributeService';
import { OAuth2Service } from './service/OAuth2Service';
import { AlarmService } from './service/AlarmService';
import { EventService } from './service/EventService';
import { EntityQueryService } from './service/EntityQueryService';

export class ThingsboardClient {
  private apiEndpoint: string;
  private axiosInstance: AxiosInstance;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private authUser: AuthUser | null = null;
  private refreshTokenPending = false;
  
  private telemetryService: TelemetryWebsocketService | null = null;
  private deviceService: DeviceService | null = null;
  private attributeService: AttributeService | null = null;
  private oauth2Service: OAuth2Service | null = null;
  private alarmService: AlarmService | null = null;
  private eventService: EventService | null = null;
  private entityQueryService: EntityQueryService | null = null;

  private userLoadedCallbacks: Array<() => void> = [];
  private userLoggedOutCallbacks: Array<() => void> = [];

  constructor(apiEndpoint: string) {
    this.apiEndpoint = apiEndpoint;
    this.axiosInstance = axios.create({
      baseURL: apiEndpoint,
    });

    this.setupInterceptors();
  }
  
  public onUserLoaded(callback: () => void) {
    this.userLoadedCallbacks.push(callback);
  }

  public onUserLoggedOut(callback: () => void) {
    this.userLoggedOutCallbacks.push(callback);
  }

  private notifyUserLoaded() {
    this.userLoadedCallbacks.forEach(cb => cb());
  }

  private notifyUserLoggedOut() {
    this.userLoggedOutCallbacks.forEach(cb => cb());
  }
  
  public async init(): Promise<void> {
      const jwtToken = localStorage.getItem('jwt_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (jwtToken) {
          if (!this.isTokenExpired(jwtToken)) {
              this.setUserFromJwtToken(jwtToken, refreshToken, true);
          } else if (refreshToken && !this.isTokenExpired(refreshToken)) {
              this.token = jwtToken; // Temporary set for refresh call logic if needed, or just pass directly
              this.refreshToken = refreshToken;
              await this.refreshJwtToken();
          } else {
              this.clearJwtToken();
          }
      }
  }

  public getTelemetryService(): TelemetryWebsocketService {
      if (!this.telemetryService) {
          this.telemetryService = new TelemetryWebsocketService(this);
      }
      return this.telemetryService;
  }

  public getDeviceService(): DeviceService {
      if (!this.deviceService) {
          this.deviceService = new DeviceService(this);
      }
      return this.deviceService;
  }

  public getAttributeService(): AttributeService {
      if (!this.attributeService) {
          this.attributeService = new AttributeService(this);
      }
      return this.attributeService;
  }

  public getOAuth2Service(): OAuth2Service {
      if (!this.oauth2Service) {
          this.oauth2Service = new OAuth2Service(this);
      }
      return this.oauth2Service;
  }

  public getAlarmService(): AlarmService {
      if (!this.alarmService) {
          this.alarmService = new AlarmService(this);
      }
      return this.alarmService;
  }

  public getEventService(): EventService {
      if (!this.eventService) {
          this.eventService = new EventService(this);
      }
      return this.eventService;
  }

  public getEntityQueryService(): EntityQueryService {
      if (!this.entityQueryService) {
          this.entityQueryService = new EntityQueryService(this);
      }
      return this.entityQueryService;
  }

  private setupInterceptors() {
    // Request Interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.token && !this.isTokenExpired(this.token)) {
          config.headers.set('X-Authorization', `Bearer ${this.token}`);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes(LOGIN_URL)) {
          if (this.refreshTokenPending) {
            // Simplified: In a real app, we might want to queue requests here
            return Promise.reject(error);
          }

          originalRequest._retry = true;
          this.refreshTokenPending = true;

          try {
            await this.refreshJwtToken();
            // Update header with new token
            originalRequest.headers['X-Authorization'] = `Bearer ${this.token}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.logout();
            return Promise.reject(refreshError);
          } finally {
            this.refreshTokenPending = false;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  public async login(loginRequest: any): Promise<LoginResponse> {
    try {
      const response = await this.axiosInstance.post<LoginResponse>(LOGIN_URL, loginRequest);
      const data = response.data;
      this.setUserFromJwtToken(data.token, data.refreshToken, true);
      return data;
    } catch (error) {
      throw error;
    }
  }

  public async logout() {
    try {
      await this.axiosInstance.post(LOGOUT_URL);
    } catch (e) {
      // Ignore error on logout
    }
    this.clearJwtToken();
  }

  public async refreshJwtToken(): Promise<void> {
    if (!this.refreshToken || this.isTokenExpired(this.refreshToken)) {
      throw new Error('Refresh token is invalid or expired');
    }

    try {
      const response = await axios.post<LoginResponse>(`${this.apiEndpoint}${REFRESH_TOKEN_URL}`, {
        refreshToken: this.refreshToken
      });
      const data = response.data;
      this.setUserFromJwtToken(data.token, data.refreshToken, false);
    } catch (error) {
      this.clearJwtToken();
      throw error;
    }
  }

  public setUserFromJwtToken(token: string, refreshToken: string | null, notify: boolean = true) {
    this.token = token;
    this.refreshToken = refreshToken;
    try {
      this.authUser = jwtDecode<AuthUser>(token);
      localStorage.setItem('jwt_token', token);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      if (notify) {
        this.notifyUserLoaded();
      }
    } catch (e) {
      console.error('Error decoding token', e);
      this.clearJwtToken();
    }
  }

  public clearJwtToken() {
    const wasAuthenticated = this.authUser !== null;
    this.token = null;
    this.refreshToken = null;
    this.authUser = null;
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    
    if (wasAuthenticated) {
        this.notifyUserLoggedOut();
    }
  }

  public isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<any>(token);
      return decoded.exp * 1000 < Date.now();
    } catch (e) {
      return true;
    }
  }

  public getAuthUser(): AuthUser | null {
    return this.authUser;
  }

  public getToken(): string | null {
    return this.token;
  }

  public getApiEndpoint(): string {
    return this.apiEndpoint;
  }
  
  // Basic generic methods
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
      const response = await this.axiosInstance.get<T>(url, config);
      return response.data;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
      const response = await this.axiosInstance.post<T>(url, data, config);
      return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
      const response = await this.axiosInstance.delete<T>(url, config);
      return response.data;
  }

   public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
      const response = await this.axiosInstance.put<T>(url, data, config);
      return response.data;
  }
}

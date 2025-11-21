import { ThingsboardClient } from '../ThingsboardClient';
import { 
  OAuth2ClientInfo, 
  PlatformType, 
  OAuth2ClientRegistrationTemplate, 
  OAuth2Info 
} from '../model/oauth2';

export class OAuth2Service {
  private tbClient: ThingsboardClient;

  constructor(tbClient: ThingsboardClient) {
    this.tbClient = tbClient;
  }

  public async getOAuth2Clients(pkgName?: string, platform?: PlatformType): Promise<OAuth2ClientInfo[]> {
    const queryParams: any = {};
    if (pkgName) {
      queryParams['pkgName'] = pkgName;
    }
    if (platform) {
      queryParams['platform'] = platform;
    }

    try {
      return await this.tbClient.post<OAuth2ClientInfo[]>('/api/noauth/oauth2Clients', null, {
        params: queryParams
      });
    } catch (error: any) {
      // Handle redirect if needed, but usually browser handles 302
      // If axios follows redirects automatically, this might just work.
      // However, the API might return 302 with Location header.
      // In a browser environment, fetch/xhr handles redirects transparently for GET, 
      // but for POST it might be tricky if it's a 302.
      // But TB API for oauth2Clients usually returns a list of clients.
      throw error;
    }
  }

  public async saveClientRegistrationTemplate(template: OAuth2ClientRegistrationTemplate): Promise<OAuth2ClientRegistrationTemplate> {
    return this.tbClient.post<OAuth2ClientRegistrationTemplate>('/api/oauth2/config/template', template);
  }

  public async deleteClientRegistrationTemplate(id: string): Promise<void> {
    return this.tbClient.delete(`/api/oauth2/config/template/${id}`);
  }

  public async getClientRegistrationTemplates(): Promise<OAuth2ClientRegistrationTemplate[]> {
    return this.tbClient.get<OAuth2ClientRegistrationTemplate[]>('/api/oauth2/config/template');
  }

  public async getCurrentOAuth2Info(): Promise<OAuth2Info> {
    return this.tbClient.get<OAuth2Info>('/api/oauth2/config');
  }

  public async saveOAuth2Info(info: OAuth2Info): Promise<OAuth2Info> {
    return this.tbClient.post<OAuth2Info>('/api/oauth2/config', info);
  }

  public async getLoginProcessingUrl(): Promise<string> {
    return this.tbClient.get<string>('/api/oauth2/loginProcessingUrl');
  }
}


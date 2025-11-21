import { EntityId, BaseData } from './entity';

export interface OAuth2ClientInfo {
  name: string;
  icon?: string;
  url: string;
}

export enum PlatformType {
  WEB = 'WEB',
  ANDROID = 'ANDROID',
  IOS = 'IOS'
}

export enum MapperType {
  BASIC = 'BASIC',
  CUSTOM = 'CUSTOM',
  GITHUB = 'GITHUB',
  APPLE = 'APPLE'
}

export enum TenantNameStrategyType {
  DOMAIN = 'DOMAIN',
  EMAIL = 'EMAIL',
  CUSTOM = 'CUSTOM'
}

export interface OAuth2BasicMapperConfig {
  emailAttributeKey: string;
  firstNameAttributeKey?: string;
  lastNameAttributeKey?: string;
  tenantNameStrategy: TenantNameStrategyType;
  tenantNamePattern?: string;
  customerNamePattern?: string;
  defaultDashboardName?: string;
  alwaysFullScreen?: boolean;
}

export interface OAuth2CustomMapperConfig {
  url: string;
  username?: string;
  password?: string;
  sendToken?: boolean;
}

export interface OAuth2MapperConfig {
  allowUserCreation: boolean;
  activateUser: boolean;
  type: MapperType;
  basic?: OAuth2BasicMapperConfig;
  custom?: OAuth2CustomMapperConfig;
}

export interface OAuth2ClientRegistrationTemplate extends BaseData<EntityId> {
  providerId: string;
  mapperConfig: OAuth2MapperConfig;
  authorizationUri: string;
  accessTokenUri: string;
  scope: string[];
  userInfoUri?: string;
  userNameAttributeName: string;
  jwkSetUri?: string;
  clientAuthenticationMethod: string;
  comment?: string;
  loginButtonIcon?: string;
  loginButtonLabel?: string;
  helpLink?: string;
}

export enum SchemeType {
  HTTP = 'HTTP',
  HTTPS = 'HTTPS',
  MIXED = 'MIXED'
}

export interface OAuth2DomainInfo {
  scheme: SchemeType;
  name: string;
}

export interface OAuth2MobileInfo {
  pkgName: string;
  appSecret: string;
}

export interface OAuth2RegistrationInfo {
  mapperConfig: OAuth2MapperConfig;
  clientId: string;
  clientSecret: string;
  authorizationUri: string;
  accessTokenUri: string;
  scope: string[];
  userInfoUri?: string;
  userNameAttributeName: string;
  jwkSetUri?: string;
  clientAuthenticationMethod: string;
  loginButtonLabel?: string;
  loginButtonIcon?: string;
  platforms: PlatformType[];
  additionalInfo?: any;
}

export interface OAuth2ParamsInfo {
  domainInfos: OAuth2DomainInfo[];
  mobileInfos: OAuth2MobileInfo[];
  clientRegistrations: OAuth2RegistrationInfo[];
}

export interface OAuth2Info {
  enabled: boolean;
  oauth2ParamsInfos: OAuth2ParamsInfo[];
}


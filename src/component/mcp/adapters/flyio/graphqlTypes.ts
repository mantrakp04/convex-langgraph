/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export const URL = "https://api.fly.io/graphql";

export type Maybe<T> = T | null
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  BigInt: any
  CaveatSet: any
  ISO8601DateTime: any
  JSON: any
}

export type AccessToken = Node & {
  __typename?: "AccessToken"
  createdAt: Scalars["ISO8601DateTime"]
  id: Scalars["ID"]
  name: Scalars["String"]
  type: AccessTokenType
}

export type AccessTokenConnection = {
  __typename?: "AccessTokenConnection"
  edges?: Maybe<Array<Maybe<AccessTokenEdge>>>
  nodes?: Maybe<Array<Maybe<AccessToken>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type AccessTokenEdge = {
  __typename?: "AccessTokenEdge"
  cursor: Scalars["String"]
  node?: Maybe<AccessToken>
}

export enum AccessTokenType {
  Flyctl = "flyctl",
  Ui = "ui",
  Pat = "pat",
  Grafana = "grafana",
  All = "all",
  Sentry = "sentry",
  Token = "token"
}

export type AddCertificatePayload = {
  __typename?: "AddCertificatePayload"
  app?: Maybe<App>
  certificate?: Maybe<AppCertificate>
  check?: Maybe<HostnameCheck>
  errors?: Maybe<Array<Scalars["String"]>>
}

export type AddOn = Node & {
  __typename?: "AddOn"
  addOnPlan?: Maybe<AddOnPlan>
  addOnPlanName?: Maybe<Scalars["String"]>
  addOnProvider?: Maybe<AddOnProvider>
  app?: Maybe<App>
  apps?: Maybe<AppConnection>
  createdAt: Scalars["ISO8601DateTime"]
  environment?: Maybe<Scalars["JSON"]>
  errorMessage?: Maybe<Scalars["String"]>
  hostname?: Maybe<Scalars["String"]>
  id: Scalars["ID"]
  metadata?: Maybe<Scalars["JSON"]>
  name?: Maybe<Scalars["String"]>
  options?: Maybe<Scalars["JSON"]>
  organization: Organization
  password?: Maybe<Scalars["String"]>
  primaryRegion?: Maybe<Scalars["String"]>
  privateIp?: Maybe<Scalars["String"]>
  publicUrl?: Maybe<Scalars["String"]>
  readRegions?: Maybe<Array<Scalars["String"]>>
  ssoLink?: Maybe<Scalars["String"]>
  stats?: Maybe<Scalars["JSON"]>
  status?: Maybe<Scalars["String"]>
  updatedAt: Scalars["ISO8601DateTime"]
}

export type AddOnAppsArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type AddOnConnection = {
  __typename?: "AddOnConnection"
  edges?: Maybe<Array<Maybe<AddOnEdge>>>
  nodes?: Maybe<Array<Maybe<AddOn>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type AddOnEdge = {
  __typename?: "AddOnEdge"
  cursor: Scalars["String"]
  node?: Maybe<AddOn>
}

export type AddOnPlan = Node & {
  __typename?: "AddOnPlan"
  description?: Maybe<Scalars["String"]>
  displayName?: Maybe<Scalars["String"]>
  id: Scalars["ID"]
  maxCommandsPerSec?: Maybe<Scalars["Int"]>
  maxConcurrentConnections?: Maybe<Scalars["Int"]>
  maxDailyBandwidth?: Maybe<Scalars["String"]>
  maxDailyCommands?: Maybe<Scalars["Int"]>
  maxDataSize?: Maybe<Scalars["String"]>
  maxRequestSize?: Maybe<Scalars["String"]>
  name?: Maybe<Scalars["String"]>
  pricePerMonth?: Maybe<Scalars["Int"]>
}

export type AddOnPlanConnection = {
  __typename?: "AddOnPlanConnection"
  edges?: Maybe<Array<Maybe<AddOnPlanEdge>>>
  nodes?: Maybe<Array<Maybe<AddOnPlan>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type AddOnPlanEdge = {
  __typename?: "AddOnPlanEdge"
  cursor: Scalars["String"]
  node?: Maybe<AddOnPlan>
}

export type AddOnProvider = {
  __typename?: "AddOnProvider"
  asyncProvisioning: Scalars["Boolean"]
  autoProvision: Scalars["Boolean"]
  beta: Scalars["Boolean"]
  detectPlatform: Scalars["Boolean"]
  displayName?: Maybe<Scalars["String"]>
  excludedRegions?: Maybe<Array<Region>>
  id: Scalars["ID"]
  internal: Scalars["Boolean"]
  name?: Maybe<Scalars["String"]>
  nameSuffix?: Maybe<Scalars["String"]>
  provisioningInstructions?: Maybe<Scalars["String"]>
  regions?: Maybe<Array<Region>>
  resourceName: Scalars["String"]
  selectName: Scalars["Boolean"]
  selectRegion: Scalars["Boolean"]
  selectReplicaRegions: Scalars["Boolean"]
  tosAgreement?: Maybe<Scalars["String"]>
  tosUrl?: Maybe<Scalars["String"]>
}

export enum AddOnType {
  Redis = "redis",
  UpstashRedis = "upstash_redis",
  UpstashKafka = "upstash_kafka",
  UpstashVector = "upstash_vector",
  Sentry = "sentry",
  Kubernetes = "kubernetes",
  Supabase = "supabase",
  Tigris = "tigris",
  Enveloop = "enveloop",
  Wafris = "wafris",
  Arcjet = "arcjet",
  FlyMysql = "fly_mysql"
}

export type AddWireGuardPeerInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  organizationId: Scalars["ID"]
  region?: Maybe<Scalars["String"]>
  name: Scalars["String"]
  pubkey: Scalars["String"]
  network?: Maybe<Scalars["String"]>
  nats?: Maybe<Scalars["Boolean"]>
  ephemeral?: Maybe<Scalars["Boolean"]>
}

export type AddWireGuardPeerPayload = {
  __typename?: "AddWireGuardPeerPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  endpointip: Scalars["String"]
  network?: Maybe<Scalars["String"]>
  peerip: Scalars["String"]
  pubkey: Scalars["String"]
}

export type AllocateEgressIpAddressInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["ID"]
  machineId: Scalars["ID"]
}

export type AllocateEgressIpAddressPayload = {
  __typename?: "AllocateEgressIPAddressPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  v4: Scalars["String"]
  v6: Scalars["String"]
}

export type AllocateIpAddressInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["ID"]
  type: IpAddressType
  organizationId?: Maybe<Scalars["ID"]>
  region?: Maybe<Scalars["String"]>
  network?: Maybe<Scalars["String"]>
  serviceName?: Maybe<Scalars["String"]>
}

export type AllocateIpAddressPayload = {
  __typename?: "AllocateIPAddressPayload"
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
  ipAddress?: Maybe<IpAddress>
}

export type Allocation = Node & {
  __typename?: "Allocation"
  attachedVolumes: VolumeConnection
  canary: Scalars["Boolean"]
  checks: Array<CheckState>
  createdAt: Scalars["ISO8601DateTime"]
  criticalCheckCount: Scalars["Int"]
  desiredStatus: Scalars["String"]
  events: Array<AllocationEvent>
  failed: Scalars["Boolean"]
  healthy: Scalars["Boolean"]
  id: Scalars["ID"]
  idShort: Scalars["ID"]
  latestVersion: Scalars["Boolean"]
  passingCheckCount: Scalars["Int"]
  privateIP?: Maybe<Scalars["String"]>
  recentLogs: Array<LogEntry>
  region: Scalars["String"]
  restarts: Scalars["Int"]
  status: Scalars["String"]
  taskName: Scalars["String"]
  totalCheckCount: Scalars["Int"]
  transitioning: Scalars["Boolean"]
  updatedAt: Scalars["ISO8601DateTime"]
  version: Scalars["Int"]
  warningCheckCount: Scalars["Int"]
}

export type AllocationAttachedVolumesArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type AllocationChecksArgs = {
  name?: Maybe<Scalars["String"]>
}

export type AllocationRecentLogsArgs = {
  limit?: Maybe<Scalars["Int"]>
  range?: Maybe<Scalars["Int"]>
}

export type AllocationEvent = {
  __typename?: "AllocationEvent"
  message: Scalars["String"]
  timestamp: Scalars["ISO8601DateTime"]
  type: Scalars["String"]
}

export type App = Node & {
  __typename?: "App"
  addOns: AddOnConnection
  allocation?: Maybe<Allocation>
  allocations: Array<Allocation>
  appUrl?: Maybe<Scalars["String"]>
  autoscaling?: Maybe<AutoscalingConfig>
  backupRegions: Array<Region>
  /** @deprecated Superseded by source_builds */
  builds: BuildConnection
  certificate?: Maybe<AppCertificate>
  certificates: AppCertificateConnection
  changes: AppChangeConnection
  cnameTarget?: Maybe<Scalars["String"]>
  config: AppConfig
  createdAt: Scalars["ISO8601DateTime"]
  currentLock?: Maybe<AppLock>
  currentPlacement: Array<RegionPlacement>
  currentRelease?: Maybe<Release>
  currentReleaseUnprocessed?: Maybe<ReleaseUnprocessed>
  deployed: Scalars["Boolean"]
  deploymentSource?: Maybe<DeploymentSource>
  deploymentStatus?: Maybe<DeploymentStatus>
  hasDeploymentSource: Scalars["Boolean"]
  healthChecks: CheckStateConnection
  hostIssues?: Maybe<IssueConnection>
  hostname?: Maybe<Scalars["String"]>
  id: Scalars["ID"]
  image?: Maybe<Image>
  imageDetails?: Maybe<ImageVersion>
  imageUpgradeAvailable?: Maybe<Scalars["Boolean"]>
  imageVersionTrackingEnabled: Scalars["Boolean"]
  instrumentsKey?: Maybe<Scalars["String"]>
  internalId: Scalars["String"]
  internalNumericId: Scalars["Int"]
  ipAddress?: Maybe<IpAddress>
  ipAddresses: IpAddressConnection
  key: Scalars["String"]
  latestImageDetails?: Maybe<ImageVersion>
  limitedAccessTokens: LimitedAccessTokenConnection
  machine?: Maybe<Machine>
  machines: MachineConnection
  name: Scalars["String"]
  network?: Maybe<Scalars["String"]>
  networkId?: Maybe<Scalars["Int"]>
  organization: Organization
  parseConfig: AppConfig
  platformVersion?: Maybe<PlatformVersionEnum>
  processGroups: Array<ProcessGroup>
  regions: Array<Region>
  release?: Maybe<Release>
  releases: ReleaseConnection
  releasesUnprocessed: ReleaseUnprocessedConnection
  role?: Maybe<AppRole>
  runtime: RuntimeType
  secrets: Array<Secret>
  services: Array<Service>
  sharedIpAddress?: Maybe<Scalars["String"]>
  state: AppState
  status: Scalars["String"]
  taskGroupCounts: Array<TaskGroupCount>
  usage: Array<AppUsage>
  version: Scalars["Int"]
  vmSize: VmSize
  vms: VmConnection
  volume?: Maybe<Volume>
  volumes: VolumeConnection
}

export type AppAddOnsArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
  type?: Maybe<AddOnType>
}

export type AppAllocationArgs = {
  id: Scalars["String"]
}

export type AppAllocationsArgs = {
  showCompleted?: Maybe<Scalars["Boolean"]>
}

export type AppBuildsArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type AppCertificateArgs = {
  hostname: Scalars["String"]
}

export type AppCertificatesArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
  filter?: Maybe<Scalars["String"]>
  id?: Maybe<Scalars["String"]>
}

export type AppChangesArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type AppDeploymentStatusArgs = {
  id?: Maybe<Scalars["ID"]>
  evaluationId?: Maybe<Scalars["String"]>
}

export type AppHealthChecksArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
  name?: Maybe<Scalars["String"]>
}

export type AppHostIssuesArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type AppImageArgs = {
  ref: Scalars["String"]
}

export type AppIpAddressArgs = {
  address: Scalars["String"]
}

export type AppIpAddressesArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type AppLimitedAccessTokensArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type AppMachineArgs = {
  id: Scalars["String"]
}

export type AppMachinesArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
  version?: Maybe<Scalars["Int"]>
  active?: Maybe<Scalars["Boolean"]>
}

export type AppParseConfigArgs = {
  definition: Scalars["JSON"]
}

export type AppReleaseArgs = {
  id?: Maybe<Scalars["ID"]>
  version?: Maybe<Scalars["Int"]>
}

export type AppReleasesArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type AppReleasesUnprocessedArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
  status?: Maybe<Scalars["String"]>
}

export type AppVmsArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
  showCompleted?: Maybe<Scalars["Boolean"]>
}

export type AppVolumeArgs = {
  internalId: Scalars["String"]
}

export type AppVolumesArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type AppCertificate = Node & {
  __typename?: "AppCertificate"
  /** @deprecated use isAcmeAlpnConfigured */
  acmeAlpnConfigured: Scalars["Boolean"]
  /** @deprecated use isAcmeDNSConfigured */
  acmeDnsConfigured: Scalars["Boolean"]
  certificateAuthority?: Maybe<Scalars["String"]>
  certificateRequestedAt?: Maybe<Scalars["ISO8601DateTime"]>
  check: Scalars["Boolean"]
  clientStatus: Scalars["String"]
  /** @deprecated use isConfigured */
  configured: Scalars["Boolean"]
  createdAt?: Maybe<Scalars["ISO8601DateTime"]>
  dnsProvider?: Maybe<Scalars["String"]>
  dnsValidationHostname: Scalars["String"]
  dnsValidationInstructions: Scalars["String"]
  dnsValidationTarget: Scalars["String"]
  domain?: Maybe<Scalars["String"]>
  hostname: Scalars["String"]
  id: Scalars["ID"]
  isAcmeAlpnConfigured: Scalars["Boolean"]
  isAcmeDnsConfigured: Scalars["Boolean"]
  isAcmeHttpConfigured: Scalars["Boolean"]
  isApex: Scalars["Boolean"]
  isConfigured: Scalars["Boolean"]
  isWildcard: Scalars["Boolean"]
  issued: CertificateConnection
  source?: Maybe<Scalars["String"]>
  validationErrors: Array<AppCertificateValidationError>
}

export type AppCertificateIssuedArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
  includeExpired?: Maybe<Scalars["Boolean"]>
}

export type AppCertificateConnection = {
  __typename?: "AppCertificateConnection"
  edges?: Maybe<Array<Maybe<AppCertificateEdge>>>
  nodes?: Maybe<Array<Maybe<AppCertificate>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type AppCertificateEdge = {
  __typename?: "AppCertificateEdge"
  cursor: Scalars["String"]
  node?: Maybe<AppCertificate>
}

export type AppCertificateValidationError = {
  __typename?: "AppCertificateValidationError"
  message: Scalars["String"]
  timestamp: Scalars["ISO8601DateTime"]
}

export type AppChange = Node & {
  __typename?: "AppChange"
  actor?: Maybe<AppChangeActor>
  actorType: Scalars["String"]
  app: App
  createdAt: Scalars["ISO8601DateTime"]
  description: Scalars["String"]
  id: Scalars["ID"]
  status?: Maybe<Scalars["String"]>
  updatedAt: Scalars["ISO8601DateTime"]
  user?: Maybe<User>
}

export type AppChangeActor = Build | Release | Secret

export type AppChangeConnection = {
  __typename?: "AppChangeConnection"
  edges?: Maybe<Array<Maybe<AppChangeEdge>>>
  nodes?: Maybe<Array<Maybe<AppChange>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type AppChangeEdge = {
  __typename?: "AppChangeEdge"
  cursor: Scalars["String"]
  node?: Maybe<AppChange>
}

export type AppConfig = {
  __typename?: "AppConfig"
  definition: Scalars["JSON"]
  errors: Array<Scalars["String"]>
  services: Array<Service>
  valid: Scalars["Boolean"]
}

export type AppConnection = {
  __typename?: "AppConnection"
  edges?: Maybe<Array<Maybe<AppEdge>>>
  nodes?: Maybe<Array<Maybe<App>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type AppEdge = {
  __typename?: "AppEdge"
  cursor: Scalars["String"]
  node?: Maybe<App>
}

export type AppLock = {
  __typename?: "AppLock"
  expiration: Scalars["ISO8601DateTime"]
  lockId: Scalars["ID"]
}

export type AppRole = {
  name: Scalars["String"]
}

export enum AppState {
  Pending = "PENDING",
  Deployed = "DEPLOYED",
  Suspended = "SUSPENDED"
}

export type AppUsage = {
  __typename?: "AppUsage"
  interval: Scalars["String"]
  requestsCount: Scalars["Int"]
  totalAppExecS: Scalars["Int"]
  totalDataOutGB: Scalars["Float"]
  ts: Scalars["ISO8601DateTime"]
}

export type AttachPostgresClusterInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  postgresClusterAppId: Scalars["ID"]
  appId: Scalars["ID"]
  databaseName?: Maybe<Scalars["String"]>
  databaseUser?: Maybe<Scalars["String"]>
  variableName?: Maybe<Scalars["String"]>
  manualEntry?: Maybe<Scalars["Boolean"]>
}

export type AttachPostgresClusterPayload = {
  __typename?: "AttachPostgresClusterPayload"
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
  connectionString: Scalars["String"]
  environmentVariableName: Scalars["String"]
  postgresClusterApp: App
}

export type AutoscaleRegionConfig = {
  __typename?: "AutoscaleRegionConfig"
  code: Scalars["String"]
  minCount?: Maybe<Scalars["Int"]>
  weight?: Maybe<Scalars["Int"]>
}

export type AutoscaleRegionConfigInput = {
  code: Scalars["String"]
  weight?: Maybe<Scalars["Int"]>
  minCount?: Maybe<Scalars["Int"]>
  reset?: Maybe<Scalars["Boolean"]>
}

export enum AutoscaleStrategy {
  None = "NONE",
  PreferredRegions = "PREFERRED_REGIONS",
  ConnectionSources = "CONNECTION_SOURCES"
}

export type AutoscalingConfig = {
  __typename?: "AutoscalingConfig"
  backupRegions: Array<Scalars["String"]>
  balanceRegions: Scalars["Boolean"]
  enabled: Scalars["Boolean"]
  maxCount: Scalars["Int"]
  minCount: Scalars["Int"]
  preferredRegion?: Maybe<Scalars["String"]>
  regions: Array<AutoscaleRegionConfig>
  strategy: AutoscaleStrategy
}

export enum BillingStatus {
  Current = "CURRENT",
  SourceRequired = "SOURCE_REQUIRED",
  PastDue = "PAST_DUE",
  Delinquent = "DELINQUENT",
  TrialActive = "TRIAL_ACTIVE",
  TrialEnded = "TRIAL_ENDED",
  Suspended = "SUSPENDED"
}

export type Build = Node & {
  __typename?: "Build"
  app: App
  commitId?: Maybe<Scalars["String"]>
  commitUrl?: Maybe<Scalars["String"]>
  createdAt: Scalars["ISO8601DateTime"]
  createdBy?: Maybe<User>
  failed: Scalars["Boolean"]
  id: Scalars["ID"]
  image?: Maybe<Scalars["String"]>
  inProgress: Scalars["Boolean"]
  logs: Scalars["String"]
  number: Scalars["Int"]
  status: Scalars["String"]
  succeeded: Scalars["Boolean"]
  updatedAt: Scalars["ISO8601DateTime"]
}

export type BuildConnection = {
  __typename?: "BuildConnection"
  edges?: Maybe<Array<Maybe<BuildEdge>>>
  nodes?: Maybe<Array<Maybe<Build>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type BuildEdge = {
  __typename?: "BuildEdge"
  cursor: Scalars["String"]
  node?: Maybe<Build>
}

export type BuildFinalImageInput = {
  id: Scalars["String"]
  tag: Scalars["String"]
  sizeBytes: Scalars["BigInt"]
}

export type BuildImageOptsInput = {
  dockerfilePath?: Maybe<Scalars["String"]>
  imageRef?: Maybe<Scalars["String"]>
  buildArgs?: Maybe<Scalars["JSON"]>
  extraBuildArgs?: Maybe<Scalars["JSON"]>
  imageLabel?: Maybe<Scalars["String"]>
  publish?: Maybe<Scalars["Boolean"]>
  tag?: Maybe<Scalars["String"]>
  target?: Maybe<Scalars["String"]>
  noCache?: Maybe<Scalars["Boolean"]>
  builtIn?: Maybe<Scalars["String"]>
  builtInSettings?: Maybe<Scalars["JSON"]>
  builder?: Maybe<Scalars["String"]>
  buildPacks?: Maybe<Array<Scalars["String"]>>
}

export type BuildStrategyAttemptInput = {
  strategy: Scalars["String"]
  result: Scalars["String"]
  error?: Maybe<Scalars["String"]>
  note?: Maybe<Scalars["String"]>
}

export type BuildTimingsInput = {
  buildAndPushMs?: Maybe<Scalars["BigInt"]>
  builderInitMs?: Maybe<Scalars["BigInt"]>
  buildMs?: Maybe<Scalars["BigInt"]>
  contextBuildMs?: Maybe<Scalars["BigInt"]>
  imageBuildMs?: Maybe<Scalars["BigInt"]>
  pushMs?: Maybe<Scalars["BigInt"]>
}

export type BuilderMetaInput = {
  builderType: Scalars["String"]
  dockerVersion?: Maybe<Scalars["String"]>
  buildkitEnabled?: Maybe<Scalars["Boolean"]>
  platform?: Maybe<Scalars["String"]>
  remoteAppName?: Maybe<Scalars["ID"]>
  remoteMachineId?: Maybe<Scalars["ID"]>
}

export type CancelBuildPayload = {
  __typename?: "CancelBuildPayload"
  build: Build
}

export type Certificate = Node & {
  __typename?: "Certificate"
  expiresAt: Scalars["ISO8601DateTime"]
  hostname: Scalars["String"]
  id: Scalars["ID"]
  type: Scalars["String"]
}

export type CertificateConnection = {
  __typename?: "CertificateConnection"
  edges?: Maybe<Array<Maybe<CertificateEdge>>>
  nodes?: Maybe<Array<Maybe<Certificate>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type CertificateEdge = {
  __typename?: "CertificateEdge"
  cursor: Scalars["String"]
  node?: Maybe<Certificate>
}

export type Check = {
  __typename?: "Check"
  httpHeaders?: Maybe<Array<CheckHeader>>
  httpMethod?: Maybe<Scalars["String"]>
  httpPath?: Maybe<Scalars["String"]>
  httpProtocol?: Maybe<HttpProtocol>
  httpTlsSkipVerify?: Maybe<Scalars["Boolean"]>
  interval: Scalars["Int"]
  name?: Maybe<Scalars["String"]>
  scriptArgs?: Maybe<Array<Scalars["String"]>>
  scriptCommand?: Maybe<Scalars["String"]>
  timeout: Scalars["Int"]
  type: CheckType
}

export type CheckCertificateInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["ID"]
  hostname: Scalars["String"]
}

export type CheckCertificatePayload = {
  __typename?: "CheckCertificatePayload"
  app?: Maybe<App>
  certificate?: Maybe<AppCertificate>
  check?: Maybe<HostnameCheck>
  clientMutationId?: Maybe<Scalars["String"]>
}

export type CheckHttpResponse = Node & {
  __typename?: "CheckHTTPResponse"
  closeTs: Scalars["String"]
  connectedTs: Scalars["String"]
  dnsTs: Scalars["String"]
  firstTs: Scalars["String"]
  flyioDebug?: Maybe<Scalars["JSON"]>
  headers: Scalars["JSON"]
  id: Scalars["ID"]
  lastTs: Scalars["String"]
  location: CheckLocation
  rawHeaders: Scalars["String"]
  rawOutput: Array<Scalars["String"]>
  resolvedIp: Scalars["String"]
  sentTs: Scalars["String"]
  startTs: Scalars["String"]
  statusCode: Scalars["Int"]
  tlsTs?: Maybe<Scalars["String"]>
}

export type CheckHttpResponseConnection = {
  __typename?: "CheckHTTPResponseConnection"
  edges?: Maybe<Array<Maybe<CheckHttpResponseEdge>>>
  nodes?: Maybe<Array<Maybe<CheckHttpResponse>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type CheckHttpResponseEdge = {
  __typename?: "CheckHTTPResponseEdge"
  cursor: Scalars["String"]
  node?: Maybe<CheckHttpResponse>
}

export enum CheckHttpVerb {
  Get = "GET",
  Head = "HEAD"
}

export type CheckHeader = {
  __typename?: "CheckHeader"
  name: Scalars["String"]
  value: Scalars["String"]
}

export type CheckHeaderInput = {
  name: Scalars["String"]
  value: Scalars["String"]
}

export type CheckInput = {
  type: CheckType
  name?: Maybe<Scalars["String"]>
  interval?: Maybe<Scalars["Int"]>
  timeout?: Maybe<Scalars["Int"]>
  httpMethod?: Maybe<HttpMethod>
  httpPath?: Maybe<Scalars["String"]>
  httpProtocol?: Maybe<HttpProtocol>
  httpTlsSkipVerify?: Maybe<Scalars["Boolean"]>
  httpHeaders?: Maybe<Array<CheckHeaderInput>>
  scriptCommand?: Maybe<Scalars["String"]>
  scriptArgs?: Maybe<Array<Scalars["String"]>>
}

export type CheckJob = Node & {
  __typename?: "CheckJob"
  httpOptions?: Maybe<CheckJobHttpOptions>
  id: Scalars["ID"]
  locations: CheckLocationConnection
  nextRunAt?: Maybe<Scalars["ISO8601DateTime"]>
  runs: CheckJobRunConnection
  schedule?: Maybe<Scalars["String"]>
  url: Scalars["String"]
}

export type CheckJobLocationsArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type CheckJobRunsArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type CheckJobConnection = {
  __typename?: "CheckJobConnection"
  edges?: Maybe<Array<Maybe<CheckJobEdge>>>
  nodes?: Maybe<Array<Maybe<CheckJob>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type CheckJobEdge = {
  __typename?: "CheckJobEdge"
  cursor: Scalars["String"]
  node?: Maybe<CheckJob>
}

export type CheckJobHttpOptions = {
  __typename?: "CheckJobHTTPOptions"
  headers: Array<Scalars["String"]>
  verb: CheckHttpVerb
}

export type CheckJobHttpOptionsInput = {
  verb?: CheckHttpVerb
  headers?: Maybe<Array<Scalars["String"]>>
}

export type CheckJobRun = Node & {
  __typename?: "CheckJobRun"
  completedAt?: Maybe<Scalars["ISO8601DateTime"]>
  createdAt: Scalars["ISO8601DateTime"]
  httpOptions: CheckJobHttpOptions
  httpResponses: CheckHttpResponseConnection
  id: Scalars["ID"]
  locations: CheckLocationConnection
  state: Scalars["String"]
  tests: Array<Scalars["String"]>
  url: Scalars["String"]
}

export type CheckJobRunHttpResponsesArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type CheckJobRunLocationsArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type CheckJobRunConnection = {
  __typename?: "CheckJobRunConnection"
  edges?: Maybe<Array<Maybe<CheckJobRunEdge>>>
  nodes?: Maybe<Array<Maybe<CheckJobRun>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type CheckJobRunEdge = {
  __typename?: "CheckJobRunEdge"
  cursor: Scalars["String"]
  node?: Maybe<CheckJobRun>
}

export type CheckLocation = {
  __typename?: "CheckLocation"
  coordinates: Array<Scalars["Float"]>
  country: Scalars["String"]
  locality: Scalars["String"]
  name: Scalars["String"]
  state?: Maybe<Scalars["String"]>
  title: Scalars["String"]
}

export type CheckLocationConnection = {
  __typename?: "CheckLocationConnection"
  edges?: Maybe<Array<Maybe<CheckLocationEdge>>>
  nodes?: Maybe<Array<Maybe<CheckLocation>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type CheckLocationEdge = {
  __typename?: "CheckLocationEdge"
  cursor: Scalars["String"]
  node?: Maybe<CheckLocation>
}

export type CheckState = {
  __typename?: "CheckState"
  allocation: Allocation
  allocationId: Scalars["String"]
  name: Scalars["String"]
  output: Scalars["String"]
  serviceName: Scalars["String"]
  status: Scalars["String"]
  type: CheckType
  updatedAt: Scalars["ISO8601DateTime"]
}

export type CheckStateOutputArgs = {
  limit?: Maybe<Scalars["Int"]>
  compact?: Maybe<Scalars["Boolean"]>
}

export type CheckStateConnection = {
  __typename?: "CheckStateConnection"
  edges?: Maybe<Array<Maybe<CheckStateEdge>>>
  nodes?: Maybe<Array<Maybe<CheckState>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type CheckStateEdge = {
  __typename?: "CheckStateEdge"
  cursor: Scalars["String"]
  node?: Maybe<CheckState>
}

export enum CheckType {
  Tcp = "TCP",
  Http = "HTTP",
  Script = "SCRIPT"
}

export type ConfigureRegionsInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["ID"]
  allowRegions?: Maybe<Array<Scalars["String"]>>
  denyRegions?: Maybe<Array<Scalars["String"]>>
  backupRegions?: Maybe<Array<Scalars["String"]>>
  group?: Maybe<Scalars["String"]>
}

export type ConfigureRegionsPayload = {
  __typename?: "ConfigureRegionsPayload"
  app: App
  backupRegions: Array<Region>
  clientMutationId?: Maybe<Scalars["String"]>
  group?: Maybe<Scalars["String"]>
  regions: Array<Region>
}

export type CreateAddOnInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId?: Maybe<Scalars["ID"]>
  organizationId?: Maybe<Scalars["ID"]>
  type: AddOnType
  name?: Maybe<Scalars["String"]>
  planId?: Maybe<Scalars["ID"]>
  organizationPlanId?: Maybe<Scalars["String"]>
  primaryRegion?: Maybe<Scalars["String"]>
  readRegions?: Maybe<Array<Scalars["String"]>>
  options?: Maybe<Scalars["JSON"]>
}

export type CreateAddOnPayload = {
  __typename?: "CreateAddOnPayload"
  addOn: AddOn
  clientMutationId?: Maybe<Scalars["String"]>
}

export type CreateAppInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  organizationId: Scalars["ID"]
  runtime?: Maybe<RuntimeType>
  name?: Maybe<Scalars["String"]>
  preferredRegion?: Maybe<Scalars["String"]>
  heroku?: Maybe<Scalars["Boolean"]>
  network?: Maybe<Scalars["String"]>
  appRoleId?: Maybe<Scalars["String"]>
  machines?: Maybe<Scalars["Boolean"]>
  enableSubdomains?: Maybe<Scalars["Boolean"]>
}

export type CreateAppPayload = {
  __typename?: "CreateAppPayload"
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
}

export type CreateBuildInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appName: Scalars["ID"]
  machineId?: Maybe<Scalars["ID"]>
  imageOpts?: Maybe<BuildImageOptsInput>
  strategiesAvailable: Array<Scalars["String"]>
  builderType: Scalars["String"]
}

export type CreateBuildPayload = {
  __typename?: "CreateBuildPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  id: Scalars["ID"]
  status: Scalars["String"]
}

export type CreateCheckJobInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  organizationId: Scalars["ID"]
  url: Scalars["String"]
  locations: Array<Scalars["String"]>
  httpOptions: CheckJobHttpOptionsInput
}

export type CreateCheckJobPayload = {
  __typename?: "CreateCheckJobPayload"
  checkJob: CheckJob
  checkJobRun?: Maybe<CheckJobRun>
  clientMutationId?: Maybe<Scalars["String"]>
}

export type CreateCheckJobRunInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  checkJobId: Scalars["ID"]
}

export type CreateCheckJobRunPayload = {
  __typename?: "CreateCheckJobRunPayload"
  checkJob: CheckJob
  checkJobRun?: Maybe<CheckJobRun>
  clientMutationId?: Maybe<Scalars["String"]>
}

export type CreateDnsPortalInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  organizationId: Scalars["ID"]
  name?: Maybe<Scalars["String"]>
  title?: Maybe<Scalars["String"]>
  returnUrl?: Maybe<Scalars["String"]>
  returnUrlText?: Maybe<Scalars["String"]>
  supportUrl?: Maybe<Scalars["String"]>
  supportUrlText?: Maybe<Scalars["String"]>
  primaryColor?: Maybe<Scalars["String"]>
  accentColor?: Maybe<Scalars["String"]>
}

export type CreateDnsPortalPayload = {
  __typename?: "CreateDNSPortalPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  dnsPortal: DnsPortal
}

export type CreateDnsPortalSessionInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  dnsPortalId: Scalars["ID"]
  domainId: Scalars["ID"]
  title?: Maybe<Scalars["String"]>
  returnUrl?: Maybe<Scalars["String"]>
  returnUrlText?: Maybe<Scalars["String"]>
}

export type CreateDnsPortalSessionPayload = {
  __typename?: "CreateDNSPortalSessionPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  dnsPortalSession: DnsPortalSession
}

export type CreateDnsRecordInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  domainId: Scalars["ID"]
  type: DnsRecordType
  name: Scalars["String"]
  ttl: Scalars["Int"]
  rdata: Scalars["String"]
}

export type CreateDnsRecordPayload = {
  __typename?: "CreateDNSRecordPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  record: DnsRecord
}

export type CreateDelegatedWireGuardTokenInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  organizationId: Scalars["ID"]
  name?: Maybe<Scalars["String"]>
}

export type CreateDelegatedWireGuardTokenPayload = {
  __typename?: "CreateDelegatedWireGuardTokenPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  token: Scalars["String"]
}

export type CreateDoctorReportInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  data: Scalars["JSON"]
}

export type CreateDoctorReportPayload = {
  __typename?: "CreateDoctorReportPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  reportId: Scalars["ID"]
}

export type CreateDoctorUrlPayload = {
  __typename?: "CreateDoctorUrlPayload"
  putUrl: Scalars["String"]
}

export type CreateExtensionTosAgreementInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  addOnProviderName: Scalars["String"]
  organizationId?: Maybe<Scalars["ID"]>
}

export type CreateExtensionTosAgreementPayload = {
  __typename?: "CreateExtensionTosAgreementPayload"
  clientMutationId?: Maybe<Scalars["String"]>
}

export type CreateLimitedAccessTokenInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  name: Scalars["String"]
  organizationId: Scalars["ID"]
  profile: Scalars["String"]
  profileParams?: Maybe<Scalars["JSON"]>
  expiry?: Maybe<Scalars["String"]>
  optInThirdParties?: Maybe<Array<Scalars["String"]>>
  optOutThirdParties?: Maybe<Array<Scalars["String"]>>
}

export type CreateLimitedAccessTokenPayload = {
  __typename?: "CreateLimitedAccessTokenPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  limitedAccessToken: LimitedAccessToken
}

export type CreateOrganizationInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  name: Scalars["String"]
  appsV2DefaultOn?: Maybe<Scalars["Boolean"]>
}

export type CreateOrganizationInvitationInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  organizationId: Scalars["ID"]
  email: Scalars["String"]
}

export type CreateOrganizationInvitationPayload = {
  __typename?: "CreateOrganizationInvitationPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  invitation: OrganizationInvitation
}

export type CreateOrganizationPayload = {
  __typename?: "CreateOrganizationPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  organization: Organization
  token: Scalars["String"]
}

export type CreatePostgresClusterDatabaseInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appName: Scalars["String"]
  databaseName: Scalars["String"]
}

export type CreatePostgresClusterDatabasePayload = {
  __typename?: "CreatePostgresClusterDatabasePayload"
  clientMutationId?: Maybe<Scalars["String"]>
  database: PostgresClusterDatabase
  postgresClusterRole: PostgresClusterAppRole
}

export type CreatePostgresClusterUserInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appName: Scalars["String"]
  username: Scalars["String"]
  password: Scalars["String"]
  superuser?: Maybe<Scalars["Boolean"]>
}

export type CreatePostgresClusterUserPayload = {
  __typename?: "CreatePostgresClusterUserPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  postgresClusterRole: PostgresClusterAppRole
  user: PostgresClusterUser
}

export type CreateReleaseInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["ID"]
  image: Scalars["String"]
  platformVersion: Scalars["String"]
  definition: Scalars["JSON"]
  strategy: DeploymentStrategy
  buildId?: Maybe<Scalars["ID"]>
}

export type CreateReleasePayload = {
  __typename?: "CreateReleasePayload"
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
  release?: Maybe<Release>
}

export type CreateTemplateDeploymentInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  organizationId: Scalars["ID"]
  template: Scalars["JSON"]
  variables?: Maybe<Array<PropertyInput>>
}

export type CreateTemplateDeploymentPayload = {
  __typename?: "CreateTemplateDeploymentPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  templateDeployment: TemplateDeployment
}

export type CreateThirdPartyConfigurationInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  organizationId: Scalars["ID"]
  name: Scalars["String"]
  location: Scalars["String"]
  caveats?: Maybe<Scalars["CaveatSet"]>
  flyctlLevel: ThirdPartyConfigurationLevel
  uiexLevel: ThirdPartyConfigurationLevel
  customLevel: ThirdPartyConfigurationLevel
}

export type CreateThirdPartyConfigurationPayload = {
  __typename?: "CreateThirdPartyConfigurationPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  thirdPartyConfiguration: ThirdPartyConfiguration
}

export type CreateVolumeInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["ID"]
  name: Scalars["String"]
  region: Scalars["String"]
  sizeGb: Scalars["Int"]
  encrypted?: Maybe<Scalars["Boolean"]>
  requireUniqueZone?: Maybe<Scalars["Boolean"]>
  snapshotId?: Maybe<Scalars["ID"]>
  fsType?: Maybe<FsTypeType>
}

export type CreateVolumePayload = {
  __typename?: "CreateVolumePayload"
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
  volume: Volume
}

export type CreateVolumeSnapshotInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  volumeId: Scalars["ID"]
}

export type CreateVolumeSnapshotPayload = {
  __typename?: "CreateVolumeSnapshotPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  volume: Volume
}

export type DnsPortal = Node & {
  __typename?: "DNSPortal"
  accentColor: Scalars["String"]
  createdAt: Scalars["ISO8601DateTime"]
  id: Scalars["ID"]
  name: Scalars["String"]
  organization: Organization
  primaryColor: Scalars["String"]
  returnUrl?: Maybe<Scalars["String"]>
  returnUrlText?: Maybe<Scalars["String"]>
  supportUrl?: Maybe<Scalars["String"]>
  supportUrlText?: Maybe<Scalars["String"]>
  title: Scalars["String"]
  updatedAt: Scalars["ISO8601DateTime"]
}

export type DnsPortalConnection = {
  __typename?: "DNSPortalConnection"
  edges?: Maybe<Array<Maybe<DnsPortalEdge>>>
  nodes?: Maybe<Array<Maybe<DnsPortal>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type DnsPortalEdge = {
  __typename?: "DNSPortalEdge"
  cursor: Scalars["String"]
  node?: Maybe<DnsPortal>
}

export type DnsPortalSession = Node & {
  __typename?: "DNSPortalSession"
  createdAt: Scalars["ISO8601DateTime"]
  dnsPortal: DnsPortal
  expiresAt: Scalars["ISO8601DateTime"]
  id: Scalars["ID"]
  isExpired: Scalars["Boolean"]
  returnUrl?: Maybe<Scalars["String"]>
  returnUrlText?: Maybe<Scalars["String"]>
  title?: Maybe<Scalars["String"]>
  url: Scalars["String"]
}

export type DnsRecord = Node & {
  __typename?: "DNSRecord"
  createdAt: Scalars["ISO8601DateTime"]
  domain: Domain
  fqdn: Scalars["String"]
  id: Scalars["ID"]
  isApex: Scalars["Boolean"]
  isSystem: Scalars["Boolean"]
  isWildcard: Scalars["Boolean"]
  name: Scalars["String"]
  rdata: Scalars["String"]
  ttl: Scalars["Int"]
  type: DnsRecordType
  updatedAt: Scalars["ISO8601DateTime"]
}

export type DnsRecordAttributes = {
  __typename?: "DNSRecordAttributes"
  name: Scalars["String"]
  rdata: Scalars["String"]
  ttl: Scalars["Int"]
  type: DnsRecordType
}

export enum DnsRecordChangeAction {
  Create = "CREATE",
  Update = "UPDATE",
  Delete = "DELETE"
}

export type DnsRecordChangeInput = {
  action: DnsRecordChangeAction
  recordId?: Maybe<Scalars["ID"]>
  type?: Maybe<DnsRecordType>
  name?: Maybe<Scalars["String"]>
  ttl?: Maybe<Scalars["Int"]>
  rdata?: Maybe<Scalars["String"]>
}

export type DnsRecordConnection = {
  __typename?: "DNSRecordConnection"
  edges?: Maybe<Array<Maybe<DnsRecordEdge>>>
  nodes?: Maybe<Array<Maybe<DnsRecord>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type DnsRecordDiff = {
  __typename?: "DNSRecordDiff"
  action: DnsRecordChangeAction
  newAttributes?: Maybe<DnsRecordAttributes>
  newText?: Maybe<Scalars["String"]>
  oldAttributes?: Maybe<DnsRecordAttributes>
  oldText?: Maybe<Scalars["String"]>
}

export type DnsRecordEdge = {
  __typename?: "DNSRecordEdge"
  cursor: Scalars["String"]
  node?: Maybe<DnsRecord>
}

export enum DnsRecordType {
  A = "A",
  Aaaa = "AAAA",
  Alias = "ALIAS",
  Cname = "CNAME",
  Mx = "MX",
  Ns = "NS",
  Soa = "SOA",
  Txt = "TXT",
  Srv = "SRV"
}

export type DnsRecordWarning = {
  __typename?: "DNSRecordWarning"
  action: DnsRecordChangeAction
  attributes: DnsRecordAttributes
  message: Scalars["String"]
  record?: Maybe<DnsRecord>
}

export type DelegatedWireGuardToken = Node & {
  __typename?: "DelegatedWireGuardToken"
  id: Scalars["ID"]
  name: Scalars["String"]
}

export type DelegatedWireGuardTokenConnection = {
  __typename?: "DelegatedWireGuardTokenConnection"
  edges?: Maybe<Array<Maybe<DelegatedWireGuardTokenEdge>>>
  nodes?: Maybe<Array<Maybe<DelegatedWireGuardToken>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type DelegatedWireGuardTokenEdge = {
  __typename?: "DelegatedWireGuardTokenEdge"
  cursor: Scalars["String"]
  node?: Maybe<DelegatedWireGuardToken>
}

export type DeleteAddOnInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  addOnId?: Maybe<Scalars["ID"]>
  name?: Maybe<Scalars["String"]>
  provider?: Maybe<Scalars["String"]>
}

export type DeleteAddOnPayload = {
  __typename?: "DeleteAddOnPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  deletedAddOnName?: Maybe<Scalars["String"]>
}

export type DeleteAppPayload = {
  __typename?: "DeleteAppPayload"
  organization: Organization
}

export type DeleteCertificatePayload = {
  __typename?: "DeleteCertificatePayload"
  app?: Maybe<App>
  certificate?: Maybe<AppCertificate>
  errors?: Maybe<Array<Scalars["String"]>>
}

export type DeleteDnsPortalInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  dnsPortalId: Scalars["ID"]
}

export type DeleteDnsPortalPayload = {
  __typename?: "DeleteDNSPortalPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  organization: Organization
}

export type DeleteDnsPortalSessionInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  dnsPortalSessionId: Scalars["ID"]
}

export type DeleteDnsPortalSessionPayload = {
  __typename?: "DeleteDNSPortalSessionPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  dnsPortal: DnsPortal
}

export type DeleteDnsRecordInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  recordId: Scalars["ID"]
}

export type DeleteDnsRecordPayload = {
  __typename?: "DeleteDNSRecordPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  domain: Domain
}

export type DeleteDelegatedWireGuardTokenInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  organizationId: Scalars["ID"]
  token?: Maybe<Scalars["String"]>
  name?: Maybe<Scalars["String"]>
}

export type DeleteDelegatedWireGuardTokenPayload = {
  __typename?: "DeleteDelegatedWireGuardTokenPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  token: Scalars["String"]
}

export type DeleteDeploymentSourceInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["String"]
}

export type DeleteDeploymentSourcePayload = {
  __typename?: "DeleteDeploymentSourcePayload"
  app?: Maybe<App>
  clientMutationId?: Maybe<Scalars["String"]>
}

export type DeleteHealthCheckHandlerInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  organizationId: Scalars["ID"]
  name: Scalars["String"]
}

export type DeleteHealthCheckHandlerPayload = {
  __typename?: "DeleteHealthCheckHandlerPayload"
  clientMutationId?: Maybe<Scalars["String"]>
}

export type DeleteLimitedAccessTokenInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  token?: Maybe<Scalars["String"]>
  id?: Maybe<Scalars["ID"]>
  revokedBy?: Maybe<Scalars["String"]>
}

export type DeleteLimitedAccessTokenPayload = {
  __typename?: "DeleteLimitedAccessTokenPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  revokedBy?: Maybe<Scalars["String"]>
  token?: Maybe<Scalars["String"]>
}

export type DeleteOrganizationInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  organizationId: Scalars["ID"]
}

export type DeleteOrganizationInvitationInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  invitationId: Scalars["ID"]
}

export type DeleteOrganizationInvitationPayload = {
  __typename?: "DeleteOrganizationInvitationPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  organization: Organization
}

export type DeleteOrganizationMembershipInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  organizationId: Scalars["ID"]
  userId: Scalars["ID"]
}

export type DeleteOrganizationMembershipPayload = {
  __typename?: "DeleteOrganizationMembershipPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  organization: Organization
  user: User
}

export type DeleteOrganizationPayload = {
  __typename?: "DeleteOrganizationPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  deletedOrganizationId: Scalars["ID"]
}

export type DeleteRemoteBuilderInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  organizationId: Scalars["ID"]
}

export type DeleteRemoteBuilderPayload = {
  __typename?: "DeleteRemoteBuilderPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  organization: Organization
}

export type DeleteThirdPartyConfigurationInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  thirdPartyConfigurationId: Scalars["ID"]
}

export type DeleteThirdPartyConfigurationPayload = {
  __typename?: "DeleteThirdPartyConfigurationPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  ok: Scalars["Boolean"]
}

export type DeleteVolumeInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  volumeId: Scalars["ID"]
  lockId?: Maybe<Scalars["ID"]>
}

export type DeleteVolumePayload = {
  __typename?: "DeleteVolumePayload"
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
}

export type DeployImageInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["ID"]
  image: Scalars["String"]
  services?: Maybe<Array<ServiceInput>>
  definition?: Maybe<Scalars["JSON"]>
  strategy?: Maybe<DeploymentStrategy>
}

export type DeployImagePayload = {
  __typename?: "DeployImagePayload"
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
  release?: Maybe<Release>
  releaseCommand?: Maybe<ReleaseCommand>
}

export type DeploymentSource = {
  __typename?: "DeploymentSource"
  backend: Scalars["JSON"]
  baseDir: Scalars["String"]
  connected: Scalars["Boolean"]
  id: Scalars["ID"]
  provider: Scalars["String"]
  ref: Scalars["String"]
  repositoryId: Scalars["String"]
  repositoryUrl: Scalars["String"]
}

export type DeploymentStatus = {
  __typename?: "DeploymentStatus"
  allocations: Array<Allocation>
  description: Scalars["String"]
  desiredCount: Scalars["Int"]
  healthyCount: Scalars["Int"]
  id: Scalars["ID"]
  inProgress: Scalars["Boolean"]
  placedCount: Scalars["Int"]
  promoted: Scalars["Boolean"]
  status: Scalars["String"]
  successful: Scalars["Boolean"]
  unhealthyCount: Scalars["Int"]
  version: Scalars["Int"]
}

export enum DeploymentStrategy {
  Immediate = "IMMEDIATE",
  Simple = "SIMPLE",
  Rolling = "ROLLING",
  RollingOne = "ROLLING_ONE",
  Canary = "CANARY",
  Bluegreen = "BLUEGREEN"
}

export type DetachPostgresClusterInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  postgresClusterAppId: Scalars["ID"]
  appId: Scalars["ID"]
  postgresClusterAttachmentId?: Maybe<Scalars["ID"]>
}

export type DetachPostgresClusterPayload = {
  __typename?: "DetachPostgresClusterPayload"
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
  postgresClusterApp: App
}

export type Domain = Node & {
  __typename?: "Domain"
  autoRenew?: Maybe<Scalars["Boolean"]>
  createdAt: Scalars["ISO8601DateTime"]
  delegatedNameservers?: Maybe<Array<Scalars["String"]>>
  dnsRecords: DnsRecordConnection
  dnsStatus: DomainDnsStatus
  expiresAt?: Maybe<Scalars["ISO8601DateTime"]>
  id: Scalars["ID"]
  name: Scalars["String"]
  organization: Organization
  registrationStatus: DomainRegistrationStatus
  updatedAt: Scalars["ISO8601DateTime"]
  zoneNameservers: Array<Scalars["String"]>
}

export type DomainDnsRecordsArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type DomainConnection = {
  __typename?: "DomainConnection"
  edges?: Maybe<Array<Maybe<DomainEdge>>>
  nodes?: Maybe<Array<Maybe<Domain>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export enum DomainDnsStatus {
  Pending = "PENDING",
  Updating = "UPDATING",
  Ready = "READY"
}

export type DomainEdge = {
  __typename?: "DomainEdge"
  cursor: Scalars["String"]
  node?: Maybe<Domain>
}

export enum DomainRegistrationStatus {
  Unmanaged = "UNMANAGED",
  Registering = "REGISTERING",
  Registered = "REGISTERED",
  Transferring = "TRANSFERRING",
  Expired = "EXPIRED"
}

export type DummyWireGuardPeerInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  organizationId: Scalars["ID"]
  region?: Maybe<Scalars["String"]>
}

export type DummyWireGuardPeerPayload = {
  __typename?: "DummyWireGuardPeerPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  endpointip: Scalars["String"]
  localpub: Scalars["String"]
  peerip: Scalars["String"]
  privkey: Scalars["String"]
  pubkey: Scalars["String"]
}

export type EgressIpAddress = Node & {
  __typename?: "EgressIPAddress"
  id: Scalars["ID"]
  ip: Scalars["String"]
  region: Scalars["String"]
  version: Scalars["Int"]
}

export type EgressIpAddressConnection = {
  __typename?: "EgressIPAddressConnection"
  edges?: Maybe<Array<Maybe<EgressIpAddressEdge>>>
  nodes?: Maybe<Array<Maybe<EgressIpAddress>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type EgressIpAddressEdge = {
  __typename?: "EgressIPAddressEdge"
  cursor: Scalars["String"]
  node?: Maybe<EgressIpAddress>
}

export type EmptyAppRole = AppRole & {
  __typename?: "EmptyAppRole"
  name: Scalars["String"]
}

export type EnablePostgresConsulInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId?: Maybe<Scalars["ID"]>
  region?: Maybe<Scalars["String"]>
}

export type EnablePostgresConsulPayload = {
  __typename?: "EnablePostgresConsulPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  consulUrl: Scalars["String"]
}

export type EnsureDepotRemoteBuilderInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appName?: Maybe<Scalars["String"]>
  organizationId?: Maybe<Scalars["ID"]>
  region?: Maybe<Scalars["String"]>
  builderScope?: Maybe<Scalars["String"]>
}

export type EnsureDepotRemoteBuilderPayload = {
  __typename?: "EnsureDepotRemoteBuilderPayload"
  buildId: Scalars["String"]
  buildToken: Scalars["String"]
  clientMutationId?: Maybe<Scalars["String"]>
}

export type EnsureMachineRemoteBuilderInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appName?: Maybe<Scalars["String"]>
  organizationId?: Maybe<Scalars["ID"]>
  region?: Maybe<Scalars["String"]>
  v2?: Maybe<Scalars["Boolean"]>
}

export type EnsureMachineRemoteBuilderPayload = {
  __typename?: "EnsureMachineRemoteBuilderPayload"
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
  machine: Machine
}

export type EstablishSshKeyInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  organizationId: Scalars["ID"]
  override?: Maybe<Scalars["Boolean"]>
}

export type EstablishSshKeyPayload = {
  __typename?: "EstablishSSHKeyPayload"
  certificate: Scalars["String"]
  clientMutationId?: Maybe<Scalars["String"]>
}

export type ExportDnsZoneInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  domainId: Scalars["ID"]
}

export type ExportDnsZonePayload = {
  __typename?: "ExportDNSZonePayload"
  clientMutationId?: Maybe<Scalars["String"]>
  contents: Scalars["String"]
  domain: Domain
}

export type ExtendVolumeInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  volumeId: Scalars["ID"]
  sizeGb: Scalars["Int"]
}

export type ExtendVolumePayload = {
  __typename?: "ExtendVolumePayload"
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
  needsRestart: Scalars["Boolean"]
  volume: Volume
}

export type FinishBuildInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  buildId: Scalars["ID"]
  appName: Scalars["ID"]
  machineId?: Maybe<Scalars["ID"]>
  status: Scalars["String"]
  strategiesAttempted?: Maybe<Array<BuildStrategyAttemptInput>>
  builderMeta?: Maybe<BuilderMetaInput>
  finalImage?: Maybe<BuildFinalImageInput>
  timings?: Maybe<BuildTimingsInput>
  logs?: Maybe<Scalars["String"]>
}

export type FinishBuildPayload = {
  __typename?: "FinishBuildPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  id: Scalars["ID"]
  status: Scalars["String"]
  wallclockTimeMs: Scalars["Int"]
}

export type FlyPlatform = {
  __typename?: "FlyPlatform"
  flyctl: FlyctlRelease
  regions: Array<Region>
  requestRegion?: Maybe<Scalars["String"]>
  vmSizes: Array<VmSize>
}

export type FlyctlMachineHostAppRole = AppRole & {
  __typename?: "FlyctlMachineHostAppRole"
  name: Scalars["String"]
}

export type FlyctlRelease = {
  __typename?: "FlyctlRelease"
  timestamp: Scalars["ISO8601DateTime"]
  version: Scalars["String"]
}

export type ForkVolumeInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["ID"]
  sourceVolId: Scalars["ID"]
  name?: Maybe<Scalars["String"]>
  machinesOnly?: Maybe<Scalars["Boolean"]>
  lockId?: Maybe<Scalars["ID"]>
  remote?: Maybe<Scalars["Boolean"]>
}

export type ForkVolumePayload = {
  __typename?: "ForkVolumePayload"
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
  volume: Volume
}

export enum FsTypeType {
  Ext4 = "ext4",
  Raw = "raw"
}

export type GithubAppInstallation = {
  __typename?: "GithubAppInstallation"
  editUrl: Scalars["String"]
  id: Scalars["ID"]
  owner: Scalars["String"]
  repositories: Array<GithubRepository>
}

export type GithubIntegration = {
  __typename?: "GithubIntegration"
  installationUrl: Scalars["String"]
  installations: Array<GithubAppInstallation>
  viewerAuthenticated: Scalars["Boolean"]
}

export type GithubRepository = {
  __typename?: "GithubRepository"
  fork: Scalars["Boolean"]
  fullName: Scalars["String"]
  id: Scalars["String"]
  name: Scalars["String"]
  private: Scalars["Boolean"]
}

export type GrantPostgresClusterUserAccessInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appName: Scalars["String"]
  username: Scalars["String"]
  databaseName: Scalars["String"]
}

export type GrantPostgresClusterUserAccessPayload = {
  __typename?: "GrantPostgresClusterUserAccessPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  database: PostgresClusterDatabase
  postgresClusterRole: PostgresClusterAppRole
  user: PostgresClusterUser
}

export enum HttpMethod {
  Get = "GET",
  Post = "POST",
  Put = "PUT",
  Patch = "PATCH",
  Head = "HEAD",
  Delete = "DELETE"
}

export enum HttpProtocol {
  Http = "HTTP",
  Https = "HTTPS"
}

export type HealthCheck = {
  __typename?: "HealthCheck"
  entity: Scalars["String"]
  lastPassing?: Maybe<Scalars["ISO8601DateTime"]>
  name: Scalars["String"]
  output?: Maybe<Scalars["String"]>
  state: Scalars["String"]
}

export type HealthCheckConnection = {
  __typename?: "HealthCheckConnection"
  edges?: Maybe<Array<Maybe<HealthCheckEdge>>>
  nodes?: Maybe<Array<Maybe<HealthCheck>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type HealthCheckEdge = {
  __typename?: "HealthCheckEdge"
  cursor: Scalars["String"]
  node?: Maybe<HealthCheck>
}

export type HealthCheckHandler = {
  __typename?: "HealthCheckHandler"
  name: Scalars["String"]
  type: Scalars["String"]
}

export type HealthCheckHandlerConnection = {
  __typename?: "HealthCheckHandlerConnection"
  edges?: Maybe<Array<Maybe<HealthCheckHandlerEdge>>>
  nodes?: Maybe<Array<Maybe<HealthCheckHandler>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type HealthCheckHandlerEdge = {
  __typename?: "HealthCheckHandlerEdge"
  cursor: Scalars["String"]
  node?: Maybe<HealthCheckHandler>
}

export type HerokuApp = {
  __typename?: "HerokuApp"
  id: Scalars["String"]
  name: Scalars["String"]
  region?: Maybe<Scalars["String"]>
  releasedAt: Scalars["ISO8601DateTime"]
  stack?: Maybe<Scalars["String"]>
  teamName?: Maybe<Scalars["String"]>
}

export type HerokuIntegration = {
  __typename?: "HerokuIntegration"
  herokuApps: Array<HerokuApp>
  viewerAuthenticated: Scalars["Boolean"]
}

export type Host = Node & {
  __typename?: "Host"
  id: Scalars["ID"]
}

export type HostnameCheck = {
  __typename?: "HostnameCheck"
  aRecords: Array<Scalars["String"]>
  aaaaRecords: Array<Scalars["String"]>
  acmeDnsConfigured: Scalars["Boolean"]
  caaRecords: Array<Scalars["String"]>
  cnameRecords: Array<Scalars["String"]>
  dnsConfigured: Scalars["Boolean"]
  dnsProvider?: Maybe<Scalars["String"]>
  dnsVerificationRecord?: Maybe<Scalars["String"]>
  errors?: Maybe<Array<Scalars["String"]>>
  id: Scalars["ID"]
  isProxied: Scalars["Boolean"]
  resolvedAddresses: Array<Scalars["String"]>
  soa?: Maybe<Scalars["String"]>
}

export type IpAddress = Node & {
  __typename?: "IPAddress"
  address: Scalars["String"]
  createdAt: Scalars["ISO8601DateTime"]
  id: Scalars["ID"]
  network?: Maybe<Network>
  region?: Maybe<Scalars["String"]>
  serviceName?: Maybe<Scalars["String"]>
  type: IpAddressType
}

export type IpAddressConnection = {
  __typename?: "IPAddressConnection"
  edges?: Maybe<Array<Maybe<IpAddressEdge>>>
  nodes?: Maybe<Array<Maybe<IpAddress>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type IpAddressEdge = {
  __typename?: "IPAddressEdge"
  cursor: Scalars["String"]
  node?: Maybe<IpAddress>
}

export enum IpAddressType {
  V4 = "v4",
  V6 = "v6",
  PrivateV6 = "private_v6",
  SharedV4 = "shared_v4"
}

export type Image = {
  __typename?: "Image"
  absoluteRef: Scalars["String"]
  /** @deprecated Int cannot handle sizes over 2GB. Use compressed_size_full instead */
  compressedSize: Scalars["Int"]
  compressedSizeFull: Scalars["BigInt"]
  config: Scalars["JSON"]
  configDigest: Scalars["JSON"]
  createdAt: Scalars["ISO8601DateTime"]
  digest: Scalars["String"]
  id: Scalars["ID"]
  label: Scalars["String"]
  manifest: Scalars["JSON"]
  ref: Scalars["String"]
  registry: Scalars["String"]
  repository: Scalars["String"]
  tag?: Maybe<Scalars["String"]>
}

export type ImageVersion = {
  __typename?: "ImageVersion"
  digest: Scalars["String"]
  registry: Scalars["String"]
  repository: Scalars["String"]
  tag: Scalars["String"]
  version?: Maybe<Scalars["String"]>
}

export type ImportCertificatePayload = {
  __typename?: "ImportCertificatePayload"
  app?: Maybe<App>
  appCertificate?: Maybe<AppCertificate>
  certificate?: Maybe<Certificate>
  errors?: Maybe<Array<Scalars["String"]>>
}

export type ImportDnsZoneInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  domainId: Scalars["ID"]
  zonefile: Scalars["String"]
}

export type ImportDnsZonePayload = {
  __typename?: "ImportDNSZonePayload"
  changes: Array<DnsRecordDiff>
  clientMutationId?: Maybe<Scalars["String"]>
  domain: Domain
  warnings: Array<DnsRecordWarning>
}

export type Issue = Node & {
  __typename?: "Issue"
  createdAt: Scalars["ISO8601DateTime"]
  id: Scalars["ID"]
  internalId: Scalars["String"]
  message?: Maybe<Scalars["String"]>
  resolvedAt?: Maybe<Scalars["ISO8601DateTime"]>
  updatedAt: Scalars["ISO8601DateTime"]
}

export type IssueCertificateInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  organizationId: Scalars["ID"]
  appNames?: Maybe<Array<Scalars["String"]>>
  validHours?: Maybe<Scalars["Int"]>
  principals?: Maybe<Array<Scalars["String"]>>
  publicKey?: Maybe<Scalars["String"]>
}

export type IssueCertificatePayload = {
  __typename?: "IssueCertificatePayload"
  certificate: Scalars["String"]
  clientMutationId?: Maybe<Scalars["String"]>
  /** @deprecated Specify your own public key */
  key?: Maybe<Scalars["String"]>
}

export type IssueConnection = {
  __typename?: "IssueConnection"
  edges?: Maybe<Array<Maybe<IssueEdge>>>
  nodes?: Maybe<Array<Maybe<Issue>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type IssueEdge = {
  __typename?: "IssueEdge"
  cursor: Scalars["String"]
  node?: Maybe<Issue>
}

export type KillMachineInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId?: Maybe<Scalars["ID"]>
  id: Scalars["String"]
}

export type KillMachinePayload = {
  __typename?: "KillMachinePayload"
  clientMutationId?: Maybe<Scalars["String"]>
  machine: Machine
}

export type LaunchMachineInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId?: Maybe<Scalars["ID"]>
  organizationId?: Maybe<Scalars["ID"]>
  id?: Maybe<Scalars["String"]>
  name?: Maybe<Scalars["String"]>
  region?: Maybe<Scalars["String"]>
  config: Scalars["JSON"]
}

export type LaunchMachinePayload = {
  __typename?: "LaunchMachinePayload"
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
  machine: Machine
}

export type LimitedAccessToken = Node & {
  __typename?: "LimitedAccessToken"
  createdAt: Scalars["ISO8601DateTime"]
  expiresAt: Scalars["ISO8601DateTime"]
  id: Scalars["ID"]
  name: Scalars["String"]
  profile: Scalars["String"]
  revokedAt?: Maybe<Scalars["ISO8601DateTime"]>
  revokedBy?: Maybe<Scalars["String"]>
  token: Scalars["String"]
  tokenHeader?: Maybe<Scalars["String"]>
  user: User
}

export type LimitedAccessTokenConnection = {
  __typename?: "LimitedAccessTokenConnection"
  edges?: Maybe<Array<Maybe<LimitedAccessTokenEdge>>>
  nodes?: Maybe<Array<Maybe<LimitedAccessToken>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type LimitedAccessTokenEdge = {
  __typename?: "LimitedAccessTokenEdge"
  cursor: Scalars["String"]
  node?: Maybe<LimitedAccessToken>
}

export type LockAppInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["ID"]
}

export type LockAppPayload = {
  __typename?: "LockAppPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  expiration?: Maybe<Scalars["ISO8601DateTime"]>
  lockId?: Maybe<Scalars["ID"]>
}

export type LogEntry = {
  __typename?: "LogEntry"
  id: Scalars["String"]
  instanceId: Scalars["String"]
  level: Scalars["String"]
  message: Scalars["String"]
  region: Scalars["String"]
  timestamp: Scalars["ISO8601DateTime"]
}

export type LogOutInput = {
  clientMutationId?: Maybe<Scalars["String"]>
}

export type LogOutPayload = {
  __typename?: "LogOutPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  ok: Scalars["Boolean"]
}

export type LoggedCertificate = Node & {
  __typename?: "LoggedCertificate"
  cert: Scalars["String"]
  id: Scalars["ID"]
  root: Scalars["Boolean"]
}

export type LoggedCertificateConnection = {
  __typename?: "LoggedCertificateConnection"
  edges?: Maybe<Array<Maybe<LoggedCertificateEdge>>>
  nodes?: Maybe<Array<Maybe<LoggedCertificate>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type LoggedCertificateEdge = {
  __typename?: "LoggedCertificateEdge"
  cursor: Scalars["String"]
  node?: Maybe<LoggedCertificate>
}

export type Macaroon = Principal & {
  __typename?: "Macaroon"
  avatarUrl: Scalars["String"]
  /** @deprecated Use User fragment on Viewer instead */
  createdAt?: Maybe<Scalars["ISO8601DateTime"]>
  email: Scalars["String"]
  /** @deprecated Use User fragment on Viewer instead */
  featureFlags?: Maybe<Array<Scalars["String"]>>
  /** @deprecated Use User fragment on Viewer instead */
  hasNodeproxyApps?: Maybe<Scalars["Boolean"]>
  /** @deprecated Use User fragment on Viewer instead */
  id?: Maybe<Scalars["ID"]>
  /** @deprecated Use User fragment on Viewer instead */
  lastRegion?: Maybe<Scalars["String"]>
  name?: Maybe<Scalars["String"]>
  /** @deprecated Use User fragment on Viewer instead */
  organizations?: Maybe<OrganizationConnection>
  /** @deprecated Use User fragment on Viewer instead */
  personalOrganization?: Maybe<Organization>
  trust: OrganizationTrust
  /** @deprecated Use User fragment on Viewer instead */
  twoFactorProtection?: Maybe<Scalars["Boolean"]>
  /** @deprecated Use User fragment on Viewer instead */
  username?: Maybe<Scalars["String"]>
}

export type MacaroonOrganizationsArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type Machine = Node & {
  __typename?: "Machine"
  app: App
  config: Scalars["JSON"]
  createdAt: Scalars["ISO8601DateTime"]
  egressIpAddresses: EgressIpAddressConnection
  events: MachineEventConnection
  host: Host
  id: Scalars["ID"]
  instanceId: Scalars["String"]
  ips: MachineIpConnection
  name: Scalars["String"]
  region: Scalars["String"]
  state: Scalars["String"]
  updatedAt: Scalars["ISO8601DateTime"]
}

export type MachineEgressIpAddressesArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type MachineEventsArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
  kind?: Maybe<Scalars["String"]>
}

export type MachineIpsArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type MachineConnection = {
  __typename?: "MachineConnection"
  edges?: Maybe<Array<Maybe<MachineEdge>>>
  nodes?: Maybe<Array<Maybe<Machine>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type MachineEdge = {
  __typename?: "MachineEdge"
  cursor: Scalars["String"]
  node?: Maybe<Machine>
}

export type MachineEvent = {
  id: Scalars["ID"]
  kind: Scalars["String"]
  timestamp: Scalars["ISO8601DateTime"]
}

export type MachineEventConnection = {
  __typename?: "MachineEventConnection"
  edges?: Maybe<Array<Maybe<MachineEventEdge>>>
  nodes?: Maybe<Array<Maybe<MachineEvent>>>
  pageInfo: PageInfo
}

export type MachineEventDestroy = MachineEvent & {
  __typename?: "MachineEventDestroy"
  id: Scalars["ID"]
  kind: Scalars["String"]
  timestamp: Scalars["ISO8601DateTime"]
}

export type MachineEventEdge = {
  __typename?: "MachineEventEdge"
  cursor: Scalars["String"]
  node?: Maybe<MachineEvent>
}

export type MachineEventExit = MachineEvent & {
  __typename?: "MachineEventExit"
  exitCode: Scalars["Int"]
  id: Scalars["ID"]
  kind: Scalars["String"]
  metadata: Scalars["JSON"]
  oomKilled: Scalars["Boolean"]
  requestedStop: Scalars["Boolean"]
  timestamp: Scalars["ISO8601DateTime"]
}

export type MachineEventGeneric = MachineEvent & {
  __typename?: "MachineEventGeneric"
  id: Scalars["ID"]
  kind: Scalars["String"]
  timestamp: Scalars["ISO8601DateTime"]
}

export type MachineEventStart = MachineEvent & {
  __typename?: "MachineEventStart"
  id: Scalars["ID"]
  kind: Scalars["String"]
  timestamp: Scalars["ISO8601DateTime"]
}

export type MachineIp = Node & {
  __typename?: "MachineIP"
  family: Scalars["String"]
  id: Scalars["ID"]
  ip: Scalars["String"]
  kind: Scalars["String"]
  maskSize: Scalars["Int"]
}

export type MachineIpConnection = {
  __typename?: "MachineIPConnection"
  edges?: Maybe<Array<Maybe<MachineIpEdge>>>
  nodes?: Maybe<Array<Maybe<MachineIp>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type MachineIpEdge = {
  __typename?: "MachineIPEdge"
  cursor: Scalars["String"]
  node?: Maybe<MachineIp>
}

export type MoveAppInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["ID"]
  organizationId: Scalars["ID"]
}

export type MoveAppPayload = {
  __typename?: "MoveAppPayload"
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
}

export type Mutations = {
  __typename?: "Mutations"
  addCertificate?: Maybe<AddCertificatePayload>
  addWireGuardPeer?: Maybe<AddWireGuardPeerPayload>
  allocateEgressIpAddress?: Maybe<AllocateEgressIpAddressPayload>
  allocateIpAddress?: Maybe<AllocateIpAddressPayload>
  attachPostgresCluster?: Maybe<AttachPostgresClusterPayload>
  cancelBuild?: Maybe<CancelBuildPayload>
  checkCertificate?: Maybe<CheckCertificatePayload>
  configureRegions?: Maybe<ConfigureRegionsPayload>
  createAddOn?: Maybe<CreateAddOnPayload>
  createApp?: Maybe<CreateAppPayload>
  createBuild?: Maybe<CreateBuildPayload>
  createCheckJob?: Maybe<CreateCheckJobPayload>
  createCheckJobRun?: Maybe<CreateCheckJobRunPayload>
  createDelegatedWireGuardToken?: Maybe<CreateDelegatedWireGuardTokenPayload>
  createDnsPortal?: Maybe<CreateDnsPortalPayload>
  createDnsPortalSession?: Maybe<CreateDnsPortalSessionPayload>
  createDnsRecord?: Maybe<CreateDnsRecordPayload>
  createDoctorReport?: Maybe<CreateDoctorReportPayload>
  createDoctorUrl?: Maybe<CreateDoctorUrlPayload>
  createExtensionTosAgreement?: Maybe<CreateExtensionTosAgreementPayload>
  createLimitedAccessToken?: Maybe<CreateLimitedAccessTokenPayload>
  createOrganization?: Maybe<CreateOrganizationPayload>
  createOrganizationInvitation?: Maybe<CreateOrganizationInvitationPayload>
  createPostgresClusterDatabase?: Maybe<CreatePostgresClusterDatabasePayload>
  createPostgresClusterUser?: Maybe<CreatePostgresClusterUserPayload>
  createRelease?: Maybe<CreateReleasePayload>
  createTemplateDeployment?: Maybe<CreateTemplateDeploymentPayload>
  createThirdPartyConfiguration?: Maybe<CreateThirdPartyConfigurationPayload>
  createVolume?: Maybe<CreateVolumePayload>
  createVolumeSnapshot?: Maybe<CreateVolumeSnapshotPayload>
  deleteAddOn?: Maybe<DeleteAddOnPayload>
  deleteApp?: Maybe<DeleteAppPayload>
  deleteCertificate?: Maybe<DeleteCertificatePayload>
  deleteDelegatedWireGuardToken?: Maybe<DeleteDelegatedWireGuardTokenPayload>
  deleteDeploymentSource?: Maybe<DeleteDeploymentSourcePayload>
  deleteDnsPortal?: Maybe<DeleteDnsPortalPayload>
  deleteDnsPortalSession?: Maybe<DeleteDnsPortalSessionPayload>
  deleteDnsRecord?: Maybe<DeleteDnsRecordPayload>
  deleteHealthCheckHandler?: Maybe<DeleteHealthCheckHandlerPayload>
  deleteLimitedAccessToken?: Maybe<DeleteLimitedAccessTokenPayload>
  deleteOrganization?: Maybe<DeleteOrganizationPayload>
  deleteOrganizationInvitation?: Maybe<DeleteOrganizationInvitationPayload>
  deleteOrganizationMembership?: Maybe<DeleteOrganizationMembershipPayload>
  deleteRemoteBuilder?: Maybe<DeleteRemoteBuilderPayload>
  deleteThirdPartyConfiguration?: Maybe<DeleteThirdPartyConfigurationPayload>
  deleteVolume?: Maybe<DeleteVolumePayload>
  deployImage?: Maybe<DeployImagePayload>
  detachPostgresCluster?: Maybe<DetachPostgresClusterPayload>
  dummyWireGuardPeer?: Maybe<DummyWireGuardPeerPayload>
  enablePostgresConsul?: Maybe<EnablePostgresConsulPayload>
  ensureDepotRemoteBuilder?: Maybe<EnsureDepotRemoteBuilderPayload>
  ensureMachineRemoteBuilder?: Maybe<EnsureMachineRemoteBuilderPayload>
  establishSshKey?: Maybe<EstablishSshKeyPayload>
  exportDnsZone?: Maybe<ExportDnsZonePayload>
  extendVolume?: Maybe<ExtendVolumePayload>
  finishBuild?: Maybe<FinishBuildPayload>
  forkVolume?: Maybe<ForkVolumePayload>
  grantPostgresClusterUserAccess?: Maybe<GrantPostgresClusterUserAccessPayload>
  importCertificate?: Maybe<ImportCertificatePayload>
  importDnsZone?: Maybe<ImportDnsZonePayload>
  issueCertificate?: Maybe<IssueCertificatePayload>
  killMachine?: Maybe<KillMachinePayload>
  launchMachine?: Maybe<LaunchMachinePayload>
  lockApp?: Maybe<LockAppPayload>
  logOut?: Maybe<LogOutPayload>
  moveApp?: Maybe<MoveAppPayload>
  nomadToMachinesMigration?: Maybe<NomadToMachinesMigrationPayload>
  nomadToMachinesMigrationPrep?: Maybe<NomadToMachinesMigrationPrepPayload>
  pauseApp?: Maybe<PauseAppPayload>
  releaseEgressIpAddress?: Maybe<ReleaseEgressIpAddressPayload>
  releaseIpAddress?: Maybe<ReleaseIpAddressPayload>
  removeMachine?: Maybe<RemoveMachinePayload>
  removeWireGuardPeer?: Maybe<RemoveWireGuardPeerPayload>
  resetAddOnPassword?: Maybe<ResetAddOnPasswordPayload>
  restartAllocation?: Maybe<RestartAllocationPayload>
  restartApp?: Maybe<RestartAppPayload>
  restoreVolumeSnapshot?: Maybe<RestoreVolumeSnapshotPayload>
  resumeApp?: Maybe<ResumeAppPayload>
  revokePostgresClusterUserAccess?: Maybe<
    RevokePostgresClusterUserAccessPayload
  >
  saveDeploymentSource?: Maybe<SaveDeploymentSourcePayload>
  scaleApp?: Maybe<ScaleAppPayload>
  setAppsV2DefaultOn?: Maybe<SetAppsv2DefaultOnPayload>
  setPagerdutyHandler?: Maybe<SetPagerdutyHandlerPayload>
  setPlatformVersion?: Maybe<SetPlatformVersionPayload>
  setSecrets?: Maybe<SetSecretsPayload>
  setSlackHandler?: Maybe<SetSlackHandlerPayload>
  setVmCount?: Maybe<SetVmCountPayload>
  setVmSize?: Maybe<SetVmSizePayload>
  startBuild?: Maybe<StartBuildPayload>
  startMachine?: Maybe<StartMachinePayload>
  stopAllocation?: Maybe<StopAllocationPayload>
  stopMachine?: Maybe<StopMachinePayload>
  unlockApp?: Maybe<UnlockAppPayload>
  unsetSecrets?: Maybe<UnsetSecretsPayload>
  updateAddOn?: Maybe<UpdateAddOnPayload>
  updateAutoscaleConfig?: Maybe<UpdateAutoscaleConfigPayload>
  updateDnsPortal?: Maybe<UpdateDnsPortalPayload>
  updateDnsRecord?: Maybe<UpdateDnsRecordPayload>
  updateDnsRecords?: Maybe<UpdateDnsRecordsPayload>
  updateOrganizationMembership?: Maybe<UpdateOrganizationMembershipPayload>
  updateRelease?: Maybe<UpdateReleasePayload>
  updateRemoteBuilder?: Maybe<UpdateRemoteBuilderPayload>
  updateThirdPartyConfiguration?: Maybe<UpdateThirdPartyConfigurationPayload>
  validateWireGuardPeers?: Maybe<ValidateWireGuardPeersPayload>
}

export type MutationsAddCertificateArgs = {
  appId: Scalars["ID"]
  hostname: Scalars["String"]
}

export type MutationsAddWireGuardPeerArgs = {
  input: AddWireGuardPeerInput
}

export type MutationsAllocateEgressIpAddressArgs = {
  input: AllocateEgressIpAddressInput
}

export type MutationsAllocateIpAddressArgs = {
  input: AllocateIpAddressInput
}

export type MutationsAttachPostgresClusterArgs = {
  input: AttachPostgresClusterInput
}

export type MutationsCancelBuildArgs = {
  buildId: Scalars["ID"]
}

export type MutationsCheckCertificateArgs = {
  input: CheckCertificateInput
}

export type MutationsConfigureRegionsArgs = {
  input: ConfigureRegionsInput
}

export type MutationsCreateAddOnArgs = {
  input: CreateAddOnInput
}

export type MutationsCreateAppArgs = {
  input: CreateAppInput
}

export type MutationsCreateBuildArgs = {
  input: CreateBuildInput
}

export type MutationsCreateCheckJobArgs = {
  input: CreateCheckJobInput
}

export type MutationsCreateCheckJobRunArgs = {
  input: CreateCheckJobRunInput
}

export type MutationsCreateDelegatedWireGuardTokenArgs = {
  input: CreateDelegatedWireGuardTokenInput
}

export type MutationsCreateDnsPortalArgs = {
  input: CreateDnsPortalInput
}

export type MutationsCreateDnsPortalSessionArgs = {
  input: CreateDnsPortalSessionInput
}

export type MutationsCreateDnsRecordArgs = {
  input: CreateDnsRecordInput
}

export type MutationsCreateDoctorReportArgs = {
  input: CreateDoctorReportInput
}

export type MutationsCreateExtensionTosAgreementArgs = {
  input: CreateExtensionTosAgreementInput
}

export type MutationsCreateLimitedAccessTokenArgs = {
  input: CreateLimitedAccessTokenInput
}

export type MutationsCreateOrganizationArgs = {
  input: CreateOrganizationInput
}

export type MutationsCreateOrganizationInvitationArgs = {
  input: CreateOrganizationInvitationInput
}

export type MutationsCreatePostgresClusterDatabaseArgs = {
  input: CreatePostgresClusterDatabaseInput
}

export type MutationsCreatePostgresClusterUserArgs = {
  input: CreatePostgresClusterUserInput
}

export type MutationsCreateReleaseArgs = {
  input: CreateReleaseInput
}

export type MutationsCreateTemplateDeploymentArgs = {
  input: CreateTemplateDeploymentInput
}

export type MutationsCreateThirdPartyConfigurationArgs = {
  input: CreateThirdPartyConfigurationInput
}

export type MutationsCreateVolumeArgs = {
  input: CreateVolumeInput
}

export type MutationsCreateVolumeSnapshotArgs = {
  input: CreateVolumeSnapshotInput
}

export type MutationsDeleteAddOnArgs = {
  input: DeleteAddOnInput
}

export type MutationsDeleteAppArgs = {
  appId: Scalars["ID"]
}

export type MutationsDeleteCertificateArgs = {
  appId: Scalars["ID"]
  hostname: Scalars["String"]
}

export type MutationsDeleteDelegatedWireGuardTokenArgs = {
  input: DeleteDelegatedWireGuardTokenInput
}

export type MutationsDeleteDeploymentSourceArgs = {
  input: DeleteDeploymentSourceInput
}

export type MutationsDeleteDnsPortalArgs = {
  input: DeleteDnsPortalInput
}

export type MutationsDeleteDnsPortalSessionArgs = {
  input: DeleteDnsPortalSessionInput
}

export type MutationsDeleteDnsRecordArgs = {
  input: DeleteDnsRecordInput
}

export type MutationsDeleteHealthCheckHandlerArgs = {
  input: DeleteHealthCheckHandlerInput
}

export type MutationsDeleteLimitedAccessTokenArgs = {
  input: DeleteLimitedAccessTokenInput
}

export type MutationsDeleteOrganizationArgs = {
  input: DeleteOrganizationInput
}

export type MutationsDeleteOrganizationInvitationArgs = {
  input: DeleteOrganizationInvitationInput
}

export type MutationsDeleteOrganizationMembershipArgs = {
  input: DeleteOrganizationMembershipInput
}

export type MutationsDeleteRemoteBuilderArgs = {
  input: DeleteRemoteBuilderInput
}

export type MutationsDeleteThirdPartyConfigurationArgs = {
  input: DeleteThirdPartyConfigurationInput
}

export type MutationsDeleteVolumeArgs = {
  input: DeleteVolumeInput
}

export type MutationsDeployImageArgs = {
  input: DeployImageInput
}

export type MutationsDetachPostgresClusterArgs = {
  input: DetachPostgresClusterInput
}

export type MutationsDummyWireGuardPeerArgs = {
  input: DummyWireGuardPeerInput
}

export type MutationsEnablePostgresConsulArgs = {
  input: EnablePostgresConsulInput
}

export type MutationsEnsureDepotRemoteBuilderArgs = {
  input: EnsureDepotRemoteBuilderInput
}

export type MutationsEnsureMachineRemoteBuilderArgs = {
  input: EnsureMachineRemoteBuilderInput
}

export type MutationsEstablishSshKeyArgs = {
  input: EstablishSshKeyInput
}

export type MutationsExportDnsZoneArgs = {
  input: ExportDnsZoneInput
}

export type MutationsExtendVolumeArgs = {
  input: ExtendVolumeInput
}

export type MutationsFinishBuildArgs = {
  input: FinishBuildInput
}

export type MutationsForkVolumeArgs = {
  input: ForkVolumeInput
}

export type MutationsGrantPostgresClusterUserAccessArgs = {
  input: GrantPostgresClusterUserAccessInput
}

export type MutationsImportCertificateArgs = {
  appId: Scalars["ID"]
  fullchain: Scalars["String"]
  privateKey: Scalars["String"]
  hostname?: Maybe<Scalars["String"]>
}

export type MutationsImportDnsZoneArgs = {
  input: ImportDnsZoneInput
}

export type MutationsIssueCertificateArgs = {
  input: IssueCertificateInput
}

export type MutationsKillMachineArgs = {
  input: KillMachineInput
}

export type MutationsLaunchMachineArgs = {
  input: LaunchMachineInput
}

export type MutationsLockAppArgs = {
  input: LockAppInput
}

export type MutationsLogOutArgs = {
  input: LogOutInput
}

export type MutationsMoveAppArgs = {
  input: MoveAppInput
}

export type MutationsNomadToMachinesMigrationArgs = {
  input: NomadToMachinesMigrationInput
}

export type MutationsNomadToMachinesMigrationPrepArgs = {
  input: NomadToMachinesMigrationPrepInput
}

export type MutationsPauseAppArgs = {
  input: PauseAppInput
}

export type MutationsReleaseEgressIpAddressArgs = {
  input: ReleaseEgressIpAddressInput
}

export type MutationsReleaseIpAddressArgs = {
  input: ReleaseIpAddressInput
}

export type MutationsRemoveMachineArgs = {
  input: RemoveMachineInput
}

export type MutationsRemoveWireGuardPeerArgs = {
  input: RemoveWireGuardPeerInput
}

export type MutationsResetAddOnPasswordArgs = {
  input: ResetAddOnPasswordInput
}

export type MutationsRestartAllocationArgs = {
  input: RestartAllocationInput
}

export type MutationsRestartAppArgs = {
  input: RestartAppInput
}

export type MutationsRestoreVolumeSnapshotArgs = {
  input: RestoreVolumeSnapshotInput
}

export type MutationsResumeAppArgs = {
  input: ResumeAppInput
}

export type MutationsRevokePostgresClusterUserAccessArgs = {
  input: RevokePostgresClusterUserAccessInput
}

export type MutationsSaveDeploymentSourceArgs = {
  input: SaveDeploymentSourceInput
}

export type MutationsScaleAppArgs = {
  input: ScaleAppInput
}

export type MutationsSetAppsV2DefaultOnArgs = {
  input: SetAppsv2DefaultOnInput
}

export type MutationsSetPagerdutyHandlerArgs = {
  input: SetPagerdutyHandlerInput
}

export type MutationsSetPlatformVersionArgs = {
  input: SetPlatformVersionInput
}

export type MutationsSetSecretsArgs = {
  input: SetSecretsInput
}

export type MutationsSetSlackHandlerArgs = {
  input: SetSlackHandlerInput
}

export type MutationsSetVmCountArgs = {
  input: SetVmCountInput
}

export type MutationsSetVmSizeArgs = {
  input: SetVmSizeInput
}

export type MutationsStartBuildArgs = {
  input: StartBuildInput
}

export type MutationsStartMachineArgs = {
  input: StartMachineInput
}

export type MutationsStopAllocationArgs = {
  input: StopAllocationInput
}

export type MutationsStopMachineArgs = {
  input: StopMachineInput
}

export type MutationsUnlockAppArgs = {
  input: UnlockAppInput
}

export type MutationsUnsetSecretsArgs = {
  input: UnsetSecretsInput
}

export type MutationsUpdateAddOnArgs = {
  input: UpdateAddOnInput
}

export type MutationsUpdateAutoscaleConfigArgs = {
  input: UpdateAutoscaleConfigInput
}

export type MutationsUpdateDnsPortalArgs = {
  input: UpdateDnsPortalInput
}

export type MutationsUpdateDnsRecordArgs = {
  input: UpdateDnsRecordInput
}

export type MutationsUpdateDnsRecordsArgs = {
  input: UpdateDnsRecordsInput
}

export type MutationsUpdateOrganizationMembershipArgs = {
  input: UpdateOrganizationMembershipInput
}

export type MutationsUpdateReleaseArgs = {
  input: UpdateReleaseInput
}

export type MutationsUpdateRemoteBuilderArgs = {
  input: UpdateRemoteBuilderInput
}

export type MutationsUpdateThirdPartyConfigurationArgs = {
  input: UpdateThirdPartyConfigurationInput
}

export type MutationsValidateWireGuardPeersArgs = {
  input: ValidateWireGuardPeersInput
}

export type Network = Node & {
  __typename?: "Network"
  createdAt: Scalars["ISO8601DateTime"]
  id: Scalars["ID"]
  name: Scalars["String"]
  organization: Organization
  updatedAt: Scalars["ISO8601DateTime"]
}

export type Node = {
  id: Scalars["ID"]
}

export type NomadToMachinesMigrationInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["ID"]
}

export type NomadToMachinesMigrationPayload = {
  __typename?: "NomadToMachinesMigrationPayload"
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
}

export type NomadToMachinesMigrationPrepInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["ID"]
}

export type NomadToMachinesMigrationPrepPayload = {
  __typename?: "NomadToMachinesMigrationPrepPayload"
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
}

export type Organization = Node & {
  __typename?: "Organization"
  activeDiscountName?: Maybe<Scalars["String"]>
  addOnSsoLink?: Maybe<Scalars["String"]>
  addOns: AddOnConnection
  agreedToProviderTos: Scalars["Boolean"]
  apps: AppConnection
  billable: Scalars["Boolean"]
  billingStatus: BillingStatus
  creditBalance: Scalars["Int"]
  /** @deprecated Use credit_balance instead */
  creditBalanceFormatted: Scalars["String"]
  delegatedWireGuardTokens: DelegatedWireGuardTokenConnection
  dnsPortal: DnsPortal
  dnsPortals: DnsPortalConnection
  domain?: Maybe<Domain>
  domains: DomainConnection
  extensionSsoLink?: Maybe<Scalars["String"]>
  healthCheckHandlers: HealthCheckHandlerConnection
  healthChecks: HealthCheckConnection
  id: Scalars["ID"]
  internalNumericId: Scalars["BigInt"]
  invitations: OrganizationInvitationConnection
  isCreditCardSaved: Scalars["Boolean"]
  limitedAccessTokens: LimitedAccessTokenConnection
  loggedCertificates?: Maybe<LoggedCertificateConnection>
  members: OrganizationMembershipsConnection
  name: Scalars["String"]
  paidPlan: Scalars["Boolean"]
  provisionsBetaExtensions: Scalars["Boolean"]
  rawSlug: Scalars["String"]
  remoteBuilderApp?: Maybe<App>
  remoteBuilderImage: Scalars["String"]
  settings?: Maybe<Scalars["JSON"]>
  slug: Scalars["String"]
  sshCertificate?: Maybe<Scalars["String"]>
  thirdPartyConfigurations: ThirdPartyConfigurationConnection
  trust: OrganizationTrust
  type: OrganizationType
  viewerRole: Scalars["String"]
  wireGuardPeer: WireGuardPeer
  wireGuardPeers: WireGuardPeerConnection
}

export type OrganizationAddOnsArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
  type?: Maybe<AddOnType>
}

export type OrganizationAgreedToProviderTosArgs = {
  providerName: Scalars["String"]
}

export type OrganizationAppsArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type OrganizationDelegatedWireGuardTokensArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type OrganizationDnsPortalArgs = {
  name: Scalars["String"]
}

export type OrganizationDnsPortalsArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type OrganizationDomainArgs = {
  name: Scalars["String"]
}

export type OrganizationDomainsArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type OrganizationExtensionSsoLinkArgs = {
  provider: Scalars["String"]
}

export type OrganizationHealthCheckHandlersArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type OrganizationHealthChecksArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type OrganizationInvitationsArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type OrganizationLimitedAccessTokensArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type OrganizationLoggedCertificatesArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type OrganizationMembersArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type OrganizationThirdPartyConfigurationsArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type OrganizationWireGuardPeerArgs = {
  name: Scalars["String"]
}

export type OrganizationWireGuardPeersArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export enum OrganizationAlertsEnabled {
  Enabled = "ENABLED",
  NotEnabled = "NOT_ENABLED"
}

export type OrganizationConnection = {
  __typename?: "OrganizationConnection"
  edges?: Maybe<Array<Maybe<OrganizationEdge>>>
  nodes?: Maybe<Array<Maybe<Organization>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type OrganizationEdge = {
  __typename?: "OrganizationEdge"
  cursor: Scalars["String"]
  node?: Maybe<Organization>
}

export type OrganizationInvitation = Node & {
  __typename?: "OrganizationInvitation"
  createdAt: Scalars["ISO8601DateTime"]
  email: Scalars["String"]
  id: Scalars["ID"]
  inviter: User
  organization: Organization
  redeemed: Scalars["Boolean"]
  redeemedAt?: Maybe<Scalars["ISO8601DateTime"]>
}

export type OrganizationInvitationConnection = {
  __typename?: "OrganizationInvitationConnection"
  edges?: Maybe<Array<Maybe<OrganizationInvitationEdge>>>
  nodes?: Maybe<Array<Maybe<OrganizationInvitation>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type OrganizationInvitationEdge = {
  __typename?: "OrganizationInvitationEdge"
  cursor: Scalars["String"]
  node?: Maybe<OrganizationInvitation>
}

export enum OrganizationMemberRole {
  Admin = "ADMIN",
  Member = "MEMBER"
}

export type OrganizationMembershipsConnection = {
  __typename?: "OrganizationMembershipsConnection"
  edges?: Maybe<Array<Maybe<OrganizationMembershipsEdge>>>
  nodes?: Maybe<Array<Maybe<User>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type OrganizationMembershipsEdge = {
  __typename?: "OrganizationMembershipsEdge"
  alertsEnabled: OrganizationAlertsEnabled
  cursor: Scalars["String"]
  joinedAt: Scalars["ISO8601DateTime"]
  node?: Maybe<User>
  role: OrganizationMemberRole
}

export enum OrganizationTrust {
  Unknown = "UNKNOWN",
  Restricted = "RESTRICTED",
  Banned = "BANNED",
  Low = "LOW",
  High = "HIGH"
}

export enum OrganizationType {
  Personal = "PERSONAL",
  Shared = "SHARED"
}

export type PageInfo = {
  __typename?: "PageInfo"
  endCursor?: Maybe<Scalars["String"]>
  hasNextPage: Scalars["Boolean"]
  hasPreviousPage: Scalars["Boolean"]
  startCursor?: Maybe<Scalars["String"]>
}

export type PauseAppInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["ID"]
}

export type PauseAppPayload = {
  __typename?: "PauseAppPayload"
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
}

export enum PlatformVersionEnum {
  Nomad = "nomad",
  Machines = "machines",
  Detached = "detached"
}

export type PostgresClusterAppRole = AppRole & {
  __typename?: "PostgresClusterAppRole"
  databases: Array<PostgresClusterDatabase>
  name: Scalars["String"]
  users: Array<PostgresClusterUser>
}

export type PostgresClusterAttachment = Node & {
  __typename?: "PostgresClusterAttachment"
  databaseName: Scalars["String"]
  databaseUser: Scalars["String"]
  environmentVariableName: Scalars["String"]
  id: Scalars["ID"]
}

export type PostgresClusterAttachmentConnection = {
  __typename?: "PostgresClusterAttachmentConnection"
  edges?: Maybe<Array<Maybe<PostgresClusterAttachmentEdge>>>
  nodes?: Maybe<Array<Maybe<PostgresClusterAttachment>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type PostgresClusterAttachmentEdge = {
  __typename?: "PostgresClusterAttachmentEdge"
  cursor: Scalars["String"]
  node?: Maybe<PostgresClusterAttachment>
}

export type PostgresClusterDatabase = {
  __typename?: "PostgresClusterDatabase"
  name: Scalars["String"]
  users: Array<Scalars["String"]>
}

export type PostgresClusterUser = {
  __typename?: "PostgresClusterUser"
  databases: Array<Scalars["String"]>
  isSuperuser: Scalars["Boolean"]
  username: Scalars["String"]
}

export type PriceTier = {
  __typename?: "PriceTier"
  unitAmount?: Maybe<Scalars["String"]>
  upTo?: Maybe<Scalars["BigInt"]>
}

export type Principal = {
  avatarUrl: Scalars["String"]
  /** @deprecated Use User fragment on Viewer instead */
  createdAt?: Maybe<Scalars["ISO8601DateTime"]>
  email: Scalars["String"]
  /** @deprecated Use User fragment on Viewer instead */
  featureFlags?: Maybe<Array<Scalars["String"]>>
  /** @deprecated Use User fragment on Viewer instead */
  hasNodeproxyApps?: Maybe<Scalars["Boolean"]>
  /** @deprecated Use User fragment on Viewer instead */
  id?: Maybe<Scalars["ID"]>
  /** @deprecated Use User fragment on Viewer instead */
  lastRegion?: Maybe<Scalars["String"]>
  name?: Maybe<Scalars["String"]>
  /** @deprecated Use User fragment on Viewer instead */
  organizations?: Maybe<OrganizationConnection>
  /** @deprecated Use User fragment on Viewer instead */
  personalOrganization?: Maybe<Organization>
  trust: OrganizationTrust
  /** @deprecated Use User fragment on Viewer instead */
  twoFactorProtection?: Maybe<Scalars["Boolean"]>
  /** @deprecated Use User fragment on Viewer instead */
  username?: Maybe<Scalars["String"]>
}

export type PrincipalOrganizationsArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type ProcessGroup = {
  __typename?: "ProcessGroup"
  maxPerRegion: Scalars["Int"]
  name: Scalars["String"]
  regions: Array<Scalars["String"]>
  vmSize: VmSize
}

export type Product = {
  __typename?: "Product"
  name: Scalars["String"]
  tiers: Array<PriceTier>
  type: Scalars["String"]
  unitLabel?: Maybe<Scalars["String"]>
}

export type PropertyInput = {
  name: Scalars["String"]
  value?: Maybe<Scalars["String"]>
}

export type Queries = {
  __typename?: "Queries"
  accessTokens: AccessTokenConnection
  addOn?: Maybe<AddOn>
  addOnPlans: AddOnPlanConnection
  addOnProvider: AddOnProvider
  addOns: AddOnConnection
  app?: Maybe<App>
  appNameAvailable: Scalars["Boolean"]
  apps: AppConnection
  canPerformBluegreenDeployment: Scalars["Boolean"]
  certificate?: Maybe<AppCertificate>
  checkJobs: CheckJobConnection
  checkLocations: Array<CheckLocation>
  /** @deprecated use viewer instead */
  currentUser: User
  domain?: Maybe<Domain>
  flapsAuthzCheck: Scalars["Boolean"]
  /** @deprecated deprecated */
  githubIntegration: GithubIntegration
  herokuIntegration: HerokuIntegration
  ipAddress?: Maybe<IpAddress>
  latestImageDetails: ImageVersion
  latestImageTag: Scalars["String"]
  machine: Machine
  machines: MachineConnection
  nearestRegion: Region
  node?: Maybe<Node>
  nodes: Array<Maybe<Node>>
  organization?: Maybe<Organization>
  organizations: OrganizationConnection
  personalOrganization: Organization
  platform: FlyPlatform
  postgresAttachments: PostgresClusterAttachmentConnection
  products: Array<Product>
  userOnlyToken: Scalars["Boolean"]
  validateConfig: AppConfig
  viewer: Principal
  volume?: Maybe<Volume>
}

export type QueriesAccessTokensArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
  type?: Maybe<AccessTokenType>
}

export type QueriesAddOnArgs = {
  id?: Maybe<Scalars["ID"]>
  name?: Maybe<Scalars["String"]>
  provider?: Maybe<Scalars["String"]>
}

export type QueriesAddOnPlansArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
  type?: Maybe<AddOnType>
}

export type QueriesAddOnProviderArgs = {
  name: Scalars["String"]
}

export type QueriesAddOnsArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
  type?: Maybe<AddOnType>
}

export type QueriesAppArgs = {
  name?: Maybe<Scalars["String"]>
  internalId?: Maybe<Scalars["String"]>
}

export type QueriesAppNameAvailableArgs = {
  name: Scalars["String"]
}

export type QueriesAppsArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
  active?: Maybe<Scalars["Boolean"]>
  role?: Maybe<Scalars["String"]>
  platform?: Maybe<Scalars["String"]>
  organizationId?: Maybe<Scalars["ID"]>
}

export type QueriesCanPerformBluegreenDeploymentArgs = {
  name: Scalars["String"]
}

export type QueriesCertificateArgs = {
  id: Scalars["ID"]
}

export type QueriesCheckJobsArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type QueriesDomainArgs = {
  name: Scalars["String"]
}

export type QueriesIpAddressArgs = {
  id: Scalars["ID"]
}

export type QueriesLatestImageDetailsArgs = {
  image: Scalars["String"]
  flyVersion?: Maybe<Scalars["String"]>
}

export type QueriesLatestImageTagArgs = {
  repository: Scalars["String"]
  snapshotId?: Maybe<Scalars["ID"]>
}

export type QueriesMachineArgs = {
  machineId: Scalars["String"]
}

export type QueriesMachinesArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
  appId?: Maybe<Scalars["String"]>
  state?: Maybe<Scalars["String"]>
  version?: Maybe<Scalars["Int"]>
}

export type QueriesNearestRegionArgs = {
  wireguardGateway?: Maybe<Scalars["Boolean"]>
}

export type QueriesNodeArgs = {
  id: Scalars["ID"]
}

export type QueriesNodesArgs = {
  ids: Array<Scalars["ID"]>
}

export type QueriesOrganizationArgs = {
  id?: Maybe<Scalars["ID"]>
  name?: Maybe<Scalars["String"]>
  slug?: Maybe<Scalars["String"]>
}

export type QueriesOrganizationsArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
  withBillingIssuesOnly?: Maybe<Scalars["Boolean"]>
  admin?: Maybe<Scalars["Boolean"]>
  type?: Maybe<OrganizationType>
}

export type QueriesPostgresAttachmentsArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
  appName?: Maybe<Scalars["String"]>
  postgresAppName: Scalars["String"]
}

export type QueriesValidateConfigArgs = {
  definition: Scalars["JSON"]
}

export type QueriesVolumeArgs = {
  id: Scalars["ID"]
}

export type Region = {
  __typename?: "Region"
  code: Scalars["String"]
  gatewayAvailable: Scalars["Boolean"]
  latitude?: Maybe<Scalars["Float"]>
  longitude?: Maybe<Scalars["Float"]>
  name: Scalars["String"]
  processGroup?: Maybe<Scalars["String"]>
  requiresPaidPlan: Scalars["Boolean"]
}

export type RegionPlacement = {
  __typename?: "RegionPlacement"
  count?: Maybe<Scalars["Int"]>
  region: Scalars["String"]
}

export type Release = Node & {
  __typename?: "Release"
  config?: Maybe<AppConfig>
  createdAt: Scalars["ISO8601DateTime"]
  deploymentStrategy: DeploymentStrategy
  description: Scalars["String"]
  evaluationId?: Maybe<Scalars["String"]>
  id: Scalars["ID"]
  image?: Maybe<Image>
  imageRef?: Maybe<Scalars["String"]>
  /** @deprecated use deployment.inProgress */
  inProgress: Scalars["Boolean"]
  metadata?: Maybe<Scalars["JSON"]>
  reason: Scalars["String"]
  revertedTo?: Maybe<Scalars["Int"]>
  stable: Scalars["Boolean"]
  status: Scalars["String"]
  updatedAt: Scalars["ISO8601DateTime"]
  user?: Maybe<User>
  version: Scalars["Int"]
}

export type ReleaseCommand = Node & {
  __typename?: "ReleaseCommand"
  app: App
  command: Scalars["String"]
  evaluationId?: Maybe<Scalars["String"]>
  exitCode?: Maybe<Scalars["Int"]>
  failed: Scalars["Boolean"]
  id: Scalars["ID"]
  inProgress: Scalars["Boolean"]
  instanceId?: Maybe<Scalars["String"]>
  status: Scalars["String"]
  succeeded: Scalars["Boolean"]
}

export type ReleaseConnection = {
  __typename?: "ReleaseConnection"
  edges?: Maybe<Array<Maybe<ReleaseEdge>>>
  nodes?: Maybe<Array<Maybe<Release>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type ReleaseEdge = {
  __typename?: "ReleaseEdge"
  cursor: Scalars["String"]
  node?: Maybe<Release>
}

export type ReleaseEgressIpAddressInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["ID"]
  machineId: Scalars["ID"]
}

export type ReleaseEgressIpAddressPayload = {
  __typename?: "ReleaseEgressIPAddressPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  v4?: Maybe<Scalars["String"]>
  v6?: Maybe<Scalars["String"]>
}

export type ReleaseIpAddressInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId?: Maybe<Scalars["ID"]>
  ipAddressId?: Maybe<Scalars["ID"]>
  ip?: Maybe<Scalars["String"]>
  serviceName?: Maybe<Scalars["String"]>
}

export type ReleaseIpAddressPayload = {
  __typename?: "ReleaseIPAddressPayload"
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
}

export type ReleaseUnprocessed = Node & {
  __typename?: "ReleaseUnprocessed"
  configDefinition?: Maybe<Scalars["JSON"]>
  createdAt: Scalars["ISO8601DateTime"]
  deploymentStrategy: DeploymentStrategy
  description: Scalars["String"]
  evaluationId?: Maybe<Scalars["String"]>
  id: Scalars["ID"]
  image?: Maybe<Image>
  imageRef?: Maybe<Scalars["String"]>
  /** @deprecated use deployment.inProgress */
  inProgress: Scalars["Boolean"]
  reason: Scalars["String"]
  revertedTo?: Maybe<Scalars["Int"]>
  stable: Scalars["Boolean"]
  status: Scalars["String"]
  updatedAt: Scalars["ISO8601DateTime"]
  user?: Maybe<User>
  version: Scalars["Int"]
}

export type ReleaseUnprocessedConnection = {
  __typename?: "ReleaseUnprocessedConnection"
  edges?: Maybe<Array<Maybe<ReleaseUnprocessedEdge>>>
  nodes?: Maybe<Array<Maybe<ReleaseUnprocessed>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type ReleaseUnprocessedEdge = {
  __typename?: "ReleaseUnprocessedEdge"
  cursor: Scalars["String"]
  node?: Maybe<ReleaseUnprocessed>
}

export type RemoteDockerBuilderAppRole = AppRole & {
  __typename?: "RemoteDockerBuilderAppRole"
  name: Scalars["String"]
}

export type RemoveMachineInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId?: Maybe<Scalars["ID"]>
  id: Scalars["String"]
  kill?: Maybe<Scalars["Boolean"]>
}

export type RemoveMachinePayload = {
  __typename?: "RemoveMachinePayload"
  clientMutationId?: Maybe<Scalars["String"]>
  machine: Machine
}

export type RemoveWireGuardPeerInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  organizationId: Scalars["ID"]
  name: Scalars["String"]
  nats?: Maybe<Scalars["Boolean"]>
}

export type RemoveWireGuardPeerPayload = {
  __typename?: "RemoveWireGuardPeerPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  organization: Organization
}

export type ResetAddOnPasswordInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  name: Scalars["String"]
}

export type ResetAddOnPasswordPayload = {
  __typename?: "ResetAddOnPasswordPayload"
  addOn: AddOn
  clientMutationId?: Maybe<Scalars["String"]>
}

export type RestartAllocationInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["ID"]
  allocId: Scalars["ID"]
}

export type RestartAllocationPayload = {
  __typename?: "RestartAllocationPayload"
  allocation: Allocation
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
}

export type RestartAppInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["ID"]
}

export type RestartAppPayload = {
  __typename?: "RestartAppPayload"
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
}

export type RestoreVolumeSnapshotInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  volumeId: Scalars["ID"]
  snapshotId: Scalars["ID"]
}

export type RestoreVolumeSnapshotPayload = {
  __typename?: "RestoreVolumeSnapshotPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  snapshot: VolumeSnapshot
  volume: Volume
}

export type ResumeAppInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["ID"]
}

export type ResumeAppPayload = {
  __typename?: "ResumeAppPayload"
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
}

export type RevokePostgresClusterUserAccessInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appName: Scalars["String"]
  username: Scalars["String"]
  databaseName: Scalars["String"]
}

export type RevokePostgresClusterUserAccessPayload = {
  __typename?: "RevokePostgresClusterUserAccessPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  database: PostgresClusterDatabase
  postgresClusterRole: PostgresClusterAppRole
  user: PostgresClusterUser
}

export enum RuntimeType {
  Firecracker = "FIRECRACKER",
  Nodeproxy = "NODEPROXY"
}

export type SaveDeploymentSourceInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["String"]
  provider: Scalars["String"]
  repositoryId: Scalars["String"]
  ref?: Maybe<Scalars["String"]>
  baseDir?: Maybe<Scalars["String"]>
  skipBuild?: Maybe<Scalars["Boolean"]>
}

export type SaveDeploymentSourcePayload = {
  __typename?: "SaveDeploymentSourcePayload"
  app?: Maybe<App>
  build?: Maybe<Build>
  clientMutationId?: Maybe<Scalars["String"]>
}

export type ScaleAppInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["ID"]
  regions: Array<ScaleRegionInput>
}

export type ScaleAppPayload = {
  __typename?: "ScaleAppPayload"
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
  delta: Array<ScaleRegionChange>
  placement: Array<RegionPlacement>
}

export type ScaleRegionChange = {
  __typename?: "ScaleRegionChange"
  fromCount: Scalars["Int"]
  region: Scalars["String"]
  toCount?: Maybe<Scalars["Int"]>
}

export type ScaleRegionInput = {
  region: Scalars["String"]
  count: Scalars["Int"]
}

export type Secret = Node & {
  __typename?: "Secret"
  createdAt: Scalars["ISO8601DateTime"]
  digest: Scalars["String"]
  id: Scalars["ID"]
  name: Scalars["String"]
  user?: Maybe<User>
}

export type SecretInput = {
  key: Scalars["String"]
  value: Scalars["String"]
}

export type Service = {
  __typename?: "Service"
  checks: Array<Check>
  description: Scalars["String"]
  hardConcurrency: Scalars["Int"]
  internalPort: Scalars["Int"]
  ports: Array<ServicePort>
  protocol: ServiceProtocolType
  softConcurrency: Scalars["Int"]
}

export enum ServiceHandlerType {
  Tls = "TLS",
  PgTls = "PG_TLS",
  Http = "HTTP",
  EdgeHttp = "EDGE_HTTP",
  ProxyProto = "PROXY_PROTO"
}

export type ServiceInput = {
  protocol: ServiceProtocolType
  ports?: Maybe<Array<ServiceInputPort>>
  internalPort: Scalars["Int"]
  checks?: Maybe<Array<CheckInput>>
  softConcurrency?: Maybe<Scalars["Int"]>
  hardConcurrency?: Maybe<Scalars["Int"]>
}

export type ServiceInputPort = {
  port: Scalars["Int"]
  handlers?: Maybe<Array<ServiceHandlerType>>
  tlsOptions?: Maybe<ServicePortTlsOptionsInput>
}

export type ServicePort = {
  __typename?: "ServicePort"
  endPort?: Maybe<Scalars["Int"]>
  handlers: Array<ServiceHandlerType>
  port?: Maybe<Scalars["Int"]>
  startPort?: Maybe<Scalars["Int"]>
}

export type ServicePortTlsOptionsInput = {
  defaultSelfSigned?: Maybe<Scalars["Boolean"]>
}

export enum ServiceProtocolType {
  Tcp = "TCP",
  Udp = "UDP"
}

export type SetAppsv2DefaultOnInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  organizationSlug: Scalars["String"]
  defaultOn: Scalars["Boolean"]
}

export type SetAppsv2DefaultOnPayload = {
  __typename?: "SetAppsv2DefaultOnPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  organization: Organization
}

export type SetPagerdutyHandlerInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  organizationId: Scalars["ID"]
  name: Scalars["String"]
  pagerdutyToken: Scalars["String"]
  pagerdutyStatusMap?: Maybe<Scalars["JSON"]>
}

export type SetPagerdutyHandlerPayload = {
  __typename?: "SetPagerdutyHandlerPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  handler: HealthCheckHandler
}

export type SetPlatformVersionInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["ID"]
  platformVersion: Scalars["String"]
  lockId?: Maybe<Scalars["ID"]>
}

export type SetPlatformVersionPayload = {
  __typename?: "SetPlatformVersionPayload"
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
}

export type SetSecretsInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["ID"]
  secrets: Array<SecretInput>
  replaceAll?: Maybe<Scalars["Boolean"]>
}

export type SetSecretsPayload = {
  __typename?: "SetSecretsPayload"
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
  release?: Maybe<Release>
}

export type SetSlackHandlerInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  organizationId: Scalars["ID"]
  name: Scalars["String"]
  slackWebhookUrl: Scalars["String"]
  slackChannel?: Maybe<Scalars["String"]>
  slackUsername?: Maybe<Scalars["String"]>
  slackIconUrl?: Maybe<Scalars["String"]>
}

export type SetSlackHandlerPayload = {
  __typename?: "SetSlackHandlerPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  handler: HealthCheckHandler
}

export type SetVmCountInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["ID"]
  groupCounts: Array<VmCountInput>
  lockId?: Maybe<Scalars["ID"]>
}

export type SetVmCountPayload = {
  __typename?: "SetVMCountPayload"
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
  release?: Maybe<Release>
  taskGroupCounts: Array<TaskGroupCount>
  warnings: Array<Scalars["String"]>
}

export type SetVmSizeInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["ID"]
  sizeName: Scalars["String"]
  memoryMb?: Maybe<Scalars["Int"]>
  group?: Maybe<Scalars["String"]>
}

export type SetVmSizePayload = {
  __typename?: "SetVMSizePayload"
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
  processGroup?: Maybe<ProcessGroup>
  vmSize?: Maybe<VmSize>
}

export type StartBuildInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["ID"]
}

export type StartBuildPayload = {
  __typename?: "StartBuildPayload"
  build: Build
  clientMutationId?: Maybe<Scalars["String"]>
}

export type StartMachineInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId?: Maybe<Scalars["ID"]>
  id: Scalars["String"]
}

export type StartMachinePayload = {
  __typename?: "StartMachinePayload"
  clientMutationId?: Maybe<Scalars["String"]>
  machine: Machine
}

export type StopAllocationInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["ID"]
  allocId: Scalars["ID"]
}

export type StopAllocationPayload = {
  __typename?: "StopAllocationPayload"
  allocation: Allocation
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
}

export type StopMachineInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId?: Maybe<Scalars["ID"]>
  id: Scalars["String"]
  signal?: Maybe<Scalars["String"]>
  killTimeoutSecs?: Maybe<Scalars["Int"]>
}

export type StopMachinePayload = {
  __typename?: "StopMachinePayload"
  clientMutationId?: Maybe<Scalars["String"]>
  machine: Machine
}

export type TaskGroupCount = {
  __typename?: "TaskGroupCount"
  count: Scalars["Int"]
  name: Scalars["String"]
}

export type TemplateDeployment = Node & {
  __typename?: "TemplateDeployment"
  apps: AppConnection
  id: Scalars["ID"]
  organization: Organization
  status: Scalars["String"]
}

export type TemplateDeploymentAppsArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type ThirdPartyConfiguration = Node & {
  __typename?: "ThirdPartyConfiguration"
  caveats?: Maybe<Scalars["CaveatSet"]>
  createdAt: Scalars["ISO8601DateTime"]
  customLevel: ThirdPartyConfigurationLevel
  flyctlLevel: ThirdPartyConfigurationLevel
  id: Scalars["ID"]
  location: Scalars["String"]
  name: Scalars["String"]
  organization: Organization
  uiexLevel: ThirdPartyConfigurationLevel
  updatedAt: Scalars["ISO8601DateTime"]
}

export type ThirdPartyConfigurationConnection = {
  __typename?: "ThirdPartyConfigurationConnection"
  edges?: Maybe<Array<Maybe<ThirdPartyConfigurationEdge>>>
  nodes?: Maybe<Array<Maybe<ThirdPartyConfiguration>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type ThirdPartyConfigurationEdge = {
  __typename?: "ThirdPartyConfigurationEdge"
  cursor: Scalars["String"]
  node?: Maybe<ThirdPartyConfiguration>
}

export enum ThirdPartyConfigurationLevel {
  Disabled = "DISABLED",
  OptIn = "OPT_IN",
  MemberOptOut = "MEMBER_OPT_OUT",
  AdminOptOut = "ADMIN_OPT_OUT",
  Required = "REQUIRED"
}

export type UnlockAppInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["ID"]
  lockId: Scalars["ID"]
}

export type UnlockAppPayload = {
  __typename?: "UnlockAppPayload"
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
}

export type UnsetSecretsInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["ID"]
  keys: Array<Scalars["String"]>
}

export type UnsetSecretsPayload = {
  __typename?: "UnsetSecretsPayload"
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
  release?: Maybe<Release>
}

export type UpdateAddOnInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  addOnId?: Maybe<Scalars["ID"]>
  name?: Maybe<Scalars["String"]>
  planId?: Maybe<Scalars["ID"]>
  options?: Maybe<Scalars["JSON"]>
  metadata?: Maybe<Scalars["JSON"]>
  readRegions?: Maybe<Array<Scalars["String"]>>
  provider?: Maybe<Scalars["String"]>
}

export type UpdateAddOnPayload = {
  __typename?: "UpdateAddOnPayload"
  addOn: AddOn
  clientMutationId?: Maybe<Scalars["String"]>
}

export type UpdateAutoscaleConfigInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  appId: Scalars["ID"]
  enabled?: Maybe<Scalars["Boolean"]>
  minCount?: Maybe<Scalars["Int"]>
  maxCount?: Maybe<Scalars["Int"]>
  balanceRegions?: Maybe<Scalars["Boolean"]>
  regions?: Maybe<Array<AutoscaleRegionConfigInput>>
  resetRegions?: Maybe<Scalars["Boolean"]>
}

export type UpdateAutoscaleConfigPayload = {
  __typename?: "UpdateAutoscaleConfigPayload"
  app: App
  clientMutationId?: Maybe<Scalars["String"]>
}

export type UpdateDnsPortalInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  dnsPortalId: Scalars["ID"]
  name?: Maybe<Scalars["String"]>
  title?: Maybe<Scalars["String"]>
  returnUrl?: Maybe<Scalars["String"]>
  returnUrlText?: Maybe<Scalars["String"]>
  supportUrl?: Maybe<Scalars["String"]>
  supportUrlText?: Maybe<Scalars["String"]>
  primaryColor?: Maybe<Scalars["String"]>
  accentColor?: Maybe<Scalars["String"]>
}

export type UpdateDnsPortalPayload = {
  __typename?: "UpdateDNSPortalPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  dnsPortal: DnsPortal
}

export type UpdateDnsRecordInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  recordId: Scalars["ID"]
  name?: Maybe<Scalars["String"]>
  ttl?: Maybe<Scalars["Int"]>
  rdata?: Maybe<Scalars["String"]>
}

export type UpdateDnsRecordPayload = {
  __typename?: "UpdateDNSRecordPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  record: DnsRecord
}

export type UpdateDnsRecordsInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  domainId: Scalars["ID"]
  changes: Array<DnsRecordChangeInput>
}

export type UpdateDnsRecordsPayload = {
  __typename?: "UpdateDNSRecordsPayload"
  changes: Array<DnsRecordDiff>
  clientMutationId?: Maybe<Scalars["String"]>
  domain: Domain
  warnings: Array<DnsRecordWarning>
}

export type UpdateOrganizationMembershipInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  organizationId: Scalars["ID"]
  userId: Scalars["ID"]
  role: OrganizationMemberRole
  alertsEnabled?: Maybe<OrganizationAlertsEnabled>
}

export type UpdateOrganizationMembershipPayload = {
  __typename?: "UpdateOrganizationMembershipPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  organization: Organization
  user: User
}

export type UpdateReleaseInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  releaseId: Scalars["ID"]
  status?: Maybe<Scalars["String"]>
  metadata?: Maybe<Scalars["JSON"]>
}

export type UpdateReleasePayload = {
  __typename?: "UpdateReleasePayload"
  clientMutationId?: Maybe<Scalars["String"]>
  release: Release
}

export type UpdateRemoteBuilderInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  organizationId: Scalars["ID"]
  image: Scalars["String"]
}

export type UpdateRemoteBuilderPayload = {
  __typename?: "UpdateRemoteBuilderPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  organization: Organization
}

export type UpdateThirdPartyConfigurationInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  thirdPartyConfigurationId: Scalars["ID"]
  name?: Maybe<Scalars["String"]>
  location?: Maybe<Scalars["String"]>
  caveats?: Maybe<Scalars["CaveatSet"]>
  flyctlLevel?: Maybe<ThirdPartyConfigurationLevel>
  uiexLevel?: Maybe<ThirdPartyConfigurationLevel>
  customLevel?: Maybe<ThirdPartyConfigurationLevel>
}

export type UpdateThirdPartyConfigurationPayload = {
  __typename?: "UpdateThirdPartyConfigurationPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  thirdPartyConfiguration: ThirdPartyConfiguration
}

export type User = Node &
  Principal & {
    __typename?: "User"
    agreedToProviderTos: Scalars["Boolean"]
    avatarUrl: Scalars["String"]
    createdAt: Scalars["ISO8601DateTime"]
    email: Scalars["String"]
    enablePaidHobby: Scalars["Boolean"]
    featureFlags: Array<Scalars["String"]>
    hasNodeproxyApps: Scalars["Boolean"]
    id: Scalars["ID"]
    internalNumericId: Scalars["Int"]
    lastRegion?: Maybe<Scalars["String"]>
    name?: Maybe<Scalars["String"]>
    /** @deprecated Use query.organizations instead */
    organizations: OrganizationConnection
    /** @deprecated Use query.personalOrganization instead */
    personalOrganization: Organization
    trust: OrganizationTrust
    twoFactorProtection: Scalars["Boolean"]
    username?: Maybe<Scalars["String"]>
  }

export type UserAgreedToProviderTosArgs = {
  providerName: Scalars["String"]
}

export type UserOrganizationsArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type UserCoupon = Node & {
  __typename?: "UserCoupon"
  createdAt: Scalars["ISO8601DateTime"]
  id: Scalars["ID"]
  organization: Organization
  updatedAt: Scalars["ISO8601DateTime"]
}

export type Vm = Node & {
  __typename?: "VM"
  attachedVolumes: VolumeConnection
  canary: Scalars["Boolean"]
  checks: Array<CheckState>
  createdAt: Scalars["ISO8601DateTime"]
  criticalCheckCount: Scalars["Int"]
  desiredStatus: Scalars["String"]
  events: Array<AllocationEvent>
  failed: Scalars["Boolean"]
  healthy: Scalars["Boolean"]
  id: Scalars["ID"]
  idShort: Scalars["ID"]
  latestVersion: Scalars["Boolean"]
  passingCheckCount: Scalars["Int"]
  privateIP?: Maybe<Scalars["String"]>
  recentLogs: Array<LogEntry>
  region: Scalars["String"]
  restarts: Scalars["Int"]
  status: Scalars["String"]
  taskName: Scalars["String"]
  totalCheckCount: Scalars["Int"]
  transitioning: Scalars["Boolean"]
  updatedAt: Scalars["ISO8601DateTime"]
  version: Scalars["Int"]
  warningCheckCount: Scalars["Int"]
}

export type VmAttachedVolumesArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type VmChecksArgs = {
  name?: Maybe<Scalars["String"]>
}

export type VmRecentLogsArgs = {
  limit?: Maybe<Scalars["Int"]>
  range?: Maybe<Scalars["Int"]>
}

export type VmConnection = {
  __typename?: "VMConnection"
  activeCount: Scalars["Int"]
  completeCount: Scalars["Int"]
  edges?: Maybe<Array<Maybe<VmEdge>>>
  failedCount: Scalars["Int"]
  inactiveCount: Scalars["Int"]
  lostCount: Scalars["Int"]
  nodes?: Maybe<Array<Maybe<Vm>>>
  pageInfo: PageInfo
  pendingCount: Scalars["Int"]
  runningCount: Scalars["Int"]
  totalCount: Scalars["Int"]
}

export type VmCountInput = {
  group?: Maybe<Scalars["String"]>
  count?: Maybe<Scalars["Int"]>
  maxPerRegion?: Maybe<Scalars["Int"]>
}

export type VmEdge = {
  __typename?: "VMEdge"
  cursor: Scalars["String"]
  node?: Maybe<Vm>
}

export type VmSize = {
  __typename?: "VMSize"
  cpuCores: Scalars["Float"]
  maxMemoryMb: Scalars["Int"]
  memoryGb: Scalars["Float"]
  memoryIncrementsMb: Array<Scalars["Int"]>
  memoryMb: Scalars["Int"]
  name: Scalars["String"]
  priceMonth: Scalars["Float"]
  priceSecond: Scalars["Float"]
}

export type ValidateWireGuardPeersInput = {
  clientMutationId?: Maybe<Scalars["String"]>
  peerIps: Array<Scalars["String"]>
}

export type ValidateWireGuardPeersPayload = {
  __typename?: "ValidateWireGuardPeersPayload"
  clientMutationId?: Maybe<Scalars["String"]>
  invalidPeerIps: Array<Scalars["String"]>
  validPeerIps: Array<Scalars["String"]>
}

export type Volume = Node & {
  __typename?: "Volume"
  app: App
  attachedAllocation?: Maybe<Allocation>
  attachedAllocationId?: Maybe<Scalars["String"]>
  attachedMachine?: Maybe<Machine>
  createdAt: Scalars["ISO8601DateTime"]
  encrypted: Scalars["Boolean"]
  host: Host
  id: Scalars["ID"]
  internalId: Scalars["String"]
  name: Scalars["String"]
  region: Scalars["String"]
  sizeGb: Scalars["Int"]
  snapshotRetentionDays?: Maybe<Scalars["Int"]>
  snapshots: VolumeSnapshotConnection
  state: Scalars["String"]
  status: Scalars["String"]
  usedBytes: Scalars["BigInt"]
}

export type VolumeSnapshotsArgs = {
  after?: Maybe<Scalars["String"]>
  before?: Maybe<Scalars["String"]>
  first?: Maybe<Scalars["Int"]>
  last?: Maybe<Scalars["Int"]>
}

export type VolumeConnection = {
  __typename?: "VolumeConnection"
  edges?: Maybe<Array<Maybe<VolumeEdge>>>
  nodes?: Maybe<Array<Maybe<Volume>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type VolumeEdge = {
  __typename?: "VolumeEdge"
  cursor: Scalars["String"]
  node?: Maybe<Volume>
}

export type VolumeSnapshot = Node & {
  __typename?: "VolumeSnapshot"
  createdAt: Scalars["ISO8601DateTime"]
  digest: Scalars["String"]
  id: Scalars["ID"]
  retentionDays?: Maybe<Scalars["Int"]>
  size: Scalars["BigInt"]
  volume: Volume
}

export type VolumeSnapshotConnection = {
  __typename?: "VolumeSnapshotConnection"
  edges?: Maybe<Array<Maybe<VolumeSnapshotEdge>>>
  nodes?: Maybe<Array<Maybe<VolumeSnapshot>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type VolumeSnapshotEdge = {
  __typename?: "VolumeSnapshotEdge"
  cursor: Scalars["String"]
  node?: Maybe<VolumeSnapshot>
}

export type WireGuardPeer = Node & {
  __typename?: "WireGuardPeer"
  id: Scalars["ID"]
  name: Scalars["String"]
  network?: Maybe<Scalars["String"]>
  peerip: Scalars["String"]
  pubkey: Scalars["String"]
  region: Scalars["String"]
}

export type WireGuardPeerConnection = {
  __typename?: "WireGuardPeerConnection"
  edges?: Maybe<Array<Maybe<WireGuardPeerEdge>>>
  nodes?: Maybe<Array<Maybe<WireGuardPeer>>>
  pageInfo: PageInfo
  totalCount: Scalars["Int"]
}

export type WireGuardPeerEdge = {
  __typename?: "WireGuardPeerEdge"
  cursor: Scalars["String"]
  node?: Maybe<WireGuardPeer>
}

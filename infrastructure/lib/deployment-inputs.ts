export interface DeploymentInputs {
  githubRepo: string;
  githubToken: string;
  githubBranch: string;
  appName: string;
  region: string;
  enableBasicAuth: boolean;
  basicAuthUsername?: string;
  basicAuthPassword?: string;
  overrideCode?: string;
  novaCanvasModel: string;
  novaReelModel: string;
  novaLiteModel: string;
  cardTemplate?: any;
  limits?: any;
  app?: {
    features?: {
      print?: boolean;
    };
  };
}

import * as k8s from "@pulumi/kubernetes";

import { Auth0Config } from "../config/auth0";
import buildCert from "../local-certs";

const appLabels = { app: "logmeup-frontend" };

export type FrontEndDeploymentArgs = {
  image_repo: string
  domain: string
  auth0: Auth0Config
}

const Deployment = function(args: FrontEndDeploymentArgs) {

    const auth0Secrets = new k8s.core.v1.Secret("auth0", {
    stringData: {
      ...args.auth0
    }
  });

  const cert = buildCert(args.domain);

  const certSecrets = new k8s.core.v1.Secret("certs", {
    stringData: {
      "key": cert.privateKey,
      "pem": cert.pem
    }
  });

  return new k8s.apps.v1.Deployment("logemup-frontend", {
    spec: {
      selector: { matchLabels: appLabels },
      replicas: 1,
      template: {
        metadata: { labels: appLabels },
        spec: { 
          containers: [{ 
            name: "logmeup-frontend", 
            image: `${args.image_repo}/logmeup-frontend`,
            env: [
              {
                name: "AUTH0_AUDIENCE",
                valueFrom: {
                  secretKeyRef: {
                    name: auth0Secrets.metadata.name,
                    key: "audience"
                  }
                }
              },
              {
                name: "AUTH0_CALLBACK_URL",
                valueFrom: {
                  secretKeyRef: {
                    name: auth0Secrets.metadata.name,
                    key: "callback_url"
                  }
                }
              },
              {
                name: "AUTH0_CLIENT_ID",
                valueFrom: {
                  secretKeyRef: {
                    name: auth0Secrets.metadata.name,
                    key: "client_id"
                  }
                }
              },
              {
                name: "AUTH0_DOMAIN",
                valueFrom: {
                  secretKeyRef: {
                    name: auth0Secrets.metadata.name,
                    key: "domain"
                  }
                }
              },
              {
                name: "TLS_KEY",
                valueFrom: {
                  secretKeyRef: {
                    name: certSecrets.metadata.name,
                    key: "key"
                  }
                }
              },
              {
                name: "TLS_CERT",
                valueFrom: {
                  secretKeyRef: {
                    name: certSecrets.metadata.name,
                    key: "pem"
                  }
                }
              }
            ]
          }] 
        }
      }
    }
  })
}

export type FrontendServiceArgs = {
  isMinikube: boolean
}

const Service = function(args: FrontendServiceArgs) {
  return new k8s.core.v1.Service("logmeup-frontend", {
    spec: {
      type: args.isMinikube ? "ClusterIP" : "LoadBalancer",
      ports: [{
        name: "http",
        port: 80,
        protocol: "TCP",
        targetPort: 3000
      },
      {
        name: "https",
        port: 443,
        protocol: "TCP",
        targetPort: 3000
      }
      ],
      selector: {
        app: appLabels.app
      }
    }
  });
}

export type FrontendArgs = {
  auth0: Auth0Config,
  domain: string,
  image_repo: string,
  isMinikube: boolean
}

export const Frontend = function({ auth0, domain, image_repo, isMinikube}: FrontendArgs) { 

  const deployment = Deployment({
    auth0,
    domain,
    image_repo,
  }); 

  const service = Service({
    isMinikube 
  }); 

  return { deployment, service }
}

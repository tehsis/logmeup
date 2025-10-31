import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

import cert from "../local-certs";

const config = new pulumi.Config();

const appLabels = { app: "logmeup-frontend" };

const isMinikube = config.requireBoolean("isMinikube");

const auth0Secrets = new k8s.core.v1.Secret("auth0", {
  stringData: {
    "audience": "studio.alidion.logmeup",
    "callback_url": "https://dev.logmeup.local",
    "client_id": "oJseeixzeSlyhhRkNE3GoSxuI2NIpthx",
    "domain": "logmeup.us.auth0.com"
  }
});

const certSecrets = new k8s.core.v1.Secret("certs", {
  stringData: {
    "key": cert.privateKey,
    "pem": cert.pem
  }
});

export const deployment = new k8s.apps.v1.Deployment("logemup-frontend", {
    spec: {
        selector: { matchLabels: appLabels },
        replicas: 1,
        template: {
            metadata: { labels: appLabels },
            spec: { 
              containers: [{ 
                name: "logmeup-frontend", 
                image: "10.108.157.26/logmeup-frontend",
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
});

export const service = new k8s.core.v1.Service("logmeup-frontend", {
    spec: {
        type: isMinikube ? "ClusterIP" : "LoadBalancer",
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
})



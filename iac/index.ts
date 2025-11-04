import * as pulumi from "@pulumi/pulumi";

import { Auth0Config } from "./config/auth0"
import { Frontend } from "./k8s"

const config = new pulumi.Config();

const auth0 = config.requireObject<Auth0Config>("auth0");
const domain = config.require("frontend-domain");
const image_repo = config.require("image-repo");
const isMinikube = config.requireBoolean("isMinikube");

const { deployment, service } = Frontend({
  auth0,
  domain,
  image_repo,
  isMinikube
});

export const ip = isMinikube 
  ? service.spec.clusterIP
  : service.status.loadBalancer.apply(
    (lb) => lb.ingress[0].ip ?? lb.ingress[0].hostname  
  );


export const name = deployment.metadata.name;

import * as pulumi from "@pulumi/pulumi";

import { deployment, service } from "./k8s/frontend"

const config = new pulumi.Config();
const isMinikube = config.requireBoolean("isMinikube");

export const name = deployment.metadata.name;
export const ip = isMinikube 
  ? service.spec.clusterIP
  : service.status.loadBalancer.apply(
    (lb) => lb.ingress[0].ip ?? lb.ingress[0].hostname  
);

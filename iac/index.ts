import * as k8s from "@pulumi/kubernetes";

const appLabels = { app: "logmeup-frontend" };


const deployment = new k8s.apps.v1.Deployment("logemup-frontend", {
    spec: {
        selector: { matchLabels: appLabels },
        replicas: 1,
        template: {
            metadata: { labels: appLabels },
            spec: { containers: [{ name: "logmeup-frontend", image: "localhost:5000/logmeup-frontend" }] }
        }
    }
});

const service = new k8s.core.v1.Service("logmeup-frontend", {
    spec: {
        type: "ClusterIP",
        ports: [{
            port: 80,
            protocol: "TCP",
            targetPort: 3000
        }],
        selector: {
            app: appLabels.app
        }
    }
})

export const name = deployment.metadata.name;
export const ip = service.spec.clusterIP
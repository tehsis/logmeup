import * as tls_self_signed_cert from "@pulumi/tls-self-signed-cert";

const cert = new tls_self_signed_cert.SelfSignedCertificate("dev-cert", {
  dnsName: "dev.logmeup.local",
  validityPeriodHours: 807660,
  localValidityPeriodHours: 127520,
  subject: {
    commonName: "logmeup-dev-cert",
    organization: "logmeup"
  },
});

export default cert;

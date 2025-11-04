import * as tls_self_signed_cert from "@pulumi/tls-self-signed-cert";


function buildCert(domain: string) {
  const cert = new tls_self_signed_cert.SelfSignedCertificate("dev-cert", {
    dnsName: domain,
    validityPeriodHours: 807660,
    localValidityPeriodHours: 127520,
    subject: {
      commonName: "logmeup-dev-cert",
      organization: "logmeup"
    },
  });

  return cert;
}

export default buildCert;

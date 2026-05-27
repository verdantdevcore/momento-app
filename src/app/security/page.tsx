import { LegalLayout, LegalSection, Para, BulletList, NumberedList, Divider, MailLink } from "@/components/landing/LegalLayout";

export const metadata = { title: "Security Policy | Momento App" };

export default function SecurityPage() {
  return (
    <LegalLayout title="Security Policy" lastUpdated="May 26, 2026">

      <Para>
        At Momento App, protecting user memories and personal information is a top priority. We
        implement modern security practices and infrastructure safeguards to help keep your data
        secure.
      </Para>

      <Divider />

      <LegalSection title="Infrastructure Security">
        <Para>Momento App uses secure cloud infrastructure providers including:</Para>
        <BulletList items={[
          "Amazon Web Services",
          "Cloudinary",
        ]} />
        <Para>These providers maintain globally recognized security and compliance standards.</Para>
      </LegalSection>

      <LegalSection title="Data Encryption">
        <Para>All user data is protected using encryption technologies including:</Para>
        <BulletList items={[
          "TLS/SSL encryption for data transmitted over the internet",
          "AES-256 encryption for stored content and backups",
        ]} />
        <Para>This helps protect uploaded photos, videos, and account information.</Para>
      </LegalSection>

      <LegalSection title="Access Controls">
        <Para>
          We use strict authentication and authorization measures, including:
        </Para>
        <BulletList items={[
          "Role-based access permissions",
          "Secure credential handling",
          "Limited internal data access",
          "Administrative access protections",
        ]} />
        <Para>
          Only authorized systems and personnel may access operational data when necessary.
        </Para>
      </LegalSection>

      <LegalSection title="Monitoring and Threat Detection">
        <Para>We actively monitor platform activity to detect:</Para>
        <BulletList items={[
          "Unauthorized access attempts",
          "Malicious activity",
          "Fraudulent usage",
          "Service abuse",
          "Infrastructure vulnerabilities",
        ]} />
        <Para>Security updates and patches are applied regularly.</Para>
      </LegalSection>

      <LegalSection title="Incident Response">
        <Para>If a security incident occurs, we aim to:</Para>
        <NumberedList
          start={1}
          items={[
            "Investigate the issue promptly",
            "Contain and mitigate risks",
            "Notify affected users when legally required",
            "Improve safeguards to prevent recurrence",
          ]}
        />
      </LegalSection>

      <LegalSection title="User Responsibilities">
        <Para>
          Users also play a role in maintaining account security. We recommend:
        </Para>
        <BulletList items={[
          "Using strong passwords",
          "Protecting event invite links",
          "Avoiding unauthorized sharing of private content",
          "Keeping devices updated",
        ]} />
      </LegalSection>

      <LegalSection title="Responsible Disclosure">
        <Para>
          If you discover a security vulnerability, please report it responsibly to:
        </Para>
        <Para>
          <MailLink email="security@sharemomento.app" />
        </Para>
        <Para>
          We appreciate good-faith security research and will investigate all legitimate reports.
        </Para>
      </LegalSection>

    </LegalLayout>
  );
}

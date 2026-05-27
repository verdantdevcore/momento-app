import { LegalLayout, LegalSection, Para, BulletList, Divider, MailLink } from "@/components/landing/LegalLayout";
export const metadata = { title: "Terms of Use | Momento App" };

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Use" lastUpdated="May 26, 2026">

      <Para>
        These Terms of Use (&quot:Terms&quot:) govern your access to and use of Momento App and related
        services.
      </Para>
      <Para>By accessing or using Momento App, you agree to these Terms.</Para>

      <Divider />

      <LegalSection title="1. Eligibility">
        <Para>
          You must be at least 13 years old (or the minimum legal age in your jurisdiction) to use
          Momento App.
        </Para>
        <Para>By using the platform, you confirm that you meet these requirements.</Para>
      </LegalSection>

      <LegalSection title="2. User Accounts">
        <Para>You are responsible for:</Para>
        <BulletList items={[
          "Maintaining account confidentiality",
          "Securing your login credentials",
          "All activity occurring under your account",
        ]} />
        <Para>
          We reserve the right to suspend or terminate accounts that violate these Terms.
        </Para>
      </LegalSection>

      <LegalSection title="3. User Content">
        <Para>Users retain ownership of their uploaded photos, videos, and content.</Para>
        <Para>
          By uploading content to Momento App, you grant us a limited license to:
        </Para>
        <BulletList items={[
          "Store and host your content",
          "Process uploads for platform functionality",
          "Display content within authorized event albums",
          "Enable sharing features requested by users",
        ]} />
        <Para>We do not claim ownership of your content.</Para>
      </LegalSection>

      <LegalSection title="4. Acceptable Use">
        <Para>You agree not to:</Para>
        <BulletList items={[
          "Upload unlawful or infringing content",
          "Violate privacy or intellectual property rights",
          "Distribute malware or malicious code",
          "Attempt unauthorized access to systems or accounts",
          "Abuse, harass, or impersonate others",
          "Use the platform for illegal activities",
        ]} />
        <Para>
          We may remove content or suspend accounts that violate these rules.
        </Para>
      </LegalSection>

      <LegalSection title="5. Event Privacy">
        <Para>
          Hosts are responsible for managing event access and invite distribution.
        </Para>
        <Para>
          Momento App cannot guarantee privacy if users publicly share event links or downloadable
          content.
        </Para>
      </LegalSection>

      <LegalSection title="6. Intellectual Property">
        <Para>
          All branding, software, designs, logos, and platform materials belonging to Momento App
          are protected by intellectual property laws.
        </Para>
        <Para>
          You may not copy, modify, distribute, or reverse engineer any part of the platform without
          written permission.
        </Para>
      </LegalSection>

      <LegalSection title="7. Service Availability">
        <Para>
          We strive to provide reliable service but do not guarantee uninterrupted availability.
        </Para>
        <Para>Features may change, be updated, or discontinued at any time.</Para>
      </LegalSection>

      <LegalSection title="8. Limitation of Liability">
        <Para>
          To the maximum extent permitted by law, Momento App shall not be liable for:
        </Para>
        <BulletList items={[
          "Indirect or consequential damages",
          "Data loss",
          "Service interruptions",
          "Unauthorized access caused by user negligence",
          "Third-party service failures",
        ]} />
        <Para>Use of the platform is at your own risk.</Para>
      </LegalSection>

      <LegalSection title="10. Termination">
        <Para>
          We may suspend or terminate access to Momento App if users violate these Terms or
          engage in harmful activity.
        </Para>
        <Para>Users may stop using the platform at any time.</Para>
      </LegalSection>

      <LegalSection title="11. Governing Law">
        <Para>
          These Terms shall be governed by the laws applicable in your operating jurisdiction unless
          otherwise required by local law.
        </Para>
      </LegalSection>

      <LegalSection title="12. Changes to These Terms">
        <Para>
          We may update these Terms periodically. Continued use of Momento App after updates
          constitutes acceptance of the revised Terms.
        </Para>
      </LegalSection>

      <LegalSection title="13. Contact">
        <Para>For legal or policy questions, contact:</Para>
        <Para>
          <MailLink email="legal@sharemomento.app" />
        </Para>
      </LegalSection>

    </LegalLayout>
  );
}

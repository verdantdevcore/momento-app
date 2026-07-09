import { LegalLayout, LegalSection, SubHeading, Para, BulletList, Divider, MailLink } from "@/components/landing/LegalLayout";

export const metadata = { title: "Privacy Policy | Momento App" };

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="May 26, 2026">

      <Para>
        Welcome to Momento App (&#34;Momento App&#34;, &#34;we&#34;, &#34;our&#34;, or &#34;us&#34;). Your privacy matters to
        us. This Privacy Policy explains how we collect, use, protect, and share information when you
        use our website, web and mobile applications, and services.
      </Para>
      <Para>By using Momento App, you agree to the practices described below.</Para>

      <Divider />

      <LegalSection title="1. Information We Collect">
        <SubHeading>Information You Provide</SubHeading>
        <Para>We may collect information you voluntarily provide, including:</Para>
        <BulletList items={[
          "Name and profile information",
          "Email address",
          "Phone number (if applicable)",
          "Event details and album information",
          "Photos and videos uploaded to events",
          "Messages, comments, or communications within the platform",
          "Payment or billing details (if premium features are offered)",
        ]} />

        <SubHeading>Information Collected Automatically</SubHeading>
        <Para>When you use Momento App, we may automatically collect:</Para>
        <BulletList items={[
          "Device information",
          "Browser type and operating system",
          "IP address",
          "Usage activity and analytics",
          "Cookies and similar technologies",
          "Upload and access timestamps",
        ]} />

        <SubHeading>Information From Third Parties</SubHeading>
        <Para>
          We may receive limited information from third-party providers such as authentication,
          analytics, hosting, or payment services.
        </Para>
      </LegalSection>

      <LegalSection title="2. How We Use Your Information">
        <Para>We use information to:</Para>
        <BulletList items={[
          "Provide and operate the Momento App platform",
          "Create and manage private event albums",
          "Enable photo and video uploads",
          "Improve product performance and user experience",
          "Provide customer support",
          "Send important service updates",
          "Detect fraud, abuse, or security risks",
          "Comply with legal obligations",
        ]} />
        <Para>We do not sell your personal information.</Para>
      </LegalSection>

      <LegalSection title="3. Event Privacy">
        <Para>Momento App is designed for private sharing.</Para>
        <BulletList items={[
          "Event albums are accessible only to invited participants",
          "Hosts control guest access and permissions",
          "Content is not publicly searchable",
          "We do not publish user uploads without permission",
        ]} />
        <Para>Users are responsible for sharing event links responsibly.</Para>
      </LegalSection>

      <LegalSection title="4. Storage and Security">
        <Para>
          Uploaded content is securely stored using trusted cloud infrastructure providers, including
          Cloudinary and Amazon Web Services S3.
        </Para>
        <Para>Security measures include:</Para>
        <BulletList items={[
          "TLS/SSL encryption in transit",
          "AES-256 encryption at rest",
          "Access controls and authentication safeguards",
          "Infrastructure monitoring and security auditing",
          "Secure backup and recovery systems",
        ]} />
        <Para>
          While we implement industry-standard protections, no online service can guarantee
          absolute security.
        </Para>
      </LegalSection>

      <LegalSection title="5. Cookies and Analytics">
        <Para>We may use cookies and analytics tools to:</Para>
        <BulletList items={[
          "Keep users signed in",
          "Improve platform performance",
          "Understand feature usage",
          "Enhance user experience",
          "Measure website traffic and engagement",
        ]} />
        <Para>
          You may disable cookies through your browser settings, though some features may not
          function properly.
        </Para>
      </LegalSection>

      <LegalSection title="6. Data Retention">
        <Para>We retain information only as long as necessary to:</Para>
        <BulletList items={[
          "Provide services",
          "Maintain account functionality",
          "Resolve disputes",
          "Meet legal and operational obligations",
        ]} />
        <Para>
          Users may request deletion of their data subject to applicable laws and technical limitations.
        </Para>
      </LegalSection>

      <LegalSection title="7. Children's Privacy">
        <Para>
          Momento App is not intended for children under 13 years old (or the minimum legal age in
          your jurisdiction). We do not knowingly collect personal information from children without
          appropriate consent.
        </Para>
      </LegalSection>

      <LegalSection title="8. Third-Party Services">
        <Para>
          Momento App may integrate with third-party services for hosting, analytics, authentication,
          communications, and payments. These providers may process information according to their
          own privacy policies.
        </Para>
      </LegalSection>

      <LegalSection title="9. Your Rights">
        <Para>Depending on your jurisdiction, you may have rights to:</Para>
        <BulletList items={[
          "Access your personal data",
          "Correct inaccurate information",
          "Request deletion",
          "Withdraw consent",
          "Export your data",
          "Object to certain processing activities",
        ]} />
        <Para>Requests can be submitted through our support contact.</Para>
      </LegalSection>

      <LegalSection title="10. Changes to This Policy">
        <Para>
          We may update this Privacy Policy periodically. Continued use of Momento App after
          updates constitutes acceptance of the revised policy.
        </Para>
      </LegalSection>

      <LegalSection title="11. Contact Us">
        <Para>For privacy-related questions or requests, please contact:</Para>
        <Para>
          Momento App Support<br />
          <MailLink email="support@sharemomento.app" />
        </Para>
      </LegalSection>

    </LegalLayout>
  );
}

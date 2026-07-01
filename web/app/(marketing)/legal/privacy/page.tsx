export const metadata = {
  title: "Privacy Policy · RaeLearn",
};

export default function PrivacyPage() {
  return (
    <article>
      <h1 className="font-head font-extrabold text-3xl text-[#2A5230] mb-2">Privacy Policy</h1>
      <p className="text-sm text-[#7A9878] mb-10">Effective date: July 1, 2026 · RaeLearn by RAEFORM</p>

      <div className="prose prose-sm max-w-none text-[#4A6650] leading-relaxed space-y-10">

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">1. Who We Are</h2>
          <p>RaeLearn is an online learning platform operated by RAEFORM ("we," "us," or "our"). We take your privacy seriously and are committed to being transparent about how we collect, use, and protect your personal information. This policy applies to all data collected through the Platform and our related communications.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">2. Information We Collect</h2>
          <p>We collect information in the following categories:</p>
          <ul className="list-disc pl-5 mt-3 space-y-2">
            <li><strong>Account information</strong> — your name, email address, and hashed password when you register. If you choose to sign up via a third-party provider, we receive basic profile information from that provider.</li>
            <li><strong>Learning activity</strong> — courses and bundles you enroll in, lessons you complete, quiz attempts and scores, overall progress percentages, and timestamps of activity. This data is used to track your progress and issue completion certificates.</li>
            <li><strong>Payment information</strong> — order totals, purchase dates, and payment processor transaction IDs (such as Xendit or Stripe reference numbers). We do not store your full card number, CVV, or bank details — payment data is processed and held by our third-party payment processor.</li>
            <li><strong>Usage and technical data</strong> — pages visited, links clicked, browser type, device type, operating system, and IP address. This data helps us diagnose issues, prevent fraud, and understand how the Platform is used.</li>
            <li><strong>Support communications</strong> — messages, emails, or other correspondence you send us.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-5 mt-3 space-y-1">
            <li>Create and manage your account and provide access to enrolled courses</li>
            <li>Process payments and deliver purchase confirmations and receipts</li>
            <li>Track your learning progress and issue certificates of completion</li>
            <li>Send transactional communications (enrollment confirmations, password resets, policy updates)</li>
            <li>Respond to your support requests and inquiries</li>
            <li>Detect and prevent fraud, abuse, and unauthorized access</li>
            <li>Analyze aggregate, anonymized usage patterns to improve the Platform</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p className="mt-3">We do not use your personal data to serve targeted advertising, and we do not build behavioral profiles for sale to third parties.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">4. Who We Share Your Data With</h2>
          <p>We do not sell, rent, or trade your personal data. We share data only with the following parties, and only to the extent necessary to operate the Platform:</p>
          <ul className="list-disc pl-5 mt-3 space-y-2">
            <li><strong>Supabase</strong> — provides our database and authentication infrastructure. Your account data and learning records are stored in Supabase-hosted databases.</li>
            <li><strong>Payment processors</strong> — handle payment transactions. They receive your payment information directly and are bound by their own privacy and security standards.</li>
            <li><strong>Vercel</strong> — hosts and delivers the Platform. Server-side request data may pass through Vercel infrastructure.</li>
            <li><strong>Group account administrators</strong> — if you are enrolled in a course through an organization account, your progress data (lessons completed, progress percentage) may be visible to the administrator of that account. Your email address and payment history are not shared with group administrators.</li>
            <li><strong>Legal and regulatory authorities</strong> — when required by applicable law, court order, or to protect the rights, property, or safety of RAEFORM, our users, or others.</li>
          </ul>
          <p className="mt-3">All third-party service providers are required to handle your data in accordance with applicable data protection law and our data processing agreements with them.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">5. Data Security</h2>
          <p>We implement industry-standard security measures to protect your data, including encrypted data transmission (TLS), hashed password storage, and access controls that restrict data to authorized personnel only. However, no method of transmission over the internet is 100% secure. We encourage you to use a strong, unique password for your account and to notify us immediately if you suspect any breach.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">6. Data Retention</h2>
          <p>We retain your account and learning data for as long as your account remains active. If you request deletion of your account, we will remove your personal identifiable data within 30 days, subject to any legal obligations to retain records (such as transaction records for tax and accounting purposes). Anonymized and aggregated data derived from your usage may be retained indefinitely.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">7. Your Rights</h2>
          <p>Depending on your location, you may have rights regarding your personal data, including:</p>
          <ul className="list-disc pl-5 mt-3 space-y-1">
            <li><strong>Access</strong> — request a copy of the personal data we hold about you</li>
            <li><strong>Correction</strong> — request that inaccurate or incomplete data be corrected</li>
            <li><strong>Deletion</strong> — request that your personal data be deleted, subject to legal retention requirements</li>
            <li><strong>Restriction</strong> — request that we restrict processing of your data in certain circumstances</li>
            <li><strong>Objection</strong> — object to processing of your data for legitimate interests</li>
          </ul>
          <p className="mt-3">To exercise any of these rights, email us at <a href="mailto:hello@byraeform.com" className="text-[#2A5230] underline">hello@byraeform.com</a>. We will respond within 30 days. We may need to verify your identity before fulfilling your request.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">8. Cookies and Tracking</h2>
          <p>We use strictly necessary session cookies to maintain your authentication state while you are logged in. These cookies are required for the Platform to function and cannot be disabled while using the Platform. We do not use advertising cookies, third-party tracking pixels, or fingerprinting technologies. If you disable cookies in your browser, you will not be able to log in or access enrolled courses.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">9. Children</h2>
          <p>RaeLearn is not directed to individuals under 18 years of age. We do not knowingly collect personal information from minors. If we learn that we have inadvertently collected information from someone under 18, we will delete it promptly. If you believe a minor has provided us with personal data, please contact us at <a href="mailto:hello@byraeform.com" className="text-[#2A5230] underline">hello@byraeform.com</a>.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">10. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. When we make material changes, we will post the updated policy on this page with a new effective date and notify registered users by email. Your continued use of the Platform after any changes constitutes your acceptance of the revised policy.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">11. Contact</h2>
          <p>For privacy questions, data requests, or concerns, contact us at <a href="mailto:hello@byraeform.com" className="text-[#2A5230] underline">hello@byraeform.com</a>. We will do our best to resolve any concern you raise.</p>
        </section>

      </div>
    </article>
  );
}

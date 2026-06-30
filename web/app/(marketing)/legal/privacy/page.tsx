export default function PrivacyPage() {
  return (
    <main className="max-w-[760px] mx-auto px-7 py-16">
      <h1 className="font-head font-extrabold text-3xl text-[#2A5230] mb-2">Privacy Policy</h1>
      <p className="text-sm text-[#7A9878] mb-10">Effective date: June 2026 · RaeLearn by RAEFORM</p>

      <div className="prose prose-sm max-w-none text-[#4A6650] leading-relaxed space-y-8">

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">1. What We Collect</h2>
          <p>When you use RaeLearn we collect:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Account information</strong> — name, email address, password (hashed), learner type, and interests you provide at signup.</li>
            <li><strong>Learning activity</strong> — courses enrolled, lessons completed, quiz attempts, progress percentages, and time spent.</li>
            <li><strong>Payment information</strong> — order totals and Stripe transaction IDs. We do not store full card numbers — Stripe handles payment processing.</li>
            <li><strong>Usage data</strong> — pages visited, browser type, device type, and IP address for security and analytics.</li>
            <li><strong>Communications</strong> — messages you send us via support tickets or email.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">2. How We Use Your Data</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide and personalize your learning experience</li>
            <li>Process enrollment and payment</li>
            <li>Send course-related emails and receipts</li>
            <li>Issue certificates upon completion</li>
            <li>Respond to support requests</li>
            <li>Improve the Platform through aggregate analytics</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">3. Who We Share Data With</h2>
          <p>We do not sell your personal data. We share data only with:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Supabase</strong> — database and authentication infrastructure</li>
            <li><strong>Stripe</strong> — payment processing</li>
            <li><strong>Vercel</strong> — hosting and delivery</li>
            <li><strong>Group account administrators</strong> — if you are enrolled through an organization, your progress (not personal data beyond your name) may be visible to your group admin</li>
            <li><strong>Legal authorities</strong> — when required by law</li>
          </ul>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">4. Data Retention</h2>
          <p>We retain your account data for as long as your account is active. If you delete your account, we will remove your personal data within 30 days, except where retention is required by law or for fraud prevention.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">5. Your Rights</h2>
          <p>You may request to access, correct, or delete your personal data at any time by emailing <a href="mailto:hello@byraeform.com" className="text-[#2A5230] underline">hello@byraeform.com</a>. We will respond within 30 days.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">6. Cookies</h2>
          <p>We use session cookies required for authentication. We do not use third-party advertising cookies.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">7. Children</h2>
          <p>RaeLearn is not directed to anyone under 18. We do not knowingly collect data from minors.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">8. Changes to This Policy</h2>
          <p>We may update this policy and will notify registered users by email of material changes.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">9. Contact</h2>
          <p>Privacy questions: <a href="mailto:hello@byraeform.com" className="text-[#2A5230] underline">hello@byraeform.com</a></p>
        </section>

      </div>
    </main>
  );
}

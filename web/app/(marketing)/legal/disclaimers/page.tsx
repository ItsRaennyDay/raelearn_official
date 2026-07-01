export const metadata = {
  title: "Education Disclaimer",
  description: "RaeLearn Education Disclaimer — course content is for educational purposes only, not legal, financial, or professional advice.",
};

export default function DisclaimersPage() {
  return (
    <article>
      <h1 className="font-head font-extrabold text-3xl text-[#2A5230] mb-2">Education Disclaimer</h1>
      <p className="text-sm text-[#7A9878] mb-10">Effective date: July 1, 2026 · RaeLearn by RAEFORM</p>

      <div className="bg-[#FFF8EC] border border-[#E8D5A0] rounded-xl p-5 mb-10">
        <p className="text-sm font-semibold text-[#7A5A00]">
          RaeLearn provides educational content only. Nothing on this platform constitutes legal, tax, financial, or professional licensing advice. Always consult a qualified professional for advice specific to your situation.
        </p>
      </div>

      <div className="prose prose-sm max-w-none text-[#4A6650] leading-relaxed space-y-10">

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">Educational Purpose Only</h2>
          <p>All courses, lessons, templates, downloadable resources, and materials available on RaeLearn are created for general educational and informational purposes only. Our content is designed to help learners build knowledge and practical skills related to operations, administration, nonprofit management, business systems, virtual assistant work, and adjacent topics. Content is not intended as a substitute for professional advice, formal training, or regulatory guidance specific to your situation.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">Not Legal or Tax Advice</h2>
          <p>Any content that references nonprofit formation, IRS compliance, Form 990, 501(c)(3) status, board governance, employment law, contracts, licensing, regulatory requirements, or any legal or tax matter is provided for general educational awareness only. It does not constitute legal advice, tax advice, or accounting advice, and does not create any attorney-client or advisor-client relationship between you and RAEFORM.</p>
          <p className="mt-3">Laws and regulations differ by jurisdiction and change over time. Always consult a licensed attorney, certified public accountant, or qualified tax professional for advice that is specific to your situation and jurisdiction before making legal or financial decisions.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">No Financial Advice</h2>
          <p>Course content that touches on business finances, pricing, revenue models, budgeting, or financial planning is illustrative and educational in nature. It does not constitute financial advice or investment advice. RAEFORM is not a registered financial advisor. Any financial decisions you make based on information learned through our Platform are your sole responsibility.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">No Employment or Income Guarantee</h2>
          <p>Completing a course or earning a certificate on RaeLearn does not guarantee employment, client acquisition, freelance income, or any specific professional or financial outcome. Results vary based on individual effort, skill level, market conditions, geographic location, and many other factors outside our control. Any references to income potential or career outcomes in our marketing or course descriptions are illustrative examples and are not guarantees or promises of results.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">Certificates of Completion</h2>
          <p>Certificates issued by RaeLearn and RAEFORM recognize that a learner has met the course completion requirements on our Platform. They are not issued by, affiliated with, endorsed by, or recognized by any government agency, professional licensing board, accreditation body, employer, or institution. Certificates do not confer professional licenses, degrees, or regulated qualifications of any kind. Their recognition by any employer or client is entirely at the discretion of that party.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">Content Accuracy and Currency</h2>
          <p>We make reasonable efforts to ensure that course content is accurate, current, and well-sourced at the time of publication. However, information can become outdated as laws, tools, platforms, and professional best practices evolve. RAEFORM does not warrant that any particular piece of content remains current or accurate after its original publication date. Always verify important information — especially legal, regulatory, or technical details — with current official sources before acting on it.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">Third-Party Tools and Resources</h2>
          <p>Courses may reference or recommend third-party software tools, platforms, templates, or external resources. RAEFORM is not affiliated with, endorsed by, or responsible for any third-party product or service mentioned in our content. Any use of third-party tools is subject to their own terms of service and privacy policies. We make no representations about the suitability, availability, or continued operation of third-party resources referenced in our courses.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">Limitation of Liability</h2>
          <p>To the fullest extent permitted by applicable law, RAEFORM, its officers, employees, agents, and content contributors shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from your reliance on any information, content, tool recommendation, or template provided through the Platform. You assume full responsibility for how you apply what you learn.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">Questions</h2>
          <p>If you have questions about the scope or intent of any course content, or if you believe any content contains a significant factual error, contact us at <a href="mailto:hello@byraeform.com" className="text-[#2A5230] underline">hello@byraeform.com</a>. We take accuracy seriously and will review concerns promptly.</p>
        </section>

      </div>
    </article>
  );
}

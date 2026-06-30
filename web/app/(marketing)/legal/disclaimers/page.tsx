export default function DisclaimersPage() {
  return (
    <main className="max-w-[760px] mx-auto px-7 py-16">
      <h1 className="font-head font-extrabold text-3xl text-[#2A5230] mb-2">Education Disclaimer</h1>
      <p className="text-sm text-[#7A9878] mb-10">Effective date: June 2026 · RaeLearn by RAEFORM</p>

      <div className="bg-[#FFF8EC] border border-[#E8D5A0] rounded-xl p-5 mb-10">
        <p className="text-sm font-semibold text-[#7A5A00]">
          RaeLearn provides educational content only. Nothing on this platform constitutes legal, tax, financial, or professional licensing advice.
        </p>
      </div>

      <div className="prose prose-sm max-w-none text-[#4A6650] leading-relaxed space-y-8">

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">Educational Purpose Only</h2>
          <p>All courses, lessons, templates, resources, and materials on RaeLearn are created for general educational and informational purposes. They are designed to help learners understand concepts related to operations, administration, nonprofit management, business systems, and virtual assistant work.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">Not Legal or Tax Advice</h2>
          <p>Content that references nonprofit formation, IRS compliance, Form 990, 501(c)(3) status, board governance, or any legal or regulatory topic is provided for general awareness only. It does not constitute legal advice and does not create an attorney-client relationship. Laws and regulations vary by state and change over time. Always consult a licensed attorney or tax professional for advice specific to your situation.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">No Employment Guarantee</h2>
          <p>Completion of any course or earning a certificate on RaeLearn does not guarantee employment, client acquisition, income, or professional licensing. Individual outcomes depend on many factors outside of our control, including your skills, effort, market conditions, and local requirements.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">Certificates</h2>
          <p>RaeLearn certificates are issued by RAEFORM to recognize course completion. They are not issued by, affiliated with, or recognized by any government agency, accreditation body, or professional licensing board.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">Content Accuracy</h2>
          <p>We make reasonable efforts to keep course content accurate and up to date. However, information may become outdated as laws, regulations, tools, and best practices change. Always verify important information with current official sources before acting on it.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">Questions</h2>
          <p>If you have questions about the scope or intent of any course content, contact us at <a href="mailto:hello@byraeform.com" className="text-[#2A5230] underline">hello@byraeform.com</a>.</p>
        </section>

      </div>
    </main>
  );
}

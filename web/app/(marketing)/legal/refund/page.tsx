export const metadata = {
  title: "Refund Policy",
  description: "RaeLearn Refund Policy — all sales are final. Courses are sold as-is with no refunds.",
};

export default function RefundPage() {
  return (
    <article>
      <h1 className="font-head font-extrabold text-3xl text-[#2A5230] mb-2">Refund Policy</h1>
      <p className="text-sm text-[#7A9878] mb-10">Effective date: July 1, 2026 · RaeLearn by RAEFORM</p>

      <div className="bg-[#FFF8EC] border border-[#E8D5A0] rounded-xl p-5 mb-10">
        <p className="text-sm font-semibold text-[#7A5A00]">
          All sales on RaeLearn are final. We do not offer refunds, credits, or exchanges under any circumstances. Please review course details carefully before purchasing.
        </p>
      </div>

      <div className="prose prose-sm max-w-none text-[#4A6650] leading-relaxed space-y-10">

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">No Refunds</h2>
          <p>RAEFORM operates a strict no-refund policy. Once a purchase is completed and payment is processed, the transaction is final and non-reversible. This applies to:</p>
          <ul className="list-disc pl-5 mt-3 space-y-1">
            <li>Individual course purchases</li>
            <li>Bundle purchases</li>
            <li>Group or organization account seat purchases</li>
            <li>Any promotional or discounted purchases</li>
          </ul>
          <p className="mt-3">We do not issue refunds regardless of whether you have accessed the course, partially completed it, fully completed it, or not yet started it. Purchasing a course constitutes your agreement to this no-refund policy.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">Courses Sold As-Is</h2>
          <p>All courses on RaeLearn are sold "as is." We make reasonable efforts to ensure course content is accurate, current, and valuable, but we make no guarantee of any specific outcome, result, or level of satisfaction. Disagreement with course content, teaching style, or personal expectations does not constitute grounds for a refund.</p>
          <p className="mt-3">We encourage all prospective learners to review the course description, outline, and any free preview lessons available before purchasing. If you have questions about whether a course is right for you, contact us at <a href="mailto:hello@byraeform.com" className="text-[#2A5230] underline">hello@byraeform.com</a> before completing your purchase.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">No Chargebacks</h2>
          <p>Initiating a chargeback or payment dispute through your bank or payment provider for a valid purchase is a violation of these terms. If you initiate a chargeback without first contacting us to resolve the matter, we reserve the right to permanently suspend your account and pursue recovery of any chargeback-related fees and costs. We will provide evidence of purchase and these terms to the relevant payment processor to contest any unauthorized chargeback.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">Free Courses</h2>
          <p>Free courses have no purchase associated with them and are not subject to any refund consideration. Access to free courses may be modified or removed at our discretion.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">Technical or Billing Errors</h2>
          <p>If you believe you were charged in error — such as a duplicate charge or a charge for a course you did not purchase — contact us within 14 days of the transaction at <a href="mailto:hello@byraeform.com" className="text-[#2A5230] underline">hello@byraeform.com</a> with your order details. We will investigate and, if a genuine billing error is confirmed, we will resolve it appropriately. This exception applies only to verifiable system errors, not to change-of-mind or dissatisfaction with course content.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">Platform Discontinuation</h2>
          <p>In the unlikely event that RaeLearn is permanently shut down, we will provide users with reasonable advance notice. Any consideration for users with active course access at the time of discontinuation will be at the sole discretion of RAEFORM and does not constitute a guarantee of refund or credit.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">Contact</h2>
          <p>For billing error inquiries only, contact us at <a href="mailto:hello@byraeform.com" className="text-[#2A5230] underline">hello@byraeform.com</a>. Please include your account email and transaction reference in your message.</p>
        </section>

      </div>
    </article>
  );
}

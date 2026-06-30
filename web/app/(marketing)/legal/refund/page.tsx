export default function RefundPage() {
  return (
    <main className="max-w-[760px] mx-auto px-7 py-16">
      <h1 className="font-head font-extrabold text-3xl text-[#2A5230] mb-2">Refund Policy</h1>
      <p className="text-sm text-[#7A9878] mb-10">Effective date: June 2026 · RaeLearn by RAEFORM</p>

      <div className="prose prose-sm max-w-none text-[#4A6650] leading-relaxed space-y-8">

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">7-Day Refund Window</h2>
          <p>If you are not satisfied with a paid course, you may request a full refund within <strong>7 days of purchase</strong>, provided you have completed fewer than 30% of the course lessons.</p>
          <p className="mt-2">To request a refund, email <a href="mailto:hello@byraeform.com" className="text-[#2A5230] underline">hello@byraeform.com</a> with your order details. We process approved refunds within 5–10 business days to your original payment method.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">Exceptions</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Refunds are not available after 7 days of purchase.</li>
            <li>Refunds are not available if more than 30% of course content has been accessed.</li>
            <li>Certificates already issued are non-refundable.</li>
            <li>Bundle purchases are refundable only if no course in the bundle has been more than 30% completed.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">Group Accounts</h2>
          <p>Group account seat purchases are non-refundable once learners have been invited or enrolled. Contact us before purchasing if you have questions about seat sizing.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">Free Courses</h2>
          <p>Free courses have no purchase associated with them — no refund applies.</p>
        </section>

        <section>
          <h2 className="font-head font-bold text-lg text-[#2A5230] mb-3">Contact</h2>
          <p>Refund requests and questions: <a href="mailto:hello@byraeform.com" className="text-[#2A5230] underline">hello@byraeform.com</a></p>
        </section>

      </div>
    </main>
  );
}

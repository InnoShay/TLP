import { AnimatedSection } from '../ui/AnimatedSection'
import { SectionLabel } from '../ui/SectionLabel'
import { CodeBlock } from '../ui/CodeBlock'

export default function ApiSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[44fr_56fr] gap-12 lg:gap-16 items-start">
      <div className="self-start max-w-[480px]">
        <AnimatedSection delay={0}>
          <SectionLabel>API INTEGRATION</SectionLabel>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <h2 className="font-serif text-[48px] leading-[1.1] tracking-[-0.01em] text-ink mt-4 mb-6">
            Built for Developers
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <p className="font-mono font-light text-[15px] leading-[1.7] text-inkwarm mb-8 max-w-[480px]">
            Integrate the Trust Layer Protocol directly into your own applications, CMS platforms, and data pipelines using our REST API.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <ul className="flex flex-col gap-4 font-mono font-light text-[13px] text-inkwarm mb-10">
            <li className="flex gap-3">
              <span className="text-ink">→</span> Single endpoint verification (/v1/verify)
            </li>
            <li className="flex gap-3">
              <span className="text-ink">→</span> Full source attribution and stance data returned
            </li>
            <li className="flex gap-3">
              <span className="text-ink">→</span> Webhooks for asynchronous batch processing
            </li>
          </ul>
        </AnimatedSection>

        <AnimatedSection delay={0.4}>
          <a 
            href="/docs" 
            className="inline-block bg-transparent hover:bg-ink hover:text-paper text-ink border border-ink font-mono font-medium text-[13px] tracking-[0.08em] px-7 py-3.5 transition-all duration-200 rounded-none cursor-pointer"
          >
            Read Full API Docs →
          </a>
        </AnimatedSection>
      </div>

      <AnimatedSection delay={0.5} className="w-full">
        <CodeBlock>
          <div className="flex justify-between items-center mb-3">
            <span className="text-inkfaint uppercase tracking-[0.12em] text-[11px]">REQUEST</span>
            <span className="text-[#5A5650] text-[11px]">bash</span>
          </div>
          <div className="border-t border-monoborder mb-4" />
          <div className="mb-6">
            <span className="text-[#C1121F]">POST</span> <span className="text-[#EEE8D5]">/v1/verify</span> <span className="text-[#5A5650]">HTTP/1.1</span><br/>
            <span className="text-[#7A9EC7]">Host</span><span className="text-[#5A5650]">:</span> <span className="text-[#A8C07A]">api.credify.dev</span><br/>
            <span className="text-[#7A9EC7]">Authorization</span><span className="text-[#5A5650]">:</span> <span className="text-[#A8C07A]">Bearer sk_live_...</span><br/>
            <span className="text-[#7A9EC7]">Content-Type</span><span className="text-[#5A5650]">:</span> <span className="text-[#A8C07A]">application/json</span><br/>
            <br/>
            <span className="text-[#5A5650]">{'{'}</span><br/>
            {'  '}<span className="text-[#7A9EC7]">"text"</span><span className="text-[#5A5650]">:</span> <span className="text-[#A8C07A]">"NASA confirmed the discovery of liquid water..."</span><br/>
            <span className="text-[#5A5650]">{'}'}</span>
          </div>

          <div className="flex justify-between items-center mb-3">
            <span className="text-inkfaint uppercase tracking-[0.12em] text-[11px]">RESPONSE</span>
            <span className="text-verified font-medium text-[11px]">200 OK</span>
          </div>
          <div className="border-t border-monoborder mb-4" />
          <div>
            <span className="text-[#5A5650]">{'{'}</span><br/>
            {'  '}<span className="text-[#7A9EC7]">"truth_score"</span><span className="text-[#5A5650]">:</span> <span className="text-[#C1121F]">0.91</span><span className="text-[#5A5650]">,</span><br/>
            {'  '}<span className="text-[#7A9EC7]">"classification"</span><span className="text-[#5A5650]">:</span> <span className="text-[#A8C07A]">"VERIFIED"</span><span className="text-[#5A5650]">,</span><br/>
            {'  '}<span className="text-[#7A9EC7]">"reasoning"</span><span className="text-[#5A5650]">:</span> <span className="text-[#A8C07A]">"Multiple space agencies..."</span><span className="text-[#5A5650]">,</span><br/>
            {'  '}<span className="text-[#7A9EC7]">"claims"</span><span className="text-[#5A5650]">: [</span><br/>
            {'    '}<span className="text-[#5A5650]">{'{'}</span><br/>
            {'      '}<span className="text-[#7A9EC7]">"subject"</span><span className="text-[#5A5650]">:</span> <span className="text-[#A8C07A]">"NASA"</span><span className="text-[#5A5650]">,</span><br/>
            {'      '}<span className="text-[#7A9EC7]">"predicate"</span><span className="text-[#5A5650]">:</span> <span className="text-[#A8C07A]">"confirmed discovery"</span><br/>
            {'    '}<span className="text-[#5A5650]">{'}'}</span><br/>
            {'  '}<span className="text-[#5A5650]">]</span><br/>
            <span className="text-[#5A5650]">{'}'}</span>
          </div>
        </CodeBlock>
      </AnimatedSection>
    </div>
  )
}

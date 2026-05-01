'use client'

import Nav from '@/components/nav/Nav'
import Footer from '@/components/footer/Footer'
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  })
}

const endpoints = [
  {
    method: 'POST',
    path: '/v1/verify',
    title: 'Verify Claim',
    desc: 'Submit a natural language text to be verified. The protocol extracts factual claims, cross-references them against authoritative sources, and returns a Truth Score with full source attribution.',
    params: [
      { name: 'text', type: 'string', required: true, desc: 'The text containing claims to verify' },
      { name: 'strict_mode', type: 'boolean', required: false, desc: 'Enable strict verification with higher source thresholds' },
      { name: 'webhook_url', type: 'string', required: false, desc: 'URL to receive async results for batch processing' },
    ]
  },
  {
    method: 'GET',
    path: '/v1/claim/:id',
    title: 'Get Claim Details',
    desc: 'Retrieve the full verification result for a previously submitted claim, including all extracted sub-claims, sources, stance analysis, and cryptographic signatures.',
    params: [
      { name: 'id', type: 'string', required: true, desc: 'The claim ID returned from /v1/verify' },
    ]
  },
  {
    method: 'GET',
    path: '/v1/history',
    title: 'Verification History',
    desc: 'List all verification requests associated with your API key, paginated and filterable by date range, classification, or score threshold.',
    params: [
      { name: 'page', type: 'number', required: false, desc: 'Page number (default: 1)' },
      { name: 'limit', type: 'number', required: false, desc: 'Items per page (default: 25, max: 100)' },
      { name: 'classification', type: 'string', required: false, desc: 'Filter by VERIFIED, FALSE, or UNCERTAIN' },
    ]
  },
  {
    method: 'POST',
    path: '/v1/batch',
    title: 'Batch Verification',
    desc: 'Submit multiple texts for verification in a single request. Results are delivered asynchronously via webhooks or polling.',
    params: [
      { name: 'items', type: 'array', required: true, desc: 'Array of { text, id } objects to verify' },
      { name: 'webhook_url', type: 'string', required: true, desc: 'URL to receive batch results' },
    ]
  },
]

const responseFields = [
  { field: 'truth_score', type: 'number', desc: 'Confidence score from 0.00 to 1.00' },
  { field: 'classification', type: 'string', desc: 'VERIFIED (≥0.75), UNCERTAIN (0.40–0.74), or FALSE (<0.40)' },
  { field: 'claims', type: 'array', desc: 'Extracted sub-claims with individual scores and sources' },
  { field: 'sources', type: 'array', desc: 'Authoritative sources used with stance (SUPPORTS/CONTRADICTS)' },
  { field: 'reasoning', type: 'string', desc: 'Human-readable explanation of the verification decision' },
  { field: 'signature', type: 'string', desc: 'Cryptographic signature for audit trail verification' },
  { field: 'timestamp', type: 'string', desc: 'ISO 8601 timestamp of when verification was completed' },
]

const errorCodes = [
  { code: '400', title: 'Bad Request', desc: 'Missing or malformed request body' },
  { code: '401', title: 'Unauthorized', desc: 'Invalid or missing API key' },
  { code: '429', title: 'Rate Limited', desc: 'Too many requests — retry after the specified delay' },
  { code: '500', title: 'Server Error', desc: 'Internal error — contact support if persistent' },
]

export default function DocsPage() {
  return (
    <>
      <Nav />
      <main className="w-full flex flex-col items-center overflow-x-hidden bg-paper">

        {/* ── Hero ── */}
        <section className="w-full flex justify-center" style={{ paddingTop: '160px', paddingBottom: '100px' }}>
          <div className="w-full" style={{ maxWidth: '1200px', paddingLeft: '48px', paddingRight: '48px' }}>
            <motion.p
              variants={fadeUp} custom={0} initial="hidden" animate="show"
              className="font-mono text-[11px] text-inkfaint uppercase tracking-[0.14em] mb-6"
            >
              DEVELOPER API · v1.0
            </motion.p>
            <motion.h1
              variants={fadeUp} custom={1} initial="hidden" animate="show"
              className="font-serif text-[48px] lg:text-[64px] leading-[1.05] tracking-[-0.02em] text-ink mb-6"
            >
              API Documentation
            </motion.h1>
            <motion.p
              variants={fadeUp} custom={2} initial="hidden" animate="show"
              className="font-mono font-light text-[15px] leading-[1.7] text-inkwarm max-w-[560px] mb-10"
            >
              Integrate the Trust Layer Protocol into any application with a single REST API call. Secure, deterministic, cryptographically signed — built for production at scale.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} initial="hidden" animate="show" className="flex flex-wrap gap-4">
              <a
                href="/platform/index.html"
                className="bg-red hover:bg-redhover text-paper font-mono font-medium text-[13px] tracking-[0.08em] px-8 py-4 transition-all duration-200 cursor-pointer"
              >
                Get API Key →
              </a>
              <a
                href="https://github.com/InnoShay"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-transparent hover:bg-ink hover:text-paper text-ink border border-ink font-mono font-medium text-[13px] tracking-[0.08em] px-8 py-4 transition-all duration-200 cursor-pointer"
              >
                View on GitHub →
              </a>
            </motion.div>
          </div>
        </section>

        {/* ── Authentication ── */}
        <section className="w-full flex justify-center border-t border-ink/[.13]" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
          <div className="w-full" style={{ maxWidth: '1200px', paddingLeft: '48px', paddingRight: '48px' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <div>
                <motion.p
                  variants={fadeUp} custom={0} initial="hidden" whileInView="show" viewport={{ once: true }}
                  className="font-mono text-[11px] text-inkfaint uppercase tracking-[0.14em] mb-4"
                >
                  AUTHENTICATION
                </motion.p>
                <motion.h2
                  variants={fadeUp} custom={1} initial="hidden" whileInView="show" viewport={{ once: true }}
                  className="font-serif text-[40px] leading-[1.1] tracking-[-0.01em] text-ink mb-6"
                >
                  API Keys
                </motion.h2>
                <motion.p
                  variants={fadeUp} custom={2} initial="hidden" whileInView="show" viewport={{ once: true }}
                  className="font-mono font-light text-[14px] text-inkwarm leading-[1.7] mb-8"
                >
                  All API requests require a valid API key passed in the <code className="bg-ink/[.06] px-1.5 py-0.5 text-ink text-[13px]">Authorization</code> header as a Bearer token. Generate and manage keys from Credify Studio.
                </motion.p>
                <motion.div
                  variants={fadeUp} custom={3} initial="hidden" whileInView="show" viewport={{ once: true }}
                  className="flex flex-col gap-4"
                >
                  <div className="border-b border-ink/[.08] pb-4">
                    <p className="font-mono text-[12px] text-inkfaint uppercase tracking-[0.1em] mb-2">BASE URL</p>
                    <code className="font-mono text-[14px] text-ink bg-ink/[.06] px-3 py-1.5 inline-block">https://api.credify.dev</code>
                  </div>
                  <div className="border-b border-ink/[.08] pb-4">
                    <p className="font-mono text-[12px] text-inkfaint uppercase tracking-[0.1em] mb-2">RATE LIMITS</p>
                    <p className="font-mono text-[14px] text-inkwarm">100 requests/minute (Free) · 1,000 requests/minute (Pro)</p>
                  </div>
                  <div className="pb-4">
                    <p className="font-mono text-[12px] text-inkfaint uppercase tracking-[0.1em] mb-2">CONTENT TYPE</p>
                    <code className="font-mono text-[14px] text-ink bg-ink/[.06] px-3 py-1.5 inline-block">application/json</code>
                  </div>
                </motion.div>
              </div>

              {/* Code example */}
              <motion.div
                variants={fadeUp} custom={4} initial="hidden" whileInView="show" viewport={{ once: true }}
              >
                <div className="rounded-xl overflow-hidden border border-[#2A2A28]" style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                  <div className="h-10 bg-[#2D2D2D] flex items-center px-4 gap-2 border-b border-[#1A1A1A]">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                    <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                    <span className="ml-4 font-mono text-[11px] text-[#5A5650]">authentication</span>
                  </div>
                  <div className="bg-[#080808] p-5 font-mono text-[13px] leading-[1.7] overflow-x-auto">
                    <span className="text-[#5A5650]"># Header format</span><br/>
                    <span className="text-[#7A9EC7]">Authorization</span><span className="text-[#5A5650]">:</span> <span className="text-[#A8C07A]">Bearer crd_live_xxxxxxxxxxxx</span><br/>
                    <br/>
                    <span className="text-[#5A5650]"># Example with curl</span><br/>
                    <span className="text-[#C1121F]">curl</span> <span className="text-[#A8C07A]">-X POST</span> <span className="text-[#EEE8D5]">https://api.credify.dev/v1/verify</span> <span className="text-[#5A5650]">\</span><br/>
                    {'  '}<span className="text-[#7A9EC7]">-H</span> <span className="text-[#A8C07A]">{'"Authorization: Bearer crd_live_xxxx"'}</span> <span className="text-[#5A5650]">\</span><br/>
                    {'  '}<span className="text-[#7A9EC7]">-H</span> <span className="text-[#A8C07A]">{'"Content-Type: application/json"'}</span> <span className="text-[#5A5650]">\</span><br/>
                    {'  '}<span className="text-[#7A9EC7]">-d</span> <span className="text-[#A8C07A]">{"'{\"text\": \"Earth orbits the Sun\"}'"}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Endpoints ── */}
        <section className="w-full flex justify-center border-t border-ink/[.13]" style={{ paddingTop: '120px', paddingBottom: '120px' }}>
          <div className="w-full" style={{ maxWidth: '1200px', paddingLeft: '48px', paddingRight: '48px' }}>
            <motion.p
              variants={fadeUp} custom={0} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="font-mono text-[11px] text-inkfaint uppercase tracking-[0.14em] mb-4"
            >
              ENDPOINTS
            </motion.p>
            <motion.h2
              variants={fadeUp} custom={1} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="font-serif text-[40px] lg:text-[48px] leading-[1.1] tracking-[-0.01em] text-ink mb-16"
            >
              Available Routes
            </motion.h2>

            <div className="flex flex-col gap-0">
              {endpoints.map((ep, i) => (
                <motion.div
                  key={ep.path}
                  variants={fadeUp} custom={i + 2} initial="hidden" whileInView="show" viewport={{ once: true }}
                  className="border-t border-ink/[.13] py-10"
                >
                  <div className="flex items-baseline gap-4 mb-4">
                    <span className="font-mono text-[12px] font-semibold tracking-[0.08em] px-2.5 py-1" style={{
                      backgroundColor: ep.method === 'POST' ? '#C1121F' : '#1A6B3A',
                      color: '#F5F0E8'
                    }}>
                      {ep.method}
                    </span>
                    <code className="font-mono text-[16px] text-ink">{ep.path}</code>
                  </div>
                  <h3 className="font-serif text-[24px] text-ink mb-3">{ep.title}</h3>
                  <p className="font-mono font-light text-[14px] text-inkwarm leading-[1.7] max-w-[640px] mb-6">{ep.desc}</p>

                  {/* Parameters table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-ink/[.13]">
                          <th className="font-mono text-[11px] text-inkfaint uppercase tracking-[0.1em] pb-3 pr-8">Parameter</th>
                          <th className="font-mono text-[11px] text-inkfaint uppercase tracking-[0.1em] pb-3 pr-8">Type</th>
                          <th className="font-mono text-[11px] text-inkfaint uppercase tracking-[0.1em] pb-3 pr-8">Required</th>
                          <th className="font-mono text-[11px] text-inkfaint uppercase tracking-[0.1em] pb-3">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ep.params.map((p) => (
                          <tr key={p.name} className="border-b border-ink/[.06]">
                            <td className="font-mono text-[13px] text-ink py-3 pr-8"><code>{p.name}</code></td>
                            <td className="font-mono text-[13px] text-inkwarm py-3 pr-8">{p.type}</td>
                            <td className="font-mono text-[13px] py-3 pr-8">
                              {p.required
                                ? <span className="text-[#C1121F]">required</span>
                                : <span className="text-inkfaint">optional</span>
                              }
                            </td>
                            <td className="font-mono text-[13px] text-inkwarm py-3">{p.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Response Format ── */}
        <section className="w-full flex justify-center border-t border-ink/[.13]" style={{ paddingTop: '120px', paddingBottom: '120px' }}>
          <div className="w-full" style={{ maxWidth: '1200px', paddingLeft: '48px', paddingRight: '48px' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <div>
                <motion.p
                  variants={fadeUp} custom={0} initial="hidden" whileInView="show" viewport={{ once: true }}
                  className="font-mono text-[11px] text-inkfaint uppercase tracking-[0.14em] mb-4"
                >
                  RESPONSE FORMAT
                </motion.p>
                <motion.h2
                  variants={fadeUp} custom={1} initial="hidden" whileInView="show" viewport={{ once: true }}
                  className="font-serif text-[40px] leading-[1.1] tracking-[-0.01em] text-ink mb-8"
                >
                  Response Fields
                </motion.h2>

                <motion.div
                  variants={fadeUp} custom={2} initial="hidden" whileInView="show" viewport={{ once: true }}
                  className="flex flex-col"
                >
                  {responseFields.map((f, i) => (
                    <div key={f.field} className="border-t border-ink/[.08] py-4">
                      <div className="flex items-baseline gap-3 mb-1">
                        <code className="font-mono text-[13px] text-ink font-medium">{f.field}</code>
                        <span className="font-mono text-[11px] text-inkfaint">{f.type}</span>
                      </div>
                      <p className="font-mono font-light text-[13px] text-inkwarm leading-[1.6]">{f.desc}</p>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Example response */}
              <motion.div
                variants={fadeUp} custom={3} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="sticky top-28"
              >
                <div className="rounded-xl overflow-hidden border border-[#2A2A28]" style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                  <div className="h-10 bg-[#2D2D2D] flex items-center justify-between px-4 border-b border-[#1A1A1A]">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                      <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                      <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                    </div>
                    <span className="font-mono text-[11px] text-[#1A6B3A] font-medium">200 OK</span>
                  </div>
                  <div className="bg-[#080808] p-5 font-mono text-[13px] leading-[1.7] overflow-x-auto">
                    <span className="text-[#5A5650]">{'{'}</span><br/>
                    {'  '}<span className="text-[#7A9EC7]">{'"status"'}</span><span className="text-[#5A5650]">:</span> <span className="text-[#A8C07A]">{'"success"'}</span><span className="text-[#5A5650]">,</span><br/>
                    {'  '}<span className="text-[#7A9EC7]">{'"data"'}</span><span className="text-[#5A5650]">: {'{'}</span><br/>
                    {'    '}<span className="text-[#7A9EC7]">{'"claim_id"'}</span><span className="text-[#5A5650]">:</span> <span className="text-[#A8C07A]">{'"clm_8f92j10x"'}</span><span className="text-[#5A5650]">,</span><br/>
                    {'    '}<span className="text-[#7A9EC7]">{'"truth_score"'}</span><span className="text-[#5A5650]">:</span> <span className="text-[#C1121F]">0.91</span><span className="text-[#5A5650]">,</span><br/>
                    {'    '}<span className="text-[#7A9EC7]">{'"classification"'}</span><span className="text-[#5A5650]">:</span> <span className="text-[#A8C07A]">{'"VERIFIED"'}</span><span className="text-[#5A5650]">,</span><br/>
                    {'    '}<span className="text-[#7A9EC7]">{'"reasoning"'}</span><span className="text-[#5A5650]">:</span> <span className="text-[#A8C07A]">{'"Multiple space agencies..."'}</span><span className="text-[#5A5650]">,</span><br/>
                    {'    '}<span className="text-[#7A9EC7]">{'"sources"'}</span><span className="text-[#5A5650]">: [</span><br/>
                    {'      '}<span className="text-[#5A5650]">{'{'}</span><br/>
                    {'        '}<span className="text-[#7A9EC7]">{'"url"'}</span><span className="text-[#5A5650]">:</span> <span className="text-[#A8C07A]">{'"https://nasa.gov/..."'}</span><span className="text-[#5A5650]">,</span><br/>
                    {'        '}<span className="text-[#7A9EC7]">{'"stance"'}</span><span className="text-[#5A5650]">:</span> <span className="text-[#A8C07A]">{'"SUPPORTS"'}</span><br/>
                    {'      '}<span className="text-[#5A5650]">{'}'}</span><br/>
                    {'    '}<span className="text-[#5A5650]">],</span><br/>
                    {'    '}<span className="text-[#7A9EC7]">{'"signature"'}</span><span className="text-[#5A5650]">:</span> <span className="text-[#A8C07A]">{'"sig_a9f8b7c..."'}</span><br/>
                    {'  '}<span className="text-[#5A5650]">{'}'}</span><br/>
                    <span className="text-[#5A5650]">{'}'}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Error Codes ── */}
        <section className="w-full flex justify-center border-t border-ink/[.13]" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
          <div className="w-full" style={{ maxWidth: '1200px', paddingLeft: '48px', paddingRight: '48px' }}>
            <motion.p
              variants={fadeUp} custom={0} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="font-mono text-[11px] text-inkfaint uppercase tracking-[0.14em] mb-4"
            >
              ERROR HANDLING
            </motion.p>
            <motion.h2
              variants={fadeUp} custom={1} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="font-serif text-[40px] leading-[1.1] tracking-[-0.01em] text-ink mb-12"
            >
              Error Codes
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-ink/[.08]">
              {errorCodes.map((e, i) => (
                <motion.div
                  key={e.code}
                  variants={fadeUp} custom={i + 2} initial="hidden" whileInView="show" viewport={{ once: true }}
                  className="bg-paper p-6"
                >
                  <p className="font-mono text-[32px] text-ink/20 mb-3">{e.code}</p>
                  <h3 className="font-serif text-[18px] text-ink mb-2">{e.title}</h3>
                  <p className="font-mono font-light text-[13px] text-inkwarm leading-[1.6]">{e.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="w-full flex justify-center border-t border-ink/[.13]" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
          <div className="w-full text-center" style={{ maxWidth: '1200px', paddingLeft: '48px', paddingRight: '48px' }}>
            <motion.h2
              variants={fadeUp} custom={0} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="font-serif text-[40px] lg:text-[56px] leading-[1.1] tracking-[-0.02em] text-ink mb-6"
            >
              Start building today.
            </motion.h2>
            <motion.p
              variants={fadeUp} custom={1} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="font-mono font-light text-[15px] text-inkwarm mb-10 max-w-[480px] mx-auto leading-[1.7]"
            >
              Generate your API key in Credify Studio and make your first verification request in under 60 seconds.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex flex-wrap gap-4 justify-center">
              <a
                href="/platform/index.html"
                className="bg-red hover:bg-redhover text-paper font-mono font-medium text-[13px] tracking-[0.08em] px-8 py-4 transition-all duration-200 cursor-pointer"
              >
                Get API Key →
              </a>
              <a
                href="https://github.com/InnoShay"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-transparent hover:bg-ink hover:text-paper text-ink border border-ink font-mono font-medium text-[13px] tracking-[0.08em] px-8 py-4 transition-all duration-200 cursor-pointer"
              >
                View on GitHub →
              </a>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}

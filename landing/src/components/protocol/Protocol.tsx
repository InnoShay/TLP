'use client'
import { motion } from 'framer-motion'
import { SectionLabel } from '../ui/SectionLabel'
import { BentoCard } from './BentoCard'

const ParseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none">
    <circle cx="12" cy="5" r="3"/>
    <circle cx="6" cy="19" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <path d="M10.5 7.5L7.5 16.5M13.5 7.5L16.5 16.5"/>
  </svg>
)

const GlobeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none">
    <circle cx="12" cy="12" r="10"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
  </svg>
)

const ConsensusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none">
    <path d="M4 6h16M4 12h10M4 18h12"/>
    <path d="M16 11l2 2 4-4"/>
  </svg>
)

const DialIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none">
    <path d="M3 12a9 9 0 1118 0"/>
    <path d="M12 12L15 8"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
)

const CacheIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
)

const AuditIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none">
    <path d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
  </svg>
)

export default function Protocol() {
  return (
    <div>
      <SectionLabel>THE PROTOCOL</SectionLabel>
      <h2 className="font-serif text-[48px] leading-[1.1] tracking-[-0.01em] text-ink mt-4 mb-12">
        How Credify Works
      </h2>

      <motion.div
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08 } }
        }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        className="bento-grid-protocol"
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1] } } }} className="col-span-12 lg:col-span-5 lg:row-span-2">
          <BentoCard
            step="STEP 01"
            title="Claim Extraction"
            body="Raw text is parsed using deterministic LLM pipelines to extract verifiable factual claims, isolating the subject, predicate, object, and temporal context."
            icon={<ParseIcon />}
            className="h-full"
          >
            <div className="border border-ink/[.13] bg-inset p-4 mt-auto mb-0">
              <p className="font-mono text-[11px] text-inkfaint uppercase mb-3 tracking-[0.12em]">CLAIM PARSED</p>
              {[
                ['Subject',   'NASA'],
                ['Predicate', 'confirmed discovery'],
                ['Object',    'liquid water on Mars'],
                ['Temporal',  '2024'],
                ['Type',      'FACTUAL'],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-3 font-mono text-[12px] leading-[1.6] pb-2 last:pb-0 border-b border-ink/[.13] last:border-b-0 mb-2 last:mb-0">
                  <span className="text-inkfaint w-24 shrink-0">{k}</span>
                  <span className="text-inkwarm">→ {v}</span>
                </div>
              ))}
            </div>
          </BentoCard>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1] } } }} className="col-span-12 lg:col-span-4 lg:row-span-1">
          <BentoCard
            step="STEP 02"
            title="Source Aggregation"
            body="The engine simultaneously queries multiple high-authority knowledge bases, including government domains, scientific journals, and primary news agencies."
            icon={<GlobeIcon />}
            className="h-full"
          />
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1] } } }} className="col-span-12 lg:col-span-3 lg:row-span-1">
          <BentoCard
            step="STEP 03"
            title="Consensus Engine"
            body="Evidence is weighted dynamically based on the historical reliability and domain authority of the source."
            icon={<ConsensusIcon />}
            className="h-full"
          />
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1] } } }} className="col-span-12 lg:col-span-7 lg:row-span-1">
          <BentoCard
            step="STEP 04"
            title="Truth Score Output"
            body="A final deterministic vector between 0.0 and 1.0 is generated, representing the aggregate truth probability across all analyzed evidence."
            icon={<DialIcon />}
            className="h-full"
          >
            <div className="mt-8">
              <div className="relative h-[4px] w-full bg-inset border border-ink/[.13]">
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #C1121F, #8B6914, #1A6B3A)' }} />
                <div className="absolute top-[-6px] translate-x-[-50%]" style={{ left: '87%' }}>
                  <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[7px] border-l-transparent border-r-transparent border-b-ink" />
                </div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-mono text-[11px] tracking-[0.12em] text-red">0.0 FALSE</span>
                <span className="font-mono text-[11px] tracking-[0.12em] text-verified">1.0 VERIFIED</span>
              </div>
            </div>
          </BentoCard>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1] } } }} className="col-span-12 lg:col-span-4 lg:row-span-1">
          <BentoCard
            title="Redis Cache"
            body="Sub-50ms retrieval latency for previously verified claims, backed by a globally distributed Redis cluster."
            icon={<CacheIcon />}
            className="h-full"
          />
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1] } } }} className="col-span-12 lg:col-span-8 lg:row-span-1">
          <BentoCard
            title="Audit Trail"
            body="Every verification result is cryptographically signed and logged, providing a transparent chain of reasoning for 'Explainable AI' requirements."
            icon={<AuditIcon />}
            className="h-full"
          />
        </motion.div>

      </motion.div>
    </div>
  )
}

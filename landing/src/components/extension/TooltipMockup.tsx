'use client'
import { motion } from 'framer-motion'

export default function TooltipMockup() {
  return (
    <div className="relative w-full border border-ink/[.13] bg-surface p-8 overflow-hidden min-h-[280px]">
      {/* Fake article background */}
      <div style={{ filter: 'blur(1.5px)', opacity: 0.6 }} className="font-mono font-light text-[14px] text-inkwarm leading-relaxed select-none">
        <p>Scientists at the International Space Station have reported unprecedented...</p>
        <p className="mt-3">
          {'The latest findings, published in '}
          <mark className="bg-red/15 text-ink not-italic px-0.5">
            Nature Climate Science, suggest that global average temperatures
          </mark>
          {' have exceeded pre-industrial levels by...'}
        </p>
        <p className="mt-3">Researchers from 47 countries collaborated on the study...</p>
      </div>

      {/* Tooltip card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 1.2 }}
        className="absolute top-6 right-6 w-[300px] bg-paper border border-ink/[.33] z-10"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-ink/[.13]">
          <span className="font-mono text-[10px] text-inkfaint uppercase tracking-[0.12em]">CREDIFY TLP</span>
          <span className="font-mono text-[14px] text-inkfaint cursor-pointer hover:text-ink">×</span>
        </div>

        {/* Score row */}
        <div className="px-4 py-4 flex items-center gap-3">
          <span className="font-mono font-semibold text-[36px] text-red leading-none">0.87</span>
          <span className="border border-likelytrue text-likelytrue font-mono font-medium text-[10px] uppercase tracking-[0.1em] px-3 py-1.5 rounded-badge">
            LIKELY TRUE
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-ink/[.13]" />

        {/* Reasoning */}
        <div className="px-4 py-3">
          <p className="font-mono font-light text-[11px] text-inkwarm leading-relaxed">
            Claim is predominantly supported across major scientific publications and official agency reports.
          </p>
        </div>

        {/* Sources */}
        <div className="px-4 pb-4 flex flex-col gap-2">
          {[
            { domain: 'nature.com',   stance: 'SUPPORTS', color: 'text-verified' },
            { domain: 'nasa.gov',     stance: 'SUPPORTS', color: 'text-verified' },
            { domain: 'reuters.com',  stance: 'NEUTRAL',  color: 'text-inkfaint' },
          ].map(({ domain, stance, color }) => (
            <div key={domain} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-inset border border-ink/[.13] shrink-0" />
                <span className="font-mono text-[11px] text-inkwarm">{domain}</span>
              </div>
              <span className={`font-mono text-[10px] uppercase tracking-[0.08em] ${color}`}>
                {stance}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

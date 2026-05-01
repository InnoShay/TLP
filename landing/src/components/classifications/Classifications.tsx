import { AnimatedSection } from '../ui/AnimatedSection'
import { SectionLabel } from '../ui/SectionLabel'

const CLASSIFICATIONS = [
  {
    range: '≥ 0.85',
    label: 'VERIFIED',
    color: '#1A6B3A',
    tailwindText: 'text-verified',
    description: 'Strong multi-source consensus. Factually supported by independent evidence.',
  },
  {
    range: '0.70–0.84',
    label: 'LIKELY TRUE',
    color: '#2D7D46',
    tailwindText: 'text-likelytrue',
    description: 'Predominantly supported with minor evidential gaps.',
  },
  {
    range: '0.50–0.69',
    label: 'UNCERTAIN',
    color: '#8B6914',
    tailwindText: 'text-uncertain',
    description: 'Mixed signals detected across sources. Proceed with caution.',
  },
  {
    range: '0.30–0.49',
    label: 'LIKELY FALSE',
    color: '#B5470A',
    tailwindText: 'text-likelyfalse',
    description: 'Predominantly contradicted by independent sources.',
  },
  {
    range: '< 0.30',
    label: 'FALSE',
    color: '#C1121F',
    tailwindText: 'text-red',
    description: 'Strong multi-source contradiction. Claim is factually unsupported.',
  },
  {
    range: '—',
    label: 'NOT VERIFIABLE',
    color: '#7A7468',
    tailwindText: 'text-inkfaint',
    description: 'Insufficient public data to make a determination.',
  },
]

export default function Classifications() {
  return (
    <div>
      <AnimatedSection delay={0}>
        <SectionLabel>REFERENCE</SectionLabel>
      </AnimatedSection>
      
      <AnimatedSection delay={0.1}>
        <h2 className="font-serif text-[48px] leading-[1.1] tracking-[-0.01em] text-ink mt-4 mb-12">
          Classification Reference
        </h2>
      </AnimatedSection>

      <div className="bento-grid-classifications">
        {CLASSIFICATIONS.map((c, i) => (
          <AnimatedSection key={c.label} delay={0.1 + (i * 0.08)} className="border border-ink/[.13] bg-surface p-[32px] pt-0 flex flex-col hover:border-ink/[.33] transition-colors duration-200 h-full">
            <div style={{ height: '3px', backgroundColor: c.color, width: '100%', marginBottom: '16px' }} />
            <p className="font-mono text-[11px] leading-[1] text-inkfaint uppercase tracking-[0.12em]">{c.range}</p>
            <p className={`font-serif text-[20px] mt-2 ${c.tailwindText}`}>{c.label}</p>
            <p className="font-mono font-light text-[13px] text-inkwarm leading-[1.6] mt-3">{c.description}</p>
          </AnimatedSection>
        ))}
      </div>
    </div>
  )
}

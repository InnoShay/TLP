import { AnimatedSection } from '../ui/AnimatedSection'
import TruthScoreWidget from './TruthScoreWidget'

export default function Hero() {
  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-[58fr_42fr] gap-12 lg:gap-16 items-center">
      {/* Texture Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[-1]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'4\' height=\'4\'><circle cx=\'1\' cy=\'1\' r=\'0.8\' fill=\'%230E0E0E\'/></svg>")',
          backgroundSize: '4px 4px',
          opacity: 0.035
        }}
      />

      {/* Left Column Prose */}
      <div>
        <AnimatedSection delay={0}>
          <p className="font-mono text-[11px] leading-[1] text-inkfaint uppercase tracking-[0.12em] mb-6">
            TRUST LAYER PROTOCOL v1.0
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.12}>
          <h1 className="font-serif text-[48px] lg:text-[72px] leading-[1.05] tracking-[-0.02em] text-ink">
            The internet lies.
          </h1>
        </AnimatedSection>

        <AnimatedSection delay={0.24}>
          <h1 className="font-serif text-[48px] lg:text-[72px] leading-[1.05] tracking-[-0.02em] text-ink mb-6">
            Credify doesn't.
          </h1>
        </AnimatedSection>

        <AnimatedSection delay={0.36}>
          <p className="font-serif italic text-[18px] lg:text-[22px] text-inkwarm leading-relaxed mb-6">
            <span>A deterministic trust layer between</span>
            <br />
            <span>information and belief.</span>
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.48}>
          <p className="font-mono font-light text-[15px] leading-[1.7] text-inkwarm max-w-[480px] mb-10">
            Credify extracts every factual claim from any text,<br className="hidden lg:block" />
            cross-references it against live authoritative sources,<br className="hidden lg:block" />
            and returns a verified Truth Score in real-time.<br className="hidden lg:block" />
            Built for developers. Deployed at scale.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.60}>
          <div className="flex flex-wrap gap-4">
            <a
              href="/platform/index.html"
              className="bg-red hover:bg-redhover text-paper border border-red font-mono font-medium text-[13px] tracking-[0.08em] px-7 py-3.5 transition-all duration-200 rounded-none cursor-pointer"
            >
              Open Credify Studio →
            </a>
            <a
              href="/extension"
              className="bg-transparent hover:bg-ink hover:text-paper text-ink border border-ink font-mono font-medium text-[13px] tracking-[0.08em] px-7 py-3.5 transition-all duration-200 rounded-none cursor-pointer flex items-center gap-2"
            >
              <span>⬇</span> Download Extension
            </a>
          </div>
        </AnimatedSection>
      </div>

      {/* Right Column Widget */}
      <AnimatedSection delay={0.8} className="flex justify-center lg:justify-end">
        <TruthScoreWidget />
      </AnimatedSection>
    </div>
  )
}

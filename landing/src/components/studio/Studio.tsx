import { AnimatedSection } from '../ui/AnimatedSection'
import { SectionLabel } from '../ui/SectionLabel'
import DashboardMockup from './DashboardMockup'

export default function Studio() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[44fr_56fr] gap-12 lg:gap-16 items-center">
      <div>
        <AnimatedSection delay={0}>
          <SectionLabel>DEVELOPER PLATFORM</SectionLabel>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <h2 className="font-serif text-[48px] leading-[1.1] tracking-[-0.01em] text-ink mt-4 mb-6">
            Credify Studio
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <p className="font-mono font-light text-[15px] leading-[1.7] text-inkwarm mb-8 max-w-[480px]">
            Manage your API keys, monitor real-time verification logs, and test claims instantly in the interactive playground. Built for teams deploying the Trust Layer Protocol at scale.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <ul className="flex flex-col gap-4 font-mono font-light text-[13px] text-inkwarm mb-10">
            <li className="flex gap-3">
              <span className="text-ink">→</span> Secure API Key generation and management
            </li>
            <li className="flex gap-3">
              <span className="text-ink">→</span> Cryptographically signed verification logs
            </li>
            <li className="flex gap-3">
              <span className="text-ink">→</span> Interactive JSON-based testing environment
            </li>
          </ul>
        </AnimatedSection>

        <AnimatedSection delay={0.4}>
          <a 
            href="/platform/index.html" 
            className="inline-block bg-transparent hover:bg-ink hover:text-paper text-ink border border-ink font-mono font-medium text-[13px] tracking-[0.08em] px-7 py-3.5 transition-all duration-200 rounded-none cursor-pointer"
          >
            Open Credify Studio →
          </a>
        </AnimatedSection>
      </div>

      <AnimatedSection delay={0.5} className="w-full">
        <DashboardMockup />
      </AnimatedSection>
    </div>
  )
}

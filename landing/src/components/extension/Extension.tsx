import { AnimatedSection } from '../ui/AnimatedSection'
import { SectionLabel } from '../ui/SectionLabel'
import InstallSteps from './InstallSteps'
import TooltipMockup from './TooltipMockup'

export default function Extension() {
  return (
    <div>
      <AnimatedSection delay={0}>
        <SectionLabel>BROWSER EXTENSION</SectionLabel>
      </AnimatedSection>
      
      <AnimatedSection delay={0.1}>
        <h2 className="font-serif text-[48px] leading-[1.1] tracking-[-0.01em] text-ink mt-4 mb-6">
          Verify Anything. Anywhere.
        </h2>
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <p className="font-mono font-light text-[15px] leading-[1.7] text-inkwarm max-w-[480px] mb-8">
          The Credify Chrome Extension brings the power of the Trust Layer Protocol directly to your browser. Highlight any text, right-click, and get an instant Truth Score backed by authoritative sources.
        </p>
      </AnimatedSection>

      <AnimatedSection delay={0.3}>
        <div className="flex flex-wrap gap-4">
          <a 
            href="/extension"
            className="bg-red hover:bg-redhover text-paper border border-red font-mono font-medium text-[13px] tracking-[0.08em] px-7 py-3.5 transition-all duration-200 rounded-none cursor-pointer flex items-center gap-2"
          >
            <span>⬇</span> Download Extension
          </a>
          <a 
            href="/docs" 
            className="bg-transparent hover:bg-ink hover:text-paper text-ink border border-ink font-mono font-medium text-[13px] tracking-[0.08em] px-7 py-3.5 transition-all duration-200 rounded-none cursor-pointer"
          >
            Read the Docs
          </a>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.4}>
        <InstallSteps />
      </AnimatedSection>

      <AnimatedSection delay={0.5}>
        <TooltipMockup />
      </AnimatedSection>
    </div>
  )
}

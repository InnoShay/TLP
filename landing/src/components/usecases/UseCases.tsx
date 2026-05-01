'use client'
import { motion } from 'framer-motion'
import { AnimatedSection } from '../ui/AnimatedSection'
import { SectionLabel } from '../ui/SectionLabel'

const NewsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none">
    <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
  </svg>
)

const BookIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
  </svg>
)

const ScalesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none">
    <path d="M3 14h6m12 0h-6m-3-3v10m-8-2l4-4 4 4m6 0l4-4 4 4M12 3v8M9 5h6"/>
  </svg>
)

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

export default function UseCases() {
  const cases = [
    {
      title: 'Newsrooms',
      gridPlacement: { gridColumn: '1 / 6', gridRow: '1 / 2' },
      icon: <NewsIcon />,
      body: 'Fact-check articles, wire reports, and sourced quotes before publication. Integrate via REST API into existing editorial workflow tools.'
    },
    {
      title: 'Academic Research',
      gridPlacement: { gridColumn: '6 / 13', gridRow: '1 / 2' },
      icon: <BookIcon />,
      body: 'Validate citations and verify empirical claims in research papers. Flag assertions that lack independent corroboration across peer-reviewed sources.'
    },
    {
      title: 'Policy & Governance',
      gridPlacement: { gridColumn: '1 / 8', gridRow: '2 / 3' },
      icon: <ScalesIcon />,
      body: 'Deploy Credify as a compliance and media-monitoring layer. Audit public statements, policy claims, and institutional communications at scale.'
    },
    {
      title: 'Individual Users',
      gridPlacement: { gridColumn: '8 / 13', gridRow: '2 / 3' },
      icon: <UserIcon />,
      body: 'The Chrome Extension brings real-time fact-checking to everyday browsing. Highlight. Verify. Decide. No technical knowledge required.'
    }
  ]

  return (
    <div>
      <AnimatedSection delay={0}>
        <SectionLabel>USE CASES</SectionLabel>
      </AnimatedSection>
      
      <AnimatedSection delay={0.1}>
        <h2 className="font-serif text-[48px] leading-[1.1] tracking-[-0.01em] text-ink mt-4 mb-12">
          Who uses Credify?
        </h2>
      </AnimatedSection>

      <motion.div
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08 } }
        }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '10px' }} 
        className="w-full"
      >
          {cases.map((c) => (
            <motion.div 
              key={c.title} 
              variants={{ 
                hidden: { opacity: 0, y: 24 }, 
                show: { opacity: 1, y: 0, transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1] } } 
              }} 
              style={c.gridPlacement}
              className={`border border-ink/[.13] bg-surface p-8 flex flex-col hover:border-ink/[.33] transition-colors duration-200 lg:col-auto col-span-12`}
            >
              <div className="text-ink mb-6">
                {c.icon}
              </div>
              <h3 className="font-serif text-[22px] text-ink mb-2">{c.title}</h3>
              <p className="font-mono font-light text-[13px] leading-[1.6] text-inkwarm mb-6">
                {c.body}
              </p>
              <a href="#" className="font-mono text-[13px] text-inkfaint hover:text-ink mt-auto self-start transition-colors duration-200">
                → Learn more
              </a>
            </motion.div>
          ))}
      </motion.div>
    </div>
  )
}

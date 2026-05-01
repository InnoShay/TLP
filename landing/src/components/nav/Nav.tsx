'use client'
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export default function Nav() {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > 80)
  })

  const links = [
    { name: 'Studio', href: 'https://studio.credify.dev' },
    { name: 'Extension', href: 'https://credify.dev/extension/download.zip' },
    { name: 'API Docs', href: 'https://docs.credify.dev/api' }
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full flex justify-center ${scrolled ? 'bg-paper/92 backdrop-blur-md border-b border-ink/[.13]' : 'bg-transparent'}`}>
      <div className="w-full h-20 flex items-center justify-between" style={{ maxWidth: '1200px', paddingLeft: '48px', paddingRight: '48px' }}>
        <a href="/" className="font-serif text-[20px] text-ink tracking-tight">CREDIFY</a>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8 font-mono text-[12px] tracking-[0.08em] uppercase text-inkwarm">
          <a href="/platform/index.html" className="hover:text-ink transition-colors">Studio</a>
          <span className="text-ink/[.13]">&middot;</span>
          <a href="/extension" className="hover:text-ink transition-colors">Extension</a>
          <span className="text-ink/[.13]">&middot;</span>
          <a href="/docs" className="hover:text-ink transition-colors">API Docs</a>
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:block">
          <a href="/platform/index.html"
            className="inline-block text-ink border border-ink hover:bg-ink hover:text-paper font-mono font-medium text-[13px] tracking-[0.08em] px-5 py-2.5 transition-all duration-200 rounded-none cursor-pointer">
            Open Studio →
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button className="lg:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span className="block w-6 h-[1px] bg-ink"></span>
          <span className="block w-6 h-[1px] bg-ink"></span>
          <span className="block w-6 h-[1px] bg-ink"></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-paper border-b border-ink/[.13] overflow-hidden"
          >
            <div className="flex flex-col">
              <a href="/platform/index.html" className="font-mono text-[13px] text-inkwarm hover:text-ink transition-colors duration-200 w-full p-4 border-b border-ink/[.13]" onClick={() => setMobileMenuOpen(false)}>Studio</a>
              <a href="/extension" className="font-mono text-[13px] text-inkwarm hover:text-ink transition-colors duration-200 w-full p-4 border-b border-ink/[.13]" onClick={() => setMobileMenuOpen(false)}>Extension</a>
              <a href="/docs" className="font-mono text-[13px] text-inkwarm hover:text-ink transition-colors duration-200 w-full p-4 border-b border-ink/[.13]" onClick={() => setMobileMenuOpen(false)}>API Docs</a>
              <a href="/platform/index.html" className="font-mono font-medium text-[13px] tracking-[0.08em] text-paper bg-ink w-full p-4 text-center transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>
                Open Studio →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

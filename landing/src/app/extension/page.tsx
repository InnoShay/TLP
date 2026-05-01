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

const steps = [
  {
    num: '01',
    title: 'Download the Package',
    desc: 'Click the download button to get the Credify extension archive. Unzip it to a permanent folder on your machine — this will be the source directory Chrome reads from.',
    icon: '⬇'
  },
  {
    num: '02',
    title: 'Enable Developer Mode',
    desc: 'Open Google Chrome and navigate to chrome://extensions. In the top-right corner, toggle the "Developer Mode" switch to ON. This allows you to load unpacked extensions.',
    icon: '⚙'
  },
  {
    num: '03',
    title: 'Load Unpacked Extension',
    desc: 'Click the "Load Unpacked" button that appears after enabling Developer Mode. Navigate to and select the folder where you unzipped the Credify extension.',
    icon: '📂'
  },
  {
    num: '04',
    title: 'Add Your API Key',
    desc: 'Click the Credify icon in your toolbar, open Settings, and paste your Studio API key. This connects the extension to the Trust Layer Protocol verification engine.',
    icon: '🔑'
  },
  {
    num: '05',
    title: 'Start Verifying',
    desc: 'Highlight any text on any webpage. Right-click and select "Verify with Credify" or use the keyboard shortcut Ctrl+Shift+V. The Truth Score appears instantly in a sleek overlay.',
    icon: '✓'
  }
]

const features = [
  {
    title: 'Context Menu Integration',
    desc: 'Right-click any highlighted text to instantly verify claims without leaving the page.',
  },
  {
    title: 'Inline Truth Overlay',
    desc: 'Results appear in a minimal, non-intrusive overlay anchored to your selection with score, sources, and classification.',
  },
  {
    title: 'Keyboard Shortcut',
    desc: 'Use Ctrl+Shift+V (⌘+Shift+V on Mac) to trigger verification without touching the mouse.',
  },
  {
    title: 'Verification History',
    desc: 'Every claim you verify is stored locally with timestamps, scores, and source links for future reference.',
  },
  {
    title: 'Privacy First',
    desc: 'No browsing data is collected. Only the text you explicitly select is sent to the API for verification.',
  },
  {
    title: 'Studio Sync',
    desc: 'Connect your Studio account to sync verification logs across devices and access them in the dashboard.',
  }
]

export default function ExtensionPage() {
  return (
    <>
      <Nav />
      <main className="w-full flex flex-col items-center overflow-x-hidden bg-paper">

        {/* ── Hero ── */}
        <section className="w-full flex justify-center" style={{ paddingTop: '160px', paddingBottom: '120px' }}>
          <div className="w-full" style={{ maxWidth: '1200px', paddingLeft: '48px', paddingRight: '48px' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left */}
              <div>
                <motion.p
                  variants={fadeUp} custom={0} initial="hidden" animate="show"
                  className="font-mono text-[11px] text-inkfaint uppercase tracking-[0.14em] mb-6"
                >
                  BROWSER EXTENSION
                </motion.p>
                <motion.h1
                  variants={fadeUp} custom={1} initial="hidden" animate="show"
                  className="font-serif text-[48px] lg:text-[64px] leading-[1.05] tracking-[-0.02em] text-ink mb-6"
                >
                  Verify Anything.<br />Anywhere.
                </motion.h1>
                <motion.p
                  variants={fadeUp} custom={2} initial="hidden" animate="show"
                  className="font-mono font-light text-[15px] leading-[1.7] text-inkwarm max-w-[480px] mb-10"
                >
                  The Credify Chrome Extension brings the full power of the Trust Layer Protocol directly into your browser. Highlight any text on any page, right-click, and get an instant Truth Score backed by authoritative sources — no context switching required.
                </motion.p>
                <motion.div variants={fadeUp} custom={3} initial="hidden" animate="show" className="flex flex-wrap gap-4">
                  <a
                    href="/credify-extension-v1.0.0.zip"
                    download="credify-extension-v1.0.0.zip"
                    className="bg-red hover:bg-redhover text-paper font-mono font-medium text-[13px] tracking-[0.08em] px-8 py-4 transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>⬇</span> Download Extension v1.0.0
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

              {/* Right — Browser mockup */}
              <motion.div
                variants={fadeUp} custom={4} initial="hidden" animate="show"
                className="hidden lg:block"
              >
                <div className="rounded-xl overflow-hidden border border-[#2A2A28]" style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                  <div className="h-10 bg-[#2D2D2D] flex items-center px-4 gap-2 border-b border-[#1A1A1A]">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                    <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                    <span className="ml-4 font-mono text-[11px] text-[#5A5650]">chrome://extensions</span>
                  </div>
                  <div className="bg-[#080808] p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-[#C1121F] flex items-center justify-center font-serif text-[18px] text-paper font-bold">C</div>
                      <div>
                        <p className="font-mono text-[14px] text-[#EEE8D5] font-medium">Credify Extension</p>
                        <p className="font-mono text-[11px] text-[#5A5650]">v1.0.0 · Trust Layer Protocol</p>
                      </div>
                      <div className="ml-auto">
                        <div className="w-10 h-5 bg-[#1A6B3A] rounded-full relative">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-[#1A1A1A] pt-4">
                      <div className="flex gap-6 font-mono text-[11px] text-[#5A5650]">
                        <span>ID: <span className="text-[#8A8680]">credify-tlp-ext</span></span>
                        <span>Size: <span className="text-[#8A8680]">342 KB</span></span>
                        <span>Permissions: <span className="text-[#8A8680]">contextMenus, activeTab</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Installation Steps ── */}
        <section className="w-full flex justify-center border-t border-ink/[.13]" style={{ paddingTop: '120px', paddingBottom: '120px' }}>
          <div className="w-full" style={{ maxWidth: '1200px', paddingLeft: '48px', paddingRight: '48px' }}>
            <motion.p
              variants={fadeUp} custom={0} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="font-mono text-[11px] text-inkfaint uppercase tracking-[0.14em] mb-4"
            >
              INSTALLATION
            </motion.p>
            <motion.h2
              variants={fadeUp} custom={1} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="font-serif text-[40px] lg:text-[48px] leading-[1.1] tracking-[-0.01em] text-ink mb-16"
            >
              Up and Running in 5 Steps
            </motion.h2>

            <div className="flex flex-col gap-0">
              {steps.map((step, i) => (
                <motion.div
                  key={step.num}
                  variants={fadeUp} custom={i + 2} initial="hidden" whileInView="show" viewport={{ once: true }}
                  className="grid grid-cols-1 lg:grid-cols-[80px_1fr] gap-6 border-t border-ink/[.13] py-10"
                >
                  <div className="flex items-start">
                    <span className="font-mono text-[36px] text-inkfaint/30 leading-[1] tracking-[-0.02em]">{step.num}</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-[24px] text-ink mb-3">{step.title}</h3>
                    <p className="font-mono font-light text-[14px] text-inkwarm leading-[1.7] max-w-[560px]">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features Grid ── */}
        <section className="w-full flex justify-center border-t border-ink/[.13]" style={{ paddingTop: '120px', paddingBottom: '120px' }}>
          <div className="w-full" style={{ maxWidth: '1200px', paddingLeft: '48px', paddingRight: '48px' }}>
            <motion.p
              variants={fadeUp} custom={0} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="font-mono text-[11px] text-inkfaint uppercase tracking-[0.14em] mb-4"
            >
              CAPABILITIES
            </motion.p>
            <motion.h2
              variants={fadeUp} custom={1} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="font-serif text-[40px] lg:text-[48px] leading-[1.1] tracking-[-0.01em] text-ink mb-16"
            >
              Built for Power Users
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/[.08]">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp} custom={i + 2} initial="hidden" whileInView="show" viewport={{ once: true }}
                  className="bg-paper p-8 flex flex-col"
                >
                  <h3 className="font-serif text-[20px] text-ink mb-3">{f.title}</h3>
                  <p className="font-mono font-light text-[13px] text-inkwarm leading-[1.6]">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Requirements ── */}
        <section className="w-full flex justify-center border-t border-ink/[.13]" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
          <div className="w-full" style={{ maxWidth: '1200px', paddingLeft: '48px', paddingRight: '48px' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <motion.p
                  variants={fadeUp} custom={0} initial="hidden" whileInView="show" viewport={{ once: true }}
                  className="font-mono text-[11px] text-inkfaint uppercase tracking-[0.14em] mb-4"
                >
                  REQUIREMENTS
                </motion.p>
                <motion.h2
                  variants={fadeUp} custom={1} initial="hidden" whileInView="show" viewport={{ once: true }}
                  className="font-serif text-[40px] leading-[1.1] tracking-[-0.01em] text-ink mb-8"
                >
                  System Requirements
                </motion.h2>
                <motion.ul
                  variants={fadeUp} custom={2} initial="hidden" whileInView="show" viewport={{ once: true }}
                  className="flex flex-col gap-4 font-mono font-light text-[14px] text-inkwarm"
                >
                  <li className="flex gap-3"><span className="text-ink">→</span> Google Chrome v88 or later (Chromium-based browsers supported)</li>
                  <li className="flex gap-3"><span className="text-ink">→</span> Active Credify Studio account with a valid API key</li>
                  <li className="flex gap-3"><span className="text-ink">→</span> Internet connection for real-time verification</li>
                  <li className="flex gap-3"><span className="text-ink">→</span> Minimum 50MB available disk space</li>
                </motion.ul>
              </div>
              <div>
                <motion.p
                  variants={fadeUp} custom={0} initial="hidden" whileInView="show" viewport={{ once: true }}
                  className="font-mono text-[11px] text-inkfaint uppercase tracking-[0.14em] mb-4"
                >
                  KEYBOARD SHORTCUTS
                </motion.p>
                <motion.h2
                  variants={fadeUp} custom={1} initial="hidden" whileInView="show" viewport={{ once: true }}
                  className="font-serif text-[40px] leading-[1.1] tracking-[-0.01em] text-ink mb-8"
                >
                  Quick Actions
                </motion.h2>
                <motion.div
                  variants={fadeUp} custom={2} initial="hidden" whileInView="show" viewport={{ once: true }}
                  className="flex flex-col gap-4"
                >
                  {[
                    { keys: 'Ctrl + Shift + V', action: 'Verify highlighted text' },
                    { keys: 'Ctrl + Shift + H', action: 'Open verification history' },
                    { keys: 'Ctrl + Shift + S', action: 'Open extension settings' },
                    { keys: 'Esc', action: 'Dismiss overlay' },
                  ].map((shortcut, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-ink/[.08] pb-4">
                      <code className="font-mono text-[13px] bg-ink/[.06] px-3 py-1.5 text-ink">{shortcut.keys}</code>
                      <span className="font-mono font-light text-[13px] text-inkwarm">{shortcut.action}</span>
                    </div>
                  ))}
                </motion.div>
              </div>
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
              Ready to verify?
            </motion.h2>
            <motion.p
              variants={fadeUp} custom={1} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="font-mono font-light text-[15px] text-inkwarm mb-10 max-w-[480px] mx-auto leading-[1.7]"
            >
              Download the Credify extension and start verifying claims across the web in under two minutes.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex flex-wrap gap-4 justify-center">
              <a
                href="/credify-extension-v1.0.0.zip"
                download="credify-extension-v1.0.0.zip"
                className="bg-red hover:bg-redhover text-paper font-mono font-medium text-[13px] tracking-[0.08em] px-8 py-4 transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
              >
                <span>⬇</span> Download Extension
              </a>
              <a
                href="/docs"
                className="bg-transparent hover:bg-ink hover:text-paper text-ink border border-ink font-mono font-medium text-[13px] tracking-[0.08em] px-8 py-4 transition-all duration-200 cursor-pointer"
              >
                Read the Docs →
              </a>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}

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

const services = [
  {
    name: 'API Gateway',
    status: 'operational',
    uptime: '99.98%',
    latency: '42ms',
    desc: 'Primary verification endpoint — api.credify.dev'
  },
  {
    name: 'Verification Engine',
    status: 'operational',
    uptime: '99.99%',
    latency: '180ms',
    desc: 'NLP claim extraction and cross-reference pipeline'
  },
  {
    name: 'Redis Cache Layer',
    status: 'operational',
    uptime: '99.99%',
    latency: '8ms',
    desc: 'Globally distributed cache for sub-50ms repeat queries'
  },
  {
    name: 'Source Aggregator',
    status: 'operational',
    uptime: '99.95%',
    latency: '120ms',
    desc: 'Real-time authoritative source retrieval and stance analysis'
  },
  {
    name: 'Credify Studio',
    status: 'operational',
    uptime: '99.97%',
    latency: '65ms',
    desc: 'Developer dashboard, API key management, and playground'
  },
  {
    name: 'Webhook Delivery',
    status: 'operational',
    uptime: '99.96%',
    latency: '95ms',
    desc: 'Async batch result delivery via registered webhook URLs'
  },
]

const incidents: { date: string; title: string; status: string; desc: string }[] = []

export default function StatusPage() {
  const allOperational = services.every(s => s.status === 'operational')

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
              SYSTEM STATUS
            </motion.p>
            <motion.h1
              variants={fadeUp} custom={1} initial="hidden" animate="show"
              className="font-serif text-[48px] lg:text-[64px] leading-[1.05] tracking-[-0.02em] text-ink mb-6"
            >
              Service Status
            </motion.h1>
            <motion.div
              variants={fadeUp} custom={2} initial="hidden" animate="show"
              className="flex items-center gap-3 mb-4"
            >
              {allOperational && (
                <>
                  <span className="w-3 h-3 rounded-full bg-[#1A6B3A] animate-pulse" />
                  <span className="font-mono font-medium text-[15px] text-[#1A6B3A] uppercase tracking-[0.08em]">
                    All Systems Operational
                  </span>
                </>
              )}
            </motion.div>
            <motion.p
              variants={fadeUp} custom={3} initial="hidden" animate="show"
              className="font-mono font-light text-[14px] text-inkwarm"
            >
              Last updated: {new Date().toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </motion.p>
          </div>
        </section>

        {/* ── Services ── */}
        <section className="w-full flex justify-center border-t border-ink/[.13]" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
          <div className="w-full" style={{ maxWidth: '1200px', paddingLeft: '48px', paddingRight: '48px' }}>
            <div className="flex flex-col">
              {services.map((service, i) => (
                <motion.div
                  key={service.name}
                  variants={fadeUp} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }}
                  className="border-t border-ink/[.13] py-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="w-2 h-2 rounded-full bg-[#1A6B3A]" />
                        <h3 className="font-serif text-[20px] text-ink">{service.name}</h3>
                      </div>
                      <p className="font-mono font-light text-[13px] text-inkwarm pl-5">{service.desc}</p>
                    </div>
                    <div className="flex gap-6 pl-5 lg:pl-0">
                      <div className="text-right">
                        <p className="font-mono text-[10px] text-inkfaint uppercase tracking-[0.1em] mb-1">Uptime</p>
                        <p className="font-mono text-[14px] text-ink">{service.uptime}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-[10px] text-inkfaint uppercase tracking-[0.1em] mb-1">Latency</p>
                        <p className="font-mono text-[14px] text-ink">{service.latency}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-[10px] text-inkfaint uppercase tracking-[0.1em] mb-1">Status</p>
                        <p className="font-mono text-[12px] text-[#1A6B3A] uppercase tracking-[0.08em] font-medium">
                          {service.status}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Uptime Bar ── */}
        <section className="w-full flex justify-center border-t border-ink/[.13]" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
          <div className="w-full" style={{ maxWidth: '1200px', paddingLeft: '48px', paddingRight: '48px' }}>
            <motion.p
              variants={fadeUp} custom={0} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="font-mono text-[11px] text-inkfaint uppercase tracking-[0.14em] mb-4"
            >
              90-DAY UPTIME
            </motion.p>
            <motion.h2
              variants={fadeUp} custom={1} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="font-serif text-[40px] leading-[1.1] tracking-[-0.01em] text-ink mb-8"
            >
              Historical Performance
            </motion.h2>
            <motion.div
              variants={fadeUp} custom={2} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="flex gap-[2px] h-10 mb-4"
            >
              {Array.from({ length: 90 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-[#1A6B3A] hover:bg-[#22854A] transition-colors cursor-pointer"
                  title={`Day ${90 - i}: 100% uptime`}
                  style={{ opacity: 0.6 + Math.random() * 0.4 }}
                />
              ))}
            </motion.div>
            <div className="flex justify-between font-mono text-[11px] text-inkfaint">
              <span>90 days ago</span>
              <span>Today</span>
            </div>
          </div>
        </section>

        {/* ── Incident History ── */}
        <section className="w-full flex justify-center border-t border-ink/[.13]" style={{ paddingTop: '80px', paddingBottom: '100px' }}>
          <div className="w-full" style={{ maxWidth: '1200px', paddingLeft: '48px', paddingRight: '48px' }}>
            <motion.p
              variants={fadeUp} custom={0} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="font-mono text-[11px] text-inkfaint uppercase tracking-[0.14em] mb-4"
            >
              INCIDENT HISTORY
            </motion.p>
            <motion.h2
              variants={fadeUp} custom={1} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="font-serif text-[40px] leading-[1.1] tracking-[-0.01em] text-ink mb-8"
            >
              Recent Incidents
            </motion.h2>

            {incidents.length === 0 ? (
              <motion.div
                variants={fadeUp} custom={2} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="border border-ink/[.08] p-10 text-center"
              >
                <p className="font-mono text-[14px] text-inkwarm mb-2">No incidents reported</p>
                <p className="font-mono font-light text-[13px] text-inkfaint">All systems have been operating normally for the past 90 days.</p>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-0">
                {incidents.map((incident, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp} custom={i + 2} initial="hidden" whileInView="show" viewport={{ once: true }}
                    className="border-t border-ink/[.13] py-6"
                  >
                    <div className="flex items-baseline gap-4 mb-2">
                      <span className="font-mono text-[12px] text-inkfaint">{incident.date}</span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.1em] px-2 py-0.5 bg-ink/[.06]">{incident.status}</span>
                    </div>
                    <h3 className="font-serif text-[18px] text-ink mb-2">{incident.title}</h3>
                    <p className="font-mono font-light text-[13px] text-inkwarm">{incident.desc}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}

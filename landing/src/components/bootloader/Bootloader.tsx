'use client'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'

const diagnosticLines = [
  { label: 'Initializing claim extraction engine', status: 'OK' },
  { label: 'Loading Gemini 2.5 Flash interface', status: 'OK' },
  { label: 'Connecting to source aggregation layer', status: 'OK' },
  { label: 'DuckDuckGo search connector', status: 'ONLINE' },
  { label: 'Redis cache layer', status: 'ACTIVE' },
  { label: 'SQLAlchemy audit pipeline', status: 'READY' },
  { label: 'JWT authentication module', status: 'OK' },
  { label: 'Consensus scoring engine', status: 'LOADED' },
  { label: 'API gateway warming up', status: 'OK' },
  { label: 'Truth Score classifier', status: 'READY' },
]

const marqueeMessages = [
  'VERIFICATION ENGINE LOADING',
  'CONSENSUS LAYER INITIALIZING',
  'SOURCE AGGREGATION PRIMING',
  'TRUTH SCORE CALIBRATING',
  'API GATEWAY WARMING',
  'SYSTEM CHECK IN PROGRESS',
]

type Phase = 'init' | 'diagnostics' | 'calibrating' | 'ready' | 'exiting'

function statusColor(status: string) {
  if (['ERROR', 'FAIL'].includes(status)) return '#C1121F'
  return '#1A6B3A'
}

function LiveClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => setTime(new Date().toISOString().replace('T', '  ').slice(0, 21) + ' UTC')
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return <span>{time}</span>
}

function MarqueeStatus() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % marqueeMessages.length), 800)
    return () => clearInterval(id)
  }, [])
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={idx}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: '#5A5650', letterSpacing: '0.08em' }}
      >
        {marqueeMessages[idx]}
      </motion.span>
    </AnimatePresence>
  )
}

function ProgressCounter({ active }: { active: boolean }) {
  const count = useMotionValue(0)
  const display = useTransform(count, (v) => `${Math.round(v)}%`)
  useEffect(() => {
    if (!active) return
    const controls = animate(count, 100, { duration: 0.8, ease: 'easeOut' })
    return controls.stop
  }, [active, count])
  return <motion.span>{display}</motion.span>
}

export default function Bootloader({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('init')
  const [visibleLines, setVisibleLines] = useState(0)

  const handleSkip = useCallback(() => {
    setPhase('exiting')
    setTimeout(onComplete, 600)
  }, [onComplete])

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('diagnostics'), 800)
    const lineTimers = Array.from({ length: 10 }, (_, i) =>
      setTimeout(() => setVisibleLines(i + 1), 800 + i * 160)
    )
    const t2 = setTimeout(() => setPhase('calibrating'), 2400)
    const t3 = setTimeout(() => setPhase('ready'), 3400)
    const t4 = setTimeout(() => {
      setPhase('exiting')
      setTimeout(onComplete, 600)
    }, 4200)
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4)
      lineTimers.forEach(clearTimeout)
    }
  }, [onComplete])

  return (
    <motion.div
      key="bootloader"
      exit={{ opacity: 0, scale: 1.015 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#080808',
        fontFamily: "'IBM Plex Mono', monospace",
        display: 'flex', flexDirection: 'column',
        willChange: 'opacity, transform',
      }}
    >
      {/* Scanline */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: '1px',
        background: 'rgba(238,232,213,0.03)', pointerEvents: 'none',
        animation: 'scanline 8s linear infinite',
      }} />

      {/* ── TOP BAR ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid #2A2A28',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
          <span style={{ fontSize: '15px', fontWeight: 400, color: '#EEE8D5' }}>CREDIFY</span>
          <span style={{ fontSize: '11px', fontWeight: 300, color: '#5A5650', letterSpacing: '0.12em' }}>TLP v1.0.0</span>
        </div>
        <div style={{ fontSize: '11px', fontWeight: 300, color: '#5A5650' }}>
          <LiveClock />
        </div>
      </div>

      {/* ── CENTER PANEL ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{
          position: 'relative', maxWidth: '560px', width: '100%',
          border: '1px solid #2A2A28', padding: '40px 48px',
        }}>
          {/* Corner brackets */}
          {/* Top-left */}
          <div style={{ position: 'absolute', top: -1, left: -1, width: '20px', height: '1px', background: '#EEE8D5' }} />
          <div style={{ position: 'absolute', top: -1, left: -1, width: '1px', height: '20px', background: '#EEE8D5' }} />
          {/* Top-right */}
          <div style={{ position: 'absolute', top: -1, right: -1, width: '20px', height: '1px', background: '#EEE8D5' }} />
          <div style={{ position: 'absolute', top: -1, right: -1, width: '1px', height: '20px', background: '#EEE8D5' }} />
          {/* Bottom-left */}
          <div style={{ position: 'absolute', bottom: -1, left: -1, width: '20px', height: '1px', background: '#EEE8D5' }} />
          <div style={{ position: 'absolute', bottom: -1, left: -1, width: '1px', height: '20px', background: '#EEE8D5' }} />
          {/* Bottom-right */}
          <div style={{ position: 'absolute', bottom: -1, right: -1, width: '20px', height: '1px', background: '#EEE8D5' }} />
          <div style={{ position: 'absolute', bottom: -1, right: -1, width: '1px', height: '20px', background: '#EEE8D5' }} />

          {/* Skip button */}
          {phase !== 'init' && phase !== 'exiting' && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0 }}
              onClick={handleSkip}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#EEE8D5' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#3A3835' }}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'transparent', border: 'none',
                color: '#3A3835', fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px', cursor: 'pointer', letterSpacing: '0.08em',
              }}
            >
              Skip →
            </motion.button>
          )}

          {/* PHASE 1: Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: phase === 'init' ? '0' : '24px' }}
          >
            <div style={{
              fontFamily: "'Playfair Display', 'DM Serif Display', Georgia, serif",
              fontSize: '52px', color: '#EEE8D5', lineHeight: 1.1,
            }}>
              CREDIFY
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              style={{
                fontSize: '11px', fontWeight: 500, color: '#5A5650',
                letterSpacing: '0.16em', marginTop: '8px',
              }}
            >
              TRUST LAYER PROTOCOL
            </motion.div>
          </motion.div>

          {/* PHASE 2: Diagnostics */}
          <AnimatePresence>
            {(phase === 'diagnostics' || phase === 'calibrating') && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Divider line */}
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                  style={{ height: '1px', background: '#2A2A28', margin: '16px 0' }}
                />

                {/* Lines */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {diagnosticLines.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: i < visibleLines ? 1 : 0 }}
                      transition={{ duration: 0.1 }}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      <span style={{ color: '#5A5650', fontSize: '12px', fontWeight: 300, flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {line.label}
                      </span>
                      <span style={{
                        color: statusColor(line.status),
                        fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em',
                        marginLeft: '12px', flexShrink: 0,
                      }}>
                        {line.status}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Blinking cursor */}
                <div style={{
                  width: '10px', height: '14px', background: '#EEE8D5',
                  marginTop: '12px',
                  animation: 'blink 1.2s step-end infinite',
                }} />

                {/* PHASE 3: Calibration */}
                {phase === 'calibrating' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ marginTop: '16px' }}
                  >
                    <div style={{ height: '1px', background: '#2A2A28', marginBottom: '16px' }} />
                    <div style={{
                      fontSize: '11px', fontWeight: 500, color: '#5A5650',
                      letterSpacing: '0.12em', marginBottom: '12px',
                    }}>
                      CALIBRATING TRUTH SCORE ENGINE
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        flex: 1, height: '3px', background: '#1A1A18',
                        border: '1px solid #2A2A28', overflow: 'hidden',
                      }}>
                        <motion.div
                          style={{ height: '100%', background: '#C1121F' }}
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 500, color: '#EEE8D5', minWidth: '36px', textAlign: 'right' }}>
                        <ProgressCounter active={phase === 'calibrating'} />
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* PHASE 4: System Online */}
          {phase === 'ready' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', marginTop: '24px',
              }}
            >
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: '#1A6B3A',
                animation: 'pulse 1s ease-in-out infinite',
              }} />
              <span style={{
                fontSize: '13px', fontWeight: 500, color: '#1A6B3A',
                letterSpacing: '0.2em',
              }}>
                SYSTEM ONLINE
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── BOTTOM STATUS BAR ── */}
      <div style={{
        height: '36px',
        borderTop: '1px solid #2A2A28',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        <span style={{ fontSize: '11px', fontWeight: 400, color: '#5A5650' }}>
          <span style={{ color: '#C1121F' }}>◈</span> CREDIFY TLP
        </span>
        <div style={{ textAlign: 'center' }}>
          <MarqueeStatus />
        </div>
        <span style={{ fontSize: '11px', fontWeight: 300, color: '#3A3835' }}>
          BUILD 2025.05.01
        </span>
      </div>
    </motion.div>
  )
}

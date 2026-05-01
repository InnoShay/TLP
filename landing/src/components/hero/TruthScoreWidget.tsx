'use client'
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

const CLAIMS = [
  {
    text: 'NASA confirmed the discovery of liquid water on Mars in 2024.',
    sources: ['nasa.gov', 'reuters.com', 'science.org'],
    score: 0.91,
    classification: 'VERIFIED',
    color: 'verified',
    colorClass: 'text-verified',
    borderClass: 'border-verified',
    reasoning: 'Multiple space agencies and peer-reviewed journals confirm this finding.',
  },
  {
    text: 'The Eiffel Tower is the tallest structure in Europe.',
    sources: ['britannica.com', 'bbc.com', 'theguardian.com'],
    score: 0.23,
    classification: 'FALSE',
    color: 'red',
    colorClass: 'text-red',
    borderClass: 'border-red',
    reasoning: 'The Burj Khalifa and several European towers surpass the Eiffel Tower.',
  },
  {
    text: 'Electric vehicles produce zero lifetime carbon emissions.',
    sources: ['nature.com', 'iea.org', 'carbonbrief.org'],
    score: 0.54,
    classification: 'UNCERTAIN',
    color: 'uncertain',
    colorClass: 'text-uncertain',
    borderClass: 'border-uncertain',
    reasoning: 'Manufacturing and electricity source significantly affect lifetime emissions.',
  },
]

type Phase = 'showing' | 'sources' | 'scoring' | 'complete' | 'reasoning' | 'exiting' | 'idle'

export default function TruthScoreWidget() {
  const [claimIndex, setClaimIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const claim = CLAIMS[claimIndex]

  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => v.toFixed(2))

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = []

    const runCycle = () => {
      setPhase('showing')
      count.set(0)

      timeouts.push(setTimeout(() => setPhase('sources'), 400))
      timeouts.push(setTimeout(() => setPhase('scoring'), 1400))
      timeouts.push(setTimeout(() => setPhase('complete'), 2300))
      timeouts.push(setTimeout(() => setPhase('reasoning'), 2800))
      timeouts.push(setTimeout(() => setPhase('exiting'), 5500))

      timeouts.push(setTimeout(() => {
        setClaimIndex((prev) => (prev + 1) % CLAIMS.length)
        runCycle()
      }, 5900))
    }

    runCycle()

    return () => timeouts.forEach(clearTimeout)
  }, [count])

  useEffect(() => {
    if (phase === 'scoring') {
      const controls = animate(count, claim.score, {
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1],
      })
      return controls.stop
    }
  }, [phase, claim.score, count])

  const overlineText =
    phase === 'showing' || phase === 'sources' || phase === 'scoring'
      ? 'ANALYZING CLAIM'
      : 'VERIFICATION COMPLETE'

  return (
    <div className="w-full max-w-[420px] border border-ink/[.13] bg-surface p-7 mx-auto lg:mr-0 lg:ml-auto min-h-[340px] flex flex-col justify-between overflow-hidden relative">
      <AnimatePresence mode="wait">
        {phase !== 'exiting' && phase !== 'idle' && (
          <motion.div
            key={claimIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col h-full"
          >
            <p className="font-mono text-label text-inkfaint uppercase mb-4 tracking-[0.12em]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={overlineText}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {overlineText}
                </motion.span>
              </AnimatePresence>
            </p>

            <p className="font-mono font-light text-[14px] text-inkwarm leading-relaxed min-h-[60px]">
              {claim.text}
            </p>

            <div className="flex flex-wrap gap-2 mt-4 min-h-[30px]">
              <AnimatePresence>
                {(phase === 'sources' || phase === 'scoring' || phase === 'complete' || phase === 'reasoning') && claim.sources.map((source, i) => (
                  <motion.span
                    key={source}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                    className="border border-ink/[.13] px-2.5 py-1 font-mono text-label text-inkfaint bg-inset"
                  >
                    {source}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <motion.span style={{ color: '#C1121F' }} className={`font-mono font-semibold text-[56px] leading-[1] tracking-[-0.02em]`}>
                {rounded}
              </motion.span>

              <AnimatePresence>
                {(phase === 'complete' || phase === 'reasoning') && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      border: `1px solid ${claim.color === 'red' ? '#C1121F' : claim.color === 'verified' ? '#1A6B3A' : claim.color === 'uncertain' ? '#8B6914' : claim.color === 'likelytrue' ? '#2D7D46' : claim.color === 'likelyfalse' ? '#B5470A' : '#7A7468'}`,
                      color: `${claim.color === 'red' ? '#C1121F' : claim.color === 'verified' ? '#1A6B3A' : claim.color === 'uncertain' ? '#8B6914' : claim.color === 'likelytrue' ? '#2D7D46' : claim.color === 'likelyfalse' ? '#B5470A' : '#7A7468'}`,
                      background: 'transparent',
                      padding: '6px 14px',
                      fontFamily: 'var(--font-ibm-mono), monospace',
                      fontWeight: 500,
                      fontSize: '11px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      borderRadius: '3px',
                    }}
                  >
                    {claim.classification}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div className="min-h-[40px] mt-3">
              <AnimatePresence>
                {phase === 'reasoning' && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="font-mono font-light text-[12px] text-inkwarm leading-relaxed"
                  >
                    {claim.reasoning}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function SectionLabel({ children }: { children: string }) {
  return (
    <p 
      style={{ letterSpacing: '0.12em' }}
      className="font-mono font-medium text-[11px] leading-[1] text-inkfaint uppercase tracking-[0.12em]"
    >
      {children}
    </p>
  )
}

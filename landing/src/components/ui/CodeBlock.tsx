interface CodeBlockProps {
  children: React.ReactNode
  className?: string
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  return (
    <div className={`w-full rounded-xl overflow-hidden border border-[#2A2A28] shadow-2xl flex flex-col bg-mono ${className || ''}`} style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
      {/* Window Chrome */}
      <div className="h-10 bg-[#2D2D2D] flex items-center px-4 gap-2 shrink-0 border-b border-[#1A1A1A]">
        <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
        <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
        <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
      </div>
      <div className="p-5 font-mono text-[13px] leading-[1.6] overflow-x-auto w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
        {children}
      </div>
    </div>
  )
}

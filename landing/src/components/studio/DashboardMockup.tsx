export default function DashboardMockup() {
  return (
    <>
      {/* Desktop Dashboard Mockup */}
      <div className="hidden lg:flex flex-col w-full border border-[#2A2A28] overflow-hidden rounded-xl bg-[#080808] shadow-2xl" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        {/* Window Chrome */}
        <div className="h-10 bg-[#2D2D2D] flex items-center px-4 gap-2 shrink-0 border-b border-[#1A1A1A]">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
        </div>

        {/* Mockup Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar */}
          <div className="w-[176px] bg-[#111110] border-r border-monoborder shrink-0 flex flex-col">
            <div className="font-serif text-[15px] text-[#EEE8D5] p-5 tracking-tight">
              CREDIFY
            </div>
            <div className="flex flex-col">
              <div className="h-9 px-4 flex items-center font-mono text-[12px]" style={{ color: '#5A5650' }}>Dashboard</div>
              <div className="h-9 px-4 flex items-center font-mono text-[12px]" style={{ color: '#5A5650' }}>API Keys</div>
              <div className="h-9 px-4 flex items-center font-mono text-[12px]" style={{ color: '#5A5650' }}>Logs</div>
              <div className="h-9 px-4 flex items-center font-mono text-[12px] bg-[#1E1E1C] border-l-2 border-[#C1121F]" style={{ color: '#EEE8D5' }}>Playground</div>
              <div className="h-9 px-4 flex items-center font-mono text-[12px]" style={{ color: '#5A5650' }}>Docs</div>
            </div>
          </div>

        {/* Main content */}
        <div className="flex-1 p-5 flex flex-col gap-3 overflow-hidden bg-[#080808]">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: '#5A5650' }}>PLAYGROUND</p>
          
          {/* Two-panel */}
          <div className="flex gap-3 flex-1 overflow-hidden">
            {/* Input panel */}
            <div className="w-[48%] bg-[#111110] border border-monoborder p-3 flex flex-col gap-3" style={{ backgroundColor: '#111110' }}>
              <p className="font-mono text-[11px] font-light leading-relaxed" style={{ color: '#C8C0B0' }}>
                NASA confirmed the discovery of liquid water on Mars in 2024, corroborating decades of geological analysis from orbital probes.
              </p>
              <div className="font-mono font-medium text-[11px] px-4 py-2 mt-auto self-start" style={{ backgroundColor: '#C1121F', color: '#F5F0E8' }}>
                VERIFY CLAIM
              </div>
            </div>

            {/* Result panel */}
            <div className="flex-1 bg-[#111110] border border-monoborder p-3 flex flex-col">
              <div className="flex items-end justify-between mb-2">
                <span className="font-mono font-semibold text-[36px] leading-[1]" style={{ color: '#C1121F', fontWeight: 600 }}>0.89</span>
                <span className="font-mono text-[10px] px-2 py-1 uppercase tracking-[0.1em]" style={{ border: '1px solid #1A6B3A', color: '#1A6B3A', borderRadius: '3px' }}>VERIFIED</span>
              </div>
              <div className="border-t border-monoborder my-2" />
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px]" style={{ color: '#EEE8D5' }}>nature.com</span>
                  <span className="font-mono text-[9px] tracking-[0.08em]" style={{ color: '#1A6B3A' }}>SUPPORTS</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px]" style={{ color: '#EEE8D5' }}>nasa.gov</span>
                  <span className="font-mono text-[9px] tracking-[0.08em]" style={{ color: '#1A6B3A' }}>SUPPORTS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Log strip */}
          <div className="border-t border-monoborder pt-3 shrink-0">
            <div className="grid grid-cols-[80px_1fr_50px_80px] gap-2 font-mono text-[10px] text-monofaint uppercase tracking-[0.08em] mb-2 px-2">
              <span>Time</span><span>Claim</span><span>Score</span><span>Status</span>
            </div>
            <div className="flex flex-col gap-1.5 px-2">
              <div className="grid grid-cols-[80px_1fr_50px_80px] gap-2 font-mono text-[10px] text-[#8A8680]">
                <span>14:02:11</span><span className="truncate">NASA confirmed the discovery...</span><span className="text-verified">0.89</span><span>VERIFIED</span>
              </div>
              <div className="grid grid-cols-[80px_1fr_50px_80px] gap-2 font-mono text-[10px] text-[#8A8680]">
                <span>13:45:09</span><span className="truncate">The Eiffel Tower is the tall...</span><span className="text-red">0.23</span><span>FALSE</span>
              </div>
              <div className="grid grid-cols-[80px_1fr_50px_80px] gap-2 font-mono text-[10px] text-[#8A8680]">
                <span>13:21:55</span><span className="truncate">Electric vehicles produce ze...</span><span className="text-uncertain">0.54</span><span>UNCERTAIN</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Mobile static score card */}
      <div className="lg:hidden border border-ink/[.13] bg-surface p-6">
        <p className="font-mono text-[11px] leading-[1] text-inkfaint uppercase mb-4 tracking-[0.12em]">SAMPLE RESULT</p>
        <p className="font-mono font-semibold text-[48px] text-red leading-none tracking-[-0.01em]">0.91</p>
        <p className="font-serif text-[20px] text-verified mt-2">Verified</p>
        <p className="font-mono font-light text-[13px] text-inkwarm mt-3 leading-relaxed">
          Strong multi-source consensus detected across independent sources.
        </p>
      </div>
    </>
  )
}

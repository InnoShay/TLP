export default function Footer() {
  return (
    <footer className="border-t border-ink/[.13] bg-paper py-16 w-full flex justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 w-full" style={{ maxWidth: '1200px', paddingLeft: '48px', paddingRight: '48px' }}>
        {/* Brand */}
        <div>
          <a href="/" className="font-serif text-[24px] text-ink tracking-tight">CREDIFY</a>
          <p className="font-mono font-light text-[13px] text-inkwarm mt-2">Built to defend truth.</p>
          <p className="font-mono text-[12px] text-inkfaint mt-1">© 2025 Credify. Trust Layer Protocol.</p>
        </div>

        {/* Product */}
        <div>
          <p className="font-mono text-[11px] text-inkfaint uppercase tracking-[0.12em] mb-4">Product</p>
          <div className="flex flex-col gap-2.5">
            <a href="/platform/index.html" className="font-mono text-[13px] text-inkwarm hover:text-ink transition-colors duration-200">Studio</a>
            <a href="/extension" className="font-mono text-[13px] text-inkwarm hover:text-ink transition-colors duration-200">Extension</a>
            <a href="/docs" className="font-mono text-[13px] text-inkwarm hover:text-ink transition-colors duration-200">API Reference</a>
          </div>
        </div>

        {/* Resources */}
        <div>
          <p className="font-mono text-[11px] text-inkfaint uppercase tracking-[0.12em] mb-4">Resources</p>
          <div className="flex flex-col gap-2.5">
            <a href="/docs" className="font-mono text-[13px] text-inkwarm hover:text-ink transition-colors duration-200">Documentation</a>
            <a href="https://github.com/InnoShay" target="_blank" rel="noopener noreferrer" className="font-mono text-[13px] text-inkwarm hover:text-ink transition-colors duration-200">GitHub</a>
            <a href="/status" className="font-mono text-[13px] text-inkwarm hover:text-ink transition-colors duration-200">Status</a>
          </div>
        </div>

        {/* Status */}
        <div className="lg:text-right">
          <a href="/status" className="inline-flex items-center lg:justify-end gap-2 font-mono font-medium text-[11px] uppercase tracking-[0.12em] text-[#1A6B3A] hover:opacity-80 transition-opacity">
            <span className="w-2 h-2 rounded-full bg-[#1A6B3A] animate-pulse inline-block" />
            SYSTEMS OPERATIONAL
          </a>
          <p className="font-mono text-[12px] text-inkfaint mt-2">TLP v1.0.0</p>
        </div>
      </div>
    </footer>
  )
}

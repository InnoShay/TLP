interface BentoCardProps {
  step?: string
  title: string
  body: string
  icon: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function BentoCard({ step, title, body, icon, children, className = '' }: BentoCardProps) {
  return (
    <div className={`border border-ink/[.13] bg-surface p-[32px] flex flex-col gap-4 hover:border-ink/[.33] transition-colors duration-200 ${className}`}>
      <div className="flex items-start justify-between">
        {step && (
          <span className="font-mono text-[11px] leading-[1] text-inkfaint uppercase tracking-[0.12em]">
            {step}
          </span>
        )}
        <div className="text-ink ml-auto">
          {icon}
        </div>
      </div>
      
      <div>
        <h3 className="font-serif text-[22px] text-ink mb-2">{title}</h3>
        <p className="font-mono font-light text-[13px] leading-[1.6] text-inkwarm">
          {body}
        </p>
      </div>

      {children && (
        <div className="mt-auto pt-4">
          {children}
        </div>
      )}
    </div>
  )
}

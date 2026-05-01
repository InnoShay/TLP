export default function InstallSteps() {
  const steps = [
    {
      num: '01',
      title: 'Download & Unzip',
      body: 'Download the extension package and unzip to a permanent location.'
    },
    {
      num: '02',
      title: 'Enable Developer Mode',
      body: 'Open Chrome, go to chrome://extensions, toggle on.'
    },
    {
      num: '03',
      title: 'Load Unpacked',
      body: 'Click "Load Unpacked" and select the Credify extension folder.'
    },
    {
      num: '04',
      title: 'Add Your API Key',
      body: 'Click the toolbar icon. Paste your Studio API key and save.'
    },
    {
      num: '05',
      title: 'Start Verifying',
      body: 'Highlight any text on any page. The Truth Score appears instantly.'
    }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-0 mt-16">
      {steps.map((step, i) => (
        <div
          key={step.num}
          style={{
            borderTop: '2px solid #0E0E0E',
            paddingTop: '16px',
            paddingRight: i !== steps.length - 1 ? '32px' : '0',
            borderRight: i !== steps.length - 1 ? '1px solid rgba(14,14,14,0.13)' : 'none',
            paddingLeft: i !== 0 ? '32px' : '0'
          }}
          className={`flex flex-col`}
        >
          <span className="font-mono text-[11px] leading-[1] text-inkfaint uppercase tracking-[0.12em]">
            {step.num}
          </span>
          <h3 className="font-serif text-[17px] text-ink mt-3">
            {step.title}
          </h3>
          <p className="font-mono font-light text-[13px] text-inkwarm leading-[1.6] mt-2">
            {step.body}
          </p>
        </div>
      ))}
    </div>
  )
}

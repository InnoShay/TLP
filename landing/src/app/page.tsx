import Nav from '@/components/nav/Nav'
import Hero from '@/components/hero/Hero'
import Protocol from '@/components/protocol/Protocol'
import Studio from '@/components/studio/Studio'
import Extension from '@/components/extension/Extension'
import Classifications from '@/components/classifications/Classifications'
import ApiSection from '@/components/api/ApiSection'
import UseCases from '@/components/usecases/UseCases'
import Footer from '@/components/footer/Footer'

export default function Home() {
  return (
    <>
      <Nav />
      <main className="w-full flex flex-col items-center overflow-x-hidden">
        <section id="home" className="min-h-screen flex items-center w-full justify-center">
          <div className="w-full" style={{ maxWidth: '1200px', paddingLeft: '48px', paddingRight: '48px' }}>
            <Hero />
          </div>
        </section>
        
        <section id="protocol" className="w-full flex justify-center border-t border-ink/[.13]" style={{ paddingTop: '120px', paddingBottom: '120px' }}>
          <div className="w-full" style={{ maxWidth: '1200px', paddingLeft: '48px', paddingRight: '48px' }}>
            <Protocol />
          </div>
        </section>
        
        <section id="studio" className="w-full flex justify-center border-t border-ink/[.13]" style={{ paddingTop: '120px', paddingBottom: '120px' }}>
          <div className="w-full" style={{ maxWidth: '1200px', paddingLeft: '48px', paddingRight: '48px' }}>
            <Studio />
          </div>
        </section>
        
        <section id="extension" className="w-full flex justify-center border-t border-ink/[.13]" style={{ paddingTop: '120px', paddingBottom: '120px' }}>
          <div className="w-full" style={{ maxWidth: '1200px', paddingLeft: '48px', paddingRight: '48px' }}>
            <Extension />
          </div>
        </section>
        
        <section id="docs" className="w-full flex justify-center border-t border-ink/[.13]" style={{ paddingTop: '120px', paddingBottom: '120px' }}>
          <div className="w-full" style={{ maxWidth: '1200px', paddingLeft: '48px', paddingRight: '48px' }}>
            <Classifications />
          </div>
        </section>
        
        <section id="api" className="w-full flex justify-center border-t border-ink/[.13]" style={{ paddingTop: '120px', paddingBottom: '120px' }}>
          <div className="w-full" style={{ maxWidth: '1200px', paddingLeft: '48px', paddingRight: '48px' }}>
            <ApiSection />
          </div>
        </section>
        
        <section id="usecases" className="w-full flex justify-center border-t border-ink/[.13]" style={{ paddingTop: '120px', paddingBottom: '120px' }}>
          <div className="w-full" style={{ maxWidth: '1200px', paddingLeft: '48px', paddingRight: '48px' }}>
            <UseCases />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

import { termsSections } from '../data/dummyData'

const TermsPage = () => (
  <div className="mx-auto max-w-4xl">
    <div className="glass max-h-[75vh] overflow-y-auto rounded-2xl p-6">
      <h1 className="text-3xl font-semibold text-white">Terms & Conditions</h1>
      <p className="mt-2 text-slate-300">Please read this document carefully before using EventPass Pro.</p>
      <div className="mt-6 space-y-6">
        {termsSections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold text-white">{section.title}</h2>
            <p className="mt-2 leading-relaxed text-slate-300">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  </div>
)

export default TermsPage


const EmptyState = ({ title, message }) => (
  <div className="glass rounded-2xl p-8 text-center">
    <h3 className="text-xl font-semibold text-white">{title}</h3>
    <p className="mt-2 text-slate-300">{message}</p>
  </div>
)

export default EmptyState


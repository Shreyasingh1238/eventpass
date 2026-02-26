import { motion } from 'framer-motion'

const SuccessCheck = ({ text = 'Success' }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-2 rounded-lg bg-emerald-900/40 p-2 text-sm text-emerald-200"
  >
    <motion.svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-emerald-300">
      <motion.path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
      />
    </motion.svg>
    <span>{text}</span>
  </motion.div>
)

export default SuccessCheck


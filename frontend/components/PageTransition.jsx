import { motion } from 'framer-motion'

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 16, scale: 0.995 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10, scale: 0.995 }}
    transition={{ duration: 0.32, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
)

export default PageTransition

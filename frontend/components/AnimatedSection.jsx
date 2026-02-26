import { motion } from 'framer-motion'

const AnimatedSection = ({ id, className = '', children }) => (
  <motion.section
    id={id}
    className={className}
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.5 }}
  >
    {children}
  </motion.section>
)

export default AnimatedSection


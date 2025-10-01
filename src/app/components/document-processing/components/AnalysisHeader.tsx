import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'

export const AnalysisHeader = () => {
  return (
    <motion.div
      className="flex items-center"
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <motion.div
        className="relative"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"
          animate={{
            rotate: [0, 1, -1, 0],
            scale: [1, 1.01, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatDelay: 5
          }}
        >
          <FileText className="w-5 h-5 text-white" />
        </motion.div>
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatDelay: 2
          }}
        />
      </motion.div>
    </motion.div>
  )
}


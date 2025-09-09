"use client";
import { motion, AnimatePresence } from "framer-motion";

export default function StartOverlay({ show }: { show: boolean }) {
  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="bg-black/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-purple-500/50"
            >
              <h2 className="text-3xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                Neon Runner
              </h2>
              <p className="text-gray-300 mb-6">Pressione ESPAÇO para começar!</p>
              <div className="text-sm text-gray-400">
                <p>⬆️ ESPAÇO ou SETA CIMA: Pular</p>
                <p>⬇️ SETA BAIXO: Abaixar</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

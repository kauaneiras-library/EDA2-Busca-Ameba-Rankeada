"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
  show: boolean;
  defaultName: string;
  onCancel: () => void;
  onConfirm: (name: string) => void;
}

export default function PlayerModal({ show, defaultName, onCancel, onConfirm }: Props) {
  const [value, setValue] = useState(defaultName ?? "");

  useEffect(() => {
    setValue(defaultName ?? "");
  }, [defaultName]);

  function confirm() {
    const v = value.trim();
    if (!v) {
      alert('Por favor, insira um nome para continuar');
      return;
    }
    onConfirm(v);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            className="bg-black/90 border border-purple-500/50 rounded-2xl p-8 w-96 shadow-2xl"
          >
            <h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              Digite seu nome
            </h3>
            <input 
              id="playerNameInput" 
              type="text" 
              className="w-full px-4 py-3 bg-purple-900/50 text-white border border-purple-500/50 rounded-lg focus:border-cyan-400 focus:outline-none transition-colors text-lg"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Seu nome aqui..."
              autoFocus
            />
            <div className="flex gap-3 justify-end mt-6">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 text-gray-400 hover:text-white font-medium transition-colors"
                onClick={onCancel}
              >
                Cancelar
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-lg shadow-lg"
                onClick={confirm}
              >
                Confirmar
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

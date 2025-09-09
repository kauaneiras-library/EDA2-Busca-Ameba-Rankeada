"use client";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  show: boolean;
  distance: number;
  highScore: number;
  onRestart: () => void;
  onChangePlayer: () => void;
}

export default function GameOverOverlay({ show, distance, highScore, onRestart, onChangePlayer }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            className="bg-black/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-red-500/50 text-center"
          >
            <h3 className="text-3xl font-black mb-4 text-red-500">Game Over!</h3>
            <div className="text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              {distance}m
            </div>
            {distance === highScore && distance > 0 && (
              <p className="text-green-400 font-bold mb-4 text-xl animate-pulse">🎉 NOVO RECORDE GLOBAL! 🎉</p>
            )}
            {distance > highScore * 0.9 && distance < highScore && (
              <p className="text-yellow-400 font-bold mb-4">Quase! Faltou {highScore - distance}m para o recorde 🔥</p>
            )}
            <div className="flex gap-4 justify-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg"
                onClick={onRestart}
              >
                🔄 Jogar Novamente
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg"
                onClick={onChangePlayer}
              >
                👤 Trocar Jogador
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

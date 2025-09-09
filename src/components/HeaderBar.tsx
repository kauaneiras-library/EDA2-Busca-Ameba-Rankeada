"use client";
import { motion } from "framer-motion";

interface HeaderBarProps {
  playerName: string | null;
  distance: number;
  highScore: number;
  onStart: () => void;
  onChangePlayer: () => void;
}

export default function HeaderBar({ playerName, distance, highScore, onStart, onChangePlayer }: HeaderBarProps) {
  const speed = Math.min(6 + Math.floor(distance / 300), 12) * 10;
  return (
    <div className="mb-6 bg-black/40 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-purple-500/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-xs text-purple-300 uppercase tracking-wider">Jogador</span>
            <span className="text-xl font-bold text-white">
              {playerName || 'Convidado'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-purple-300 uppercase tracking-wider">Distância</span>
            <span className="text-3xl font-black text-cyan-400">
              {distance}m
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-purple-300 uppercase tracking-wider">Recorde Global</span>
            <span className="text-xl font-bold text-yellow-400">
              🏆 {highScore}m
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-purple-300 uppercase tracking-wider">Velocidade</span>
            <span className="text-lg font-bold text-green-400">
              {speed} km/h
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/50 transition-all" 
            onClick={onStart}
          >
            🎮 Jogar
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-3 bg-purple-600/50 backdrop-blur rounded-xl shadow-md hover:bg-purple-600/70 transition-all font-medium text-white" 
            onClick={onChangePlayer}
          >
            👤 Trocar
          </motion.button>
        </div>
      </div>
    </div>
  );
}

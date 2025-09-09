"use client";
import { motion } from "framer-motion";
import type { GameRecord } from "@/types";

export default function RankingOverlay({ rankingList }: { rankingList: GameRecord[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute right-4 top-4 bg-black/80 backdrop-blur-md p-4 rounded-xl shadow-xl border border-purple-500/30"
      style={{ width: 250 }}
    >
      <div className="font-bold text-lg mb-3 text-cyan-400">
        🏆 Top Ranking
      </div>
      {rankingList.length === 0 ? (
        <div className="text-gray-400 text-sm">Nenhuma partida ainda</div>
      ) : (
        rankingList.slice(0, 5).map((r, i) => (
          <div key={r.id} className="flex justify-between items-center py-1 text-white">
            <div className="flex items-center gap-2">
              <span className={`font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-gray-400'}`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
              </span>
              <span className="text-sm font-medium">{r.playerName}</span>
            </div>
            <span className="font-mono font-bold text-cyan-400">{r.distance}m</span>
          </div>
        ))
      )}
    </motion.div>
  );
}

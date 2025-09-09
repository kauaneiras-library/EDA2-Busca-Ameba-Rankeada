"use client";
import { motion } from "framer-motion";
import type { GameRecord } from "@/types";

interface Props {
  records: GameRecord[];
  searchResults: GameRecord[] | null;
  searchType: 'date' | 'player' | null;
  searchDay: string;
  searchPlayer: string;
  setSearchDay: (v: string) => void;
  setSearchPlayer: (v: string) => void;
  doSearchByDate: () => void;
  doSearchByPlayer: () => void;
  clearSearch: () => void;
  profilesNames: string[];
  highScore: number;
}

export default function HistorySection({
  records,
  searchResults,
  searchType,
  searchDay,
  searchPlayer,
  setSearchDay,
  setSearchPlayer,
  doSearchByDate,
  doSearchByPlayer,
  clearSearch,
  profilesNames,
  highScore,
}: Props) {
  const list = (searchResults ?? records.slice().reverse());
  return (
    <div className="mt-6 bg-black/40 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-purple-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
          📜 Histórico de Partidas
        </h3>
        <div className="flex items-center gap-3">
          <select
            value={searchPlayer}
            onChange={(e) => setSearchPlayer(e.target.value)}
            className="px-4 py-2 bg-purple-900/50 text-white border border-purple-500/50 rounded-lg focus:border-purple-400 focus:outline-none"
          >
            <option value="">Todos os jogadores</option>
            {profilesNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg shadow-md"
            onClick={doSearchByPlayer}
          >
            👤 Filtrar
          </motion.button>
          <input 
            type="date" 
            value={searchDay} 
            onChange={(e) => setSearchDay(e.target.value)} 
            className="px-4 py-2 bg-purple-900/50 text-white border border-purple-500/50 rounded-lg focus:border-purple-400 focus:outline-none"
          />
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-cyan-600 text-white font-bold rounded-lg shadow-md"
            onClick={doSearchByDate}
          >
            📅 Buscar
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            onClick={clearSearch}
          >
            ✖️ Limpar
          </motion.button>
        </div>
      </div>

      {searchType && (
        <div className="mb-3 text-sm text-cyan-400">
          {searchType === 'date' 
            ? `Mostrando resultados do dia ${new Date(searchDay + 'T00:00:00').toLocaleDateString('pt-BR')}`
            : `Mostrando partidas de: ${searchPlayer}`}
          {searchResults && ` (${searchResults.length} partida${searchResults.length !== 1 ? 's' : ''})`}
        </div>
      )}

      <div className="space-y-3 max-h-72 overflow-auto pr-2 custom-scrollbar">
        {list.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {searchResults !== null ? 'Nenhum resultado encontrado' : 'Nenhuma partida registrada ainda'}
          </div>
        ) : (
          list.map((r, index) => (
            <motion.div 
              key={r.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-purple-900/30 rounded-xl flex justify-between items-center hover:bg-purple-900/50 transition-all border border-purple-500/20"
            >
              <div>
                <div className="font-bold text-lg text-cyan-400">{r.playerName}</div>
                <div className="text-sm text-gray-400">
                  {new Date(r.dateISO).toLocaleDateString('pt-BR')} às {new Date(r.dateISO).toLocaleTimeString('pt-BR')}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                  {r.distance}m
                </div>
                {r.distance === highScore && (
                  <span className="text-xs text-yellow-400 font-bold">RECORDE</span>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

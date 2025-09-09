"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import type { GameRecord } from "@/types";
import { uid, nowISO } from "@/utils";
import { HashTable } from "@/structures/hashTable";
import { ScoreBST } from "@/structures/scoreBST";
import { binarySearchByDay } from "@/search/binarySearchByDay";
import { searchByPlayer } from "@/search/searchByPlayer";
import HeaderBar from "@/components/HeaderBar";
import RankingOverlay from "@/components/RankingOverlay";
import StartOverlay from "@/components/StartOverlay";
import GameOverOverlay from "@/components/GameOverOverlay";
import HistorySection from "@/components/HistorySection";
import PlayerModal from "@/components/PlayerModal";

// -------------------- Component --------------------
export default function DinoGameEnhanced(): JSX.Element {
  // player
  const [playerName, setPlayerName] = useState<string | null>(() => {
    try { return localStorage.getItem("dino_player") || null; } catch (e) { return null; }
  });
  const [showPlayerModal, setShowPlayerModal] = useState(!playerName);

  // game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [distance, setDistance] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // refs for physics
  const dinoYRef = useRef(0);
  const vyRef = useRef(0);
  const distanceRef = useRef(0);
  const startTimeRef = useRef<number>(0);

  const [dinoY, setDinoY] = useState(0);
  const [isDucking, setIsDucking] = useState(false);

  // obstacles
  const obstaclesRef = useRef<{ id: string; x: number; w: number; h: number; type: 'cactus' | 'bird' }[]>([]);
  const [obstacles, setObstacles] = useState(obstaclesRef.current);
  const [clouds, setClouds] = useState<{ id: string; x: number; y: number }[]>([]);

  const gameAreaRef = useRef<HTMLDivElement | null>(null);
  const loopRef = useRef<number | null>(null);
  const obstacleTimerRef = useRef<number | null>(null);
  const cloudTimerRef = useRef<number | null>(null);

  // persistence & structures
  const [records, setRecords] = useState<GameRecord[]>(() => {
    try { 
      const raw = localStorage.getItem("dino_records"); 
      return raw ? JSON.parse(raw) : []; 
    } catch (e) { 
      return []; 
    }
  });
  
  const profiles = useRef(new HashTable());
  const bst = useRef(new ScoreBST());

  // Load profiles on mount
  useEffect(() => { 
    try { 
      const raw = localStorage.getItem("dino_profiles") || "{}"; 
      profiles.current.load(JSON.parse(raw)); 
    } catch (e) {} 
  }, []);

  // Rebuild BST and find max score when records change
  useEffect(() => {
    bst.current.clear();
    records.forEach(r => bst.current.insert(r.distance, r));
    
    // Use BST to find max record
    const maxRecord = bst.current.findMax();
    if (maxRecord) {
      setHighScore(maxRecord.distance);
    }
    
    try { 
      localStorage.setItem("dino_records", JSON.stringify(records)); 
    } catch (e) {}
  }, [records]);

  // Sync refs with state
  useEffect(() => { distanceRef.current = distance; }, [distance]);
  useEffect(() => { dinoYRef.current = dinoY; }, [dinoY]);

  // Cloud spawning
  useEffect(() => {
    const spawnCloud = () => {
      setClouds(prev => [...prev, {
        id: uid("cloud"),
        x: (gameAreaRef.current?.clientWidth ?? 1200) + 100,
        y: 20 + Math.random() * 100
      }]);
    };
    
    cloudTimerRef.current = window.setInterval(spawnCloud, 3000 + Math.random() * 2000);
    spawnCloud();
    
    return () => {
      if (cloudTimerRef.current) clearInterval(cloudTimerRef.current);
    };
  }, []);

  // Move clouds
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setClouds(prev => prev.map(c => ({ ...c, x: c.x - 1 })).filter(c => c.x > -100));
    }, 50);
    return () => clearInterval(moveInterval);
  }, []);

  // Main game loop
  useEffect(() => {
    if (!isPlaying) return;
    
    startTimeRef.current = Date.now();
    distanceRef.current = 0; // Reset distance ref
    
    // Spawn obstacles
    const spawnObstacle = () => {
      const types: Array<'cactus' | 'bird'> = ['cactus', 'cactus', 'cactus', 'bird'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const spawnX = (gameAreaRef.current?.clientWidth ?? 1200) + 50;
      let o;
      
      if (type === 'bird') {
        o = { 
          id: uid("o"), 
          x: spawnX, 
          w: 30, 
          h: 20, 
          type: type as 'bird'
        };
      } else {
        const sizes = [
          { w: 25, h: 40 },
          { w: 20, h: 45 },
          { w: 30, h: 35 },
        ];
        const size = sizes[Math.floor(Math.random() * sizes.length)];
        o = { 
          id: uid("o"), 
          x: spawnX, 
          w: size.w, 
          h: size.h, 
          type: type as 'cactus'
        };
      }
      
      obstaclesRef.current = [...obstaclesRef.current, o];
      setObstacles(obstaclesRef.current.slice());
    };
    
    const spawnInterval = 1800 + Math.random() * 1200;
    obstacleTimerRef.current = window.setInterval(spawnObstacle, spawnInterval);
    
    setTimeout(spawnObstacle, 1000);

    let last = performance.now();
    const groundOffset = 60;

    const tick = (now: number) => {
      const dt = Math.max(1, now - last);
      last = now;

      // Physics
      vyRef.current = vyRef.current - 1.0 * (dt / 16);
      dinoYRef.current = Math.max(0, dinoYRef.current + vyRef.current * (dt / 16));
      setDinoY(Math.round(dinoYRef.current));

      // Calculate distance
      const elapsedMs = Date.now() - startTimeRef.current;
      const newDistance = Math.floor(elapsedMs / 100);
      distanceRef.current = newDistance;
      setDistance(newDistance);

      // Move obstacles
      const baseSpeed = 6;
      const speedBonus = Math.floor(distanceRef.current / 300);
      const speed = Math.min(baseSpeed + speedBonus, 12);
      const nextObs = obstaclesRef.current.map(o => ({ ...o, x: o.x - speed })).filter(o => o.x + o.w > -50);
      obstaclesRef.current = nextObs;
      setObstacles(nextObs.slice());

      // Exact collision detection
      const gameH = gameAreaRef.current?.clientHeight ?? 400;
      const dinoHeight = isDucking ? 25 : 40;
      const dinoWidth = 35;
      
      // Player exact hitbox
      const player = { 
        x: 100,
        y: gameH - groundOffset - dinoHeight - dinoYRef.current,
        w: dinoWidth,
        h: dinoHeight
      };
      
      const collided = obstaclesRef.current.some(o => {
        let obs;
        if (o.type === 'bird') {
          obs = {
            x: o.x,
            y: gameH - groundOffset - 100, // Birds fly at fixed height
            w: o.w,
            h: o.h
          };
        } else {
          obs = {
            x: o.x,
            y: gameH - groundOffset - o.h,
            w: o.w,
            h: o.h
          };
        }
        
        // Exact rectangular collision
        return !(player.x + player.w <= obs.x || 
                 obs.x + obs.w <= player.x || 
                 player.y + player.h <= obs.y || 
                 obs.y + obs.h <= player.y);
      });

      if (collided) { 
        endGame(); 
        return; 
      }

      loopRef.current = requestAnimationFrame(tick);
    };

    loopRef.current = requestAnimationFrame(tick);

    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
      if (obstacleTimerRef.current) clearInterval(obstacleTimerRef.current);
    };
  }, [isPlaying, isDucking]);

  function startGame() {
    if (!playerName) { 
      setShowPlayerModal(true); 
      return; 
    }
    setIsGameOver(false);
    setIsPlaying(true);
    setDistance(0);
    distanceRef.current = 0;
    obstaclesRef.current = [];
    setObstacles([]);
    dinoYRef.current = 0; 
    setDinoY(0);
    vyRef.current = 0;
    startTimeRef.current = Date.now();
  }

  function handleJump() {
    if (!isPlaying) return;
    if (dinoYRef.current <= 2) { 
      vyRef.current = 15;
    }
  }

  function endGame() {
    setIsGameOver(true);
    setIsPlaying(false);
    
    // Capture final distance
    const finalDistance = distanceRef.current;
    
    // Create record
    const rec: GameRecord = { 
      id: uid("r"), 
      playerName: playerName || "Convidado", 
      dateISO: nowISO(), 
      distance: finalDistance
    };
    
    // Add record and update BST
    setRecords(prev => {
      const next = [...prev, rec].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
      return next;
    });
    
    // Save profile
    try {
      const key = playerName || "Convidado";
      profiles.current.set(key, key);
      localStorage.setItem("dino_profiles", JSON.stringify(profiles.current.toObject()));
    } catch (e) {}
  }

  function restartGame() {
    startGame();
  }

  function setPlayer(name: string) {
    setPlayerName(name);
    try { localStorage.setItem("dino_player", name); } catch (e) {}
    profiles.current.set(name, name);
    try { localStorage.setItem("dino_profiles", JSON.stringify(profiles.current.toObject())); } catch (e) {}
    setShowPlayerModal(false);
  }

  // Keyboard controls
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === "Space" || e.code === "ArrowUp") { 
        e.preventDefault(); 
        if (!isPlaying && !isGameOver) startGame(); 
        else handleJump(); 
      }
      if (e.code === "ArrowDown") {
        e.preventDefault();
        setIsDucking(true);
      }
      if (e.code === "Enter" && isGameOver) restartGame();
    }
    
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === "ArrowDown") {
        setIsDucking(false);
      }
    }
    
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [isPlaying, isGameOver]);

  // Search states
  const [searchDay, setSearchDay] = useState("");
  const [searchPlayer, setSearchPlayer] = useState("");
  const [searchResults, setSearchResults] = useState<GameRecord[] | null>(null);
  const [searchType, setSearchType] = useState<'date' | 'player' | null>(null);
  
  function doSearchByDate() {
    if (!searchDay) { 
      setSearchResults(null);
      setSearchType(null);
      return; 
    }
    const res = binarySearchByDay(records, searchDay);
    setSearchResults(res);
    setSearchType('date');
    setSearchPlayer("");
  }
  
  function doSearchByPlayer() {
    if (!searchPlayer) {
      setSearchResults(null);
      setSearchType(null);
      return;
    }
    const res = searchByPlayer(records, searchPlayer);
    setSearchResults(res);
    setSearchType('player');
    setSearchDay("");
  }
  
  function clearSearch() {
    setSearchDay("");
    setSearchPlayer("");
    setSearchResults(null);
    setSearchType(null);
  }

  // Get ranking from BST
  const rankingList = bst.current.inOrder();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <HeaderBar 
          playerName={playerName}
          distance={distance}
          highScore={highScore}
          onStart={startGame}
          onChangePlayer={() => setShowPlayerModal(true)}
        />

        {/* Game Area */}
        <div 
          ref={gameAreaRef} 
          className="relative w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-purple-500/50"
          style={{ 
            height: '60vh',
            background: 'linear-gradient(to bottom, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
          }}
          onClick={handleJump}
        >
          {/* Stars */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 40}%`,
                width: '2px',
                height: '2px',
                background: 'white',
                borderRadius: '50%',
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}

          {/* Clouds */}
          {clouds.map(cloud => (
            <div
              key={cloud.id}
              style={{
                position: 'absolute',
                left: cloud.x,
                top: cloud.y,
                width: '60px',
                height: '20px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                filter: 'blur(2px)'
              }}
            />
          ))}

          {/* Ground */}
          <div 
            className="absolute left-0 right-0"
            style={{ 
              bottom: '0', 
              height: '60px', 
              background: 'linear-gradient(to bottom, #2d1b69, #1a0e4e)',
              borderTop: '2px solid #6366f1'
            }} 
          />

          {/* Grid lines on ground */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${i * 5}%`,
                bottom: '0',
                width: '1px',
                height: '60px',
                background: 'rgba(99, 102, 241, 0.2)'
              }}
            />
          ))}

          {/* Dino - Square */}
          <motion.div 
            style={{ 
              position: 'absolute', 
              left: 100, 
              bottom: `${60 + dinoY}px`,
              width: 35,
              height: isDucking ? 25 : 40,
              background: 'linear-gradient(135deg, #00ff88, #00cc66)',
              borderRadius: '4px',
              boxShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
              zIndex: 10
            }}
            animate={{ 
              bottom: 60 + dinoY,
              height: isDucking ? 25 : 40
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {/* Eyes */}
            <div style={{
              position: 'absolute',
              top: '5px',
              left: '20px',
              width: '8px',
              height: '8px',
              background: 'white',
              borderRadius: '50%'
            }}>
              <div style={{
                position: 'absolute',
                top: '2px',
                left: '2px',
                width: '4px',
                height: '4px',
                background: 'black',
                borderRadius: '50%'
              }} />
            </div>
          </motion.div>

          {/* Obstacles - Squares */}
          {obstacles.map(o => (
            <motion.div 
              key={o.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ 
                position: 'absolute', 
                left: `${o.x}px`, 
                bottom: o.type === 'bird' ? '100px' : '60px',
                width: `${o.w}px`, 
                height: `${o.h}px`,
                background: o.type === 'bird' 
                  ? 'linear-gradient(135deg, #ff6b6b, #ff4757)' 
                  : 'linear-gradient(135deg, #a855f7, #9333ea)',
                borderRadius: '4px',
                boxShadow: o.type === 'bird'
                  ? '0 0 15px rgba(255, 107, 107, 0.5)'
                  : '0 0 15px rgba(168, 85, 247, 0.5)',
                zIndex: 5
              }}
            />
          ))}

          {/* Ranking Overlay */}
          <RankingOverlay rankingList={rankingList} />

          {/* Start Screen */}
          <StartOverlay show={!isPlaying && !isGameOver} />

          {/* Game Over */}
          <GameOverOverlay 
            show={isGameOver}
            distance={distance}
            highScore={highScore}
            onRestart={restartGame}
            onChangePlayer={() => setShowPlayerModal(true)}
          />
        </div>

        {/* History Section */}
        <HistorySection 
          records={records}
          searchResults={searchResults}
          searchType={searchType}
          searchDay={searchDay}
          searchPlayer={searchPlayer}
          setSearchDay={setSearchDay}
          setSearchPlayer={setSearchPlayer}
          doSearchByDate={doSearchByDate}
          doSearchByPlayer={doSearchByPlayer}
          clearSearch={clearSearch}
          profilesNames={profiles.current.getAllNames()}
          highScore={highScore}
        />
      </div>

      {/* Player Modal */}
      <PlayerModal 
        show={showPlayerModal}
        defaultName={playerName ?? ''}
        onCancel={() => setShowPlayerModal(false)}
        onConfirm={(name) => setPlayer(name)}
      />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(139, 92, 246, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #06b6d4, #8b5cf6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0891b2, #7c3aed);
        }
      `}</style>
    </div>
  );
}
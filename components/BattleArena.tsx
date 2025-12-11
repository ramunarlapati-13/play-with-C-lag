import React, { useState, useEffect, useRef } from 'react';
import { Player, Challenge, Difficulty, BattleLog } from '../types';
import { CodeBlock } from './CodeBlock';
import { generateChallenge } from '../services/geminiService';
import { Timer, Heart, Cpu, Send, AlertTriangle, CheckCircle, XCircle, Terminal as TerminalIcon, RotateCcw, Github } from 'lucide-react';

interface BattleArenaProps {
  difficulty: Difficulty;
  topic: string;
  onExit: () => void;
}

const MAX_HEALTH = 3;

export const BattleArena: React.FC<BattleArenaProps> = ({ difficulty, topic, onExit }) => {
  const [player, setPlayer] = useState<Player>({ name: 'User', score: 0, health: MAX_HEALTH, avatar: '👤', isAi: false });
  const [aiPlayer, setAiPlayer] = useState<Player>({ name: 'Gemini Core', score: 0, health: MAX_HEALTH, avatar: '🤖', isAi: true });
  
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [userInput, setUserInput] = useState('');
  const [gameStatus, setGameStatus] = useState<'PLAYING' | 'RESULT' | 'GAMEOVER'>('PLAYING');
  const [logs, setLogs] = useState<BattleLog[]>([]);
  const [aiProgress, setAiProgress] = useState(0);
  const [resultMessage, setResultMessage] = useState<{winner: 'player' | 'ai', msg: string} | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const aiTimerRef = useRef<number | null>(null);
  const roundStartTimeRef = useRef<number>(0);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Load Initial Challenge
  useEffect(() => {
    loadNewChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addLog = (message: string, type: BattleLog['type']) => {
    setLogs(prev => [...prev, { message, type, timestamp: Date.now() }]);
  };

  const loadNewChallenge = async () => {
    setLoading(true);
    setResultMessage(null);
    setAiProgress(0);
    setUserInput('');
    setGameStatus('PLAYING');
    
    // Determine specific topic based on selection
    const searchTopic = topic === 'Random Mix' ? undefined : topic;
    const challenge = await generateChallenge(difficulty, searchTopic);
    
    setCurrentChallenge(challenge);
    setLoading(false);
    roundStartTimeRef.current = Date.now();
    addLog(`New Challenge loaded: ${challenge.topic}`, 'info');
    
    startAiOpponent(challenge);
  };

  const startAiOpponent = (challenge: Challenge) => {
    if (aiTimerRef.current) window.clearInterval(aiTimerRef.current);

    // AI Speed based on difficulty
    let duration = 20000; // 20s base
    if (difficulty === Difficulty.NOVICE) duration = 30000;
    if (difficulty === Difficulty.EXPERT) duration = 12000;

    // Slight randomness
    duration += Math.random() * 5000 - 2500;

    const interval = 100; // update every 100ms
    const step = 100 / (duration / interval);

    aiTimerRef.current = window.setInterval(() => {
      setAiProgress(prev => {
        const next = prev + step;
        if (next >= 100) {
           handleRoundEnd('ai');
           return 100;
        }
        return next;
      });
    }, interval);
  };

  const handleRoundEnd = (winner: 'player' | 'ai' | 'ai_wrong') => {
    if (aiTimerRef.current) window.clearInterval(aiTimerRef.current);
    if (gameStatus !== 'PLAYING') return;

    setGameStatus('RESULT');

    if (winner === 'player') {
      setPlayer(p => ({ ...p, score: p.score + 100 }));
      setAiPlayer(p => ({ ...p, health: Math.max(0, p.health - 1) }));
      setResultMessage({ winner: 'player', msg: 'Correct! Memory Safe.' });
      addLog(`User submitted correct answer. AI took damage.`, 'success');
    } else {
      setAiPlayer(p => ({ ...p, score: p.score + 100 }));
      setPlayer(p => ({ ...p, health: Math.max(0, p.health - 1) }));
      setResultMessage({ winner: 'ai', msg: winner === 'ai' ? 'Too Slow! AI compiled first.' : 'Segmentation Fault (Wrong Answer)' });
      addLog(winner === 'ai' ? 'AI solved the challenge first.' : 'Incorrect answer provided.', 'damage');
    }

    // Check Game Over
    setTimeout(() => {
       // We need to check state in the next render cycle or use refs, 
       // but here we can just check the updated values via logic or waiting for effect.
       // For simplicity, we'll check inside the next visual step.
    }, 0);
  };

  useEffect(() => {
    if (player.health === 0 || aiPlayer.health === 0) {
      setGameStatus('GAMEOVER');
    }
  }, [player.health, aiPlayer.health]);

  const submitAnswer = () => {
    if (!currentChallenge || gameStatus !== 'PLAYING') return;

    const cleanInput = userInput.trim().toLowerCase();
    const cleanAnswer = currentChallenge.correctAnswer.trim().toLowerCase();

    // Basic validation (can be improved with fuzzy matching)
    if (cleanInput === cleanAnswer) {
      handleRoundEnd('player');
    } else {
      // Wrong answer
      addLog(`System Error: "${userInput}" is incorrect.`, 'damage');
      setPlayer(p => ({ ...p, score: Math.max(0, p.score - 50) }));
      // Optional: Shake animation or immediate loss? 
      // Let's just give feedback and let them try again unless AI finishes.
      // Or pure punitive: Wrong answer = Round Loss.
      // Design Choice: Wrong answer = Round Loss is stricter for a "Duel".
      handleRoundEnd('ai_wrong'); 
    }
  };
  
  // Handling for "ai_wrong" logic which is effectively AI winning the round because player failed
  // Refined: handleRoundEnd argument could be 'player' (win) or 'ai' (timeout/ai win) or 'wrong' (player fail)

  if (gameStatus === 'GAMEOVER') {
    const isWin = player.health > 0;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cyber-black text-center p-8 relative">
        <div className={`text-4xl md:text-6xl mb-6 ${isWin ? 'text-cyber-neon' : 'text-cyber-red'} font-black tracking-widest`}>
          {isWin ? 'SYSTEM SECURE' : 'CRITICAL FAILURE'}
        </div>
        <p className="text-gray-400 text-lg md:text-xl mb-8 font-mono">
          {isWin ? 'All logic vulnerabilities patched.' : 'AI superiority established.'}
        </p>
        <div className="flex gap-8 mb-12">
           <div className="text-center">
             <div className="text-xs md:text-sm text-gray-500">USER SCORE</div>
             <div className="text-2xl md:text-4xl font-mono text-white">{player.score}</div>
           </div>
           <div className="text-center">
             <div className="text-xs md:text-sm text-gray-500">AI SCORE</div>
             <div className="text-2xl md:text-4xl font-mono text-white">{aiPlayer.score}</div>
           </div>
        </div>
        <button onClick={onExit} className="px-8 py-3 bg-cyber-panel border border-cyber-neon text-cyber-neon rounded hover:bg-cyber-neon hover:text-black transition-colors font-mono">
          Return to Lobby
        </button>

        <div className="absolute bottom-4 left-0 right-0 text-center">
            <p className="text-cyber-dim text-[10px] md:text-xs font-mono flex items-center justify-center gap-2">
              created by <a href="https://github.com/ramunarlapati-13" target="_blank" rel="noopener noreferrer" className="text-cyber-neon hover:text-white transition-colors flex items-center gap-1"><Github size={12} /> ramunarlapati</a> @2025
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-cyber-black overflow-hidden font-sans">
      {/* Header / HUD */}
      <header className="h-auto min-h-[3.5rem] md:h-20 border-b border-cyber-panel bg-cyber-dark/50 flex items-center justify-between px-3 md:px-6 py-2 z-10 relative shrink-0">
        
        {/* Player 1 */}
        <div className="flex items-center gap-2 md:gap-4 flex-1">
          <div className="relative">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded bg-cyber-panel flex items-center justify-center text-lg md:text-2xl border border-cyber-green">{player.avatar}</div>
            <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-black px-1 rounded text-[0.5rem] md:text-xs font-mono border border-cyber-green text-cyber-green">P1</div>
          </div>
          <div>
            <div className="flex gap-0.5 md:gap-1 mb-0.5 md:mb-1">
              {[...Array(MAX_HEALTH)].map((_, i) => (
                <Heart key={i} className={`w-3 h-3 md:w-4 md:h-4 ${i < player.health ? 'fill-cyber-red text-cyber-red' : 'text-gray-700'}`} />
              ))}
            </div>
            <div className="text-cyber-green font-mono text-sm md:text-xl leading-none">{player.score.toString().padStart(6, '0')}</div>
          </div>
        </div>

        {/* Center Info */}
        <div className="flex flex-col items-center justify-center flex-[2] md:flex-1 mx-2">
          <div className="hidden md:block text-xs text-cyber-dim tracking-[0.2em] font-mono mb-1">VS MODE: {difficulty.toUpperCase()}</div>
          <div className="text-white text-xs md:text-base font-bold tracking-tight text-center truncate w-full">{topic}</div>
        </div>

        {/* AI Player */}
        <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end">
          <div className="text-right">
            <div className="flex gap-0.5 md:gap-1 mb-0.5 md:mb-1 justify-end">
              {[...Array(MAX_HEALTH)].map((_, i) => (
                <Heart key={i} className={`w-3 h-3 md:w-4 md:h-4 ${i < aiPlayer.health ? 'fill-cyber-red text-cyber-red' : 'text-gray-700'}`} />
              ))}
            </div>
            <div className="text-cyber-neon font-mono text-sm md:text-xl leading-none">{aiPlayer.score.toString().padStart(6, '0')}</div>
          </div>
          <div className="relative">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded bg-cyber-panel flex items-center justify-center text-lg md:text-2xl border border-cyber-neon shadow-[0_0_10px_rgba(0,243,255,0.3)]">{aiPlayer.avatar}</div>
             <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-black px-1 rounded text-[0.5rem] md:text-xs font-mono border border-cyber-neon text-cyber-neon">AI</div>
          </div>
        </div>
      </header>
      
      {/* AI Progress Bar */}
      <div className="h-1 w-full bg-cyber-dark relative shrink-0">
        <div 
            className="h-full bg-cyber-neon transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(0,243,255,0.5)]" 
            style={{ width: `${aiProgress}%` }} 
        />
        <div className="absolute top-2 right-2 text-[10px] text-cyber-neon font-mono animate-pulse">
            AI COMPILING... {Math.floor(aiProgress)}%
        </div>
      </div>

      {/* Main Arena Content */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left: Challenge Area */}
        <div className="flex-1 flex flex-col p-3 md:p-6 overflow-y-auto w-full">
          {loading ? (
             <div className="flex-1 flex flex-col items-center justify-center text-cyber-dim space-y-4">
               <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-cyber-neon border-t-transparent rounded-full animate-spin"></div>
               <p className="font-mono animate-pulse text-xs md:text-base">GENERATING VIRTUAL CHALLENGE...</p>
             </div>
          ) : currentChallenge ? (
            <div className="max-w-3xl mx-auto w-full flex flex-col h-full">
              <div className="flex-1 space-y-4 md:space-y-6">
                <div className="bg-cyber-panel/30 border-l-2 md:border-l-4 border-cyber-neon p-3 md:p-6 rounded-r-lg">
                  <h2 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">{currentChallenge.topic}</h2>
                  <p className="text-gray-300 text-sm md:text-lg leading-relaxed">{currentChallenge.question}</p>
                </div>
                
                <CodeBlock code={currentChallenge.codeSnippet} />
                
                {/* Result Overlay */}
                {gameStatus === 'RESULT' && (
                  <div className={`p-4 md:p-6 rounded-lg border ${resultMessage?.winner === 'player' ? 'bg-green-900/20 border-green-500' : 'bg-red-900/20 border-red-500'} animate-in fade-in slide-in-from-bottom-4`}>
                    <div className="flex items-start gap-3 md:gap-4">
                      {resultMessage?.winner === 'player' ? <CheckCircle className="text-green-400 w-6 h-6 md:w-8 md:h-8 shrink-0" /> : <XCircle className="text-red-500 w-6 h-6 md:w-8 md:h-8 shrink-0" />}
                      <div>
                        <h3 className={`text-base md:text-xl font-bold mb-1 md:mb-2 ${resultMessage?.winner === 'player' ? 'text-green-400' : 'text-red-500'}`}>
                          {resultMessage?.msg}
                        </h3>
                        <div className="text-gray-300">
                          <span className="text-cyber-dim text-xs md:text-sm uppercase font-bold block mb-1">Correct Answer:</span>
                          <code className="bg-black px-2 py-1 rounded text-yellow-300 font-mono text-sm md:text-base break-all">{currentChallenge.correctAnswer}</code>
                        </div>
                        <div className="mt-2 md:mt-4 text-xs md:text-sm text-gray-400 border-t border-white/10 pt-2">
                           {currentChallenge.explanation}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="mt-4 pt-4 md:mt-6 md:pt-6 border-t border-cyber-panel/50 shrink-0 pb-safe">
                {gameStatus === 'PLAYING' ? (
                   currentChallenge.type === 'MULTIPLE_CHOICE' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
                      {currentChallenge.options?.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setUserInput(opt); setTimeout(submitAnswer, 0); }} // Immediate submit for buttons
                          className="p-3 md:p-4 bg-cyber-dark border border-cyber-panel hover:border-cyber-neon hover:bg-cyber-neon/10 rounded-lg text-left font-mono transition-all group active:bg-cyber-neon/20"
                        >
                          <span className="text-cyber-dim mr-2 group-hover:text-cyber-neon">{String.fromCharCode(65 + idx)}.</span>
                          <span className="text-gray-300 text-sm md:text-base">{opt}</span>
                        </button>
                      ))}
                    </div>
                   ) : (
                    <div className="relative">
                      <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-cyber-neon font-mono text-base md:text-lg">{'>'}</div>
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
                        placeholder="Type answer here..."
                        className="w-full bg-cyber-dark border border-cyber-panel rounded-lg py-3 md:py-4 pl-8 md:pl-10 pr-12 md:pr-16 text-base md:text-lg font-mono text-white focus:outline-none focus:border-cyber-neon focus:ring-1 focus:ring-cyber-neon placeholder-gray-600"
                        autoFocus
                      />
                      <button 
                        onClick={submitAnswer}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 md:p-2 bg-cyber-neon text-cyber-black rounded hover:bg-white transition-colors"
                      >
                        <Send size={18} className="md:w-5 md:h-5" />
                      </button>
                    </div>
                   )
                ) : (
                  <button
                    onClick={loadNewChallenge}
                    className="w-full py-3 md:py-4 bg-cyber-panel hover:bg-cyber-dark border border-cyber-dim hover:border-cyber-neon text-white font-bold uppercase tracking-widest transition-all rounded-lg flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <RotateCcw size={18} className="md:w-5 md:h-5" />
                    Next Round
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Right: Logs / Side Panel */}
        <div className="w-80 bg-cyber-dark border-l border-cyber-panel flex flex-col hidden lg:flex">
          <div className="p-4 border-b border-cyber-panel bg-cyber-panel/20">
            <h3 className="text-xs font-bold text-cyber-dim uppercase tracking-wider flex items-center gap-2">
              <TerminalIcon size={14} /> System Logs
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs scrollbar-hide">
            {logs.map((log, i) => (
              <div key={i} className={`p-2 rounded border-l-2 ${
                log.type === 'success' ? 'border-green-500 bg-green-900/10 text-green-400' :
                log.type === 'damage' ? 'border-red-500 bg-red-900/10 text-red-400' :
                log.type === 'ai' ? 'border-cyber-neon bg-cyan-900/10 text-cyber-neon' :
                'border-gray-500 text-gray-400'
              }`}>
                <span className="opacity-50">[{new Date(log.timestamp).toLocaleTimeString([], {hour12: false, minute:'2-digit', second:'2-digit'})}]</span> {log.message}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </main>
    </div>
  );
};
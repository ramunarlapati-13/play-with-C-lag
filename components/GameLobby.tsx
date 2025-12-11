import React, { useState } from 'react';
import { Difficulty } from '../types';
import { Terminal, Cpu, Shield, Zap, Github } from 'lucide-react';

interface GameLobbyProps {
  onStart: (difficulty: Difficulty, topic: string) => void;
}

const TOPICS = [
  'Random Mix',
  'Variables & Data Types',
  'Operators & Expressions',
  'Control Flow (If/Switch/Loops)',
  'Functions & Recursion',
  'Arrays & Multidimensional Arrays',
  'Pointers & Memory Addressing',
  'Strings & String Library',
  'Structures & Unions',
  'Dynamic Memory Allocation',
  'File Input/Output',
  'Preprocessor Directives',
  'Bitwise Operators',
  'Type Casting & Storage Classes',
  'Function Pointers',
  'Command Line Arguments',
  'Error Handling & Errno',
  'Standard Library Functions',
  'Variadic Functions',
  'Complex Memory Layouts'
];

export const GameLobby: React.FC<GameLobbyProps> = ({ onStart }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.NOVICE);
  const [selectedTopic, setSelectedTopic] = useState<string>(TOPICS[0]);

  return (
    <div className="min-h-screen flex items-center justify-center p-2 md:p-4 bg-cyber-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyber-dark to-cyber-black relative overflow-hidden">
      <div className="max-w-2xl w-full bg-cyber-panel/50 backdrop-blur-md border border-cyber-neon/30 rounded-2xl p-4 md:p-8 shadow-2xl shadow-cyber-neon/10 max-h-[90vh] flex flex-col z-10">
        <div className="text-center mb-4 md:mb-6 shrink-0">
          <div className="inline-flex items-center justify-center p-3 md:p-4 bg-cyber-neon/10 rounded-full mb-2 md:mb-4 ring-1 ring-cyber-neon/50">
            <Terminal className="w-8 h-8 md:w-12 md:h-12 text-cyber-neon" />
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-1 md:mb-2">
            C-ARENA <span className="text-cyber-neon">DUEL</span>
          </h1>
          <p className="text-xs md:text-base text-gray-400 font-mono">Real-time Compiler Combat Simulation</p>
        </div>

        <div className="space-y-4 md:space-y-6 overflow-hidden flex flex-col flex-1">
          {/* Difficulty Selection */}
          <div className="space-y-2 md:space-y-3 shrink-0">
            <label className="text-[10px] md:text-xs font-bold text-cyber-neon uppercase tracking-wider">Select Difficulty</label>
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              {[
                { id: Difficulty.NOVICE, icon: Shield, color: 'text-green-400', desc: 'Slower AI, basic syntax' },
                { id: Difficulty.INTERMEDIATE, icon: Cpu, color: 'text-yellow-400', desc: 'Balanced Challenge' },
                { id: Difficulty.EXPERT, icon: Zap, color: 'text-red-500', desc: 'Fast AI, complex memory' }
              ].map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => setSelectedDifficulty(diff.id)}
                  className={`relative group flex flex-col items-center p-2 md:p-4 rounded-xl border transition-all duration-300 ${
                    selectedDifficulty === diff.id
                      ? 'bg-cyber-neon/10 border-cyber-neon shadow-[0_0_15px_rgba(0,243,255,0.3)]'
                      : 'bg-cyber-dark border-cyber-panel hover:border-gray-600'
                  }`}
                >
                  <diff.icon className={`w-6 h-6 md:w-8 md:h-8 mb-1 md:mb-2 ${diff.color}`} />
                  <span className={`font-bold text-xs md:text-base ${selectedDifficulty === diff.id ? 'text-white' : 'text-gray-400'}`}>
                    {diff.id}
                  </span>
                  <span className="hidden md:block text-[10px] text-gray-500 text-center mt-1">{diff.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Topic Selection */}
          <div className="space-y-2 md:space-y-3 flex-1 flex flex-col overflow-hidden">
            <label className="text-[10px] md:text-xs font-bold text-cyber-neon uppercase tracking-wider">Target Module</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 overflow-y-auto pr-2 scrollbar-hide pb-2">
              {TOPICS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`p-2 md:p-3 text-xs md:text-sm font-mono text-left rounded-lg transition-all ${
                    selectedTopic === topic
                      ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green shadow-[0_0_10px_rgba(0,255,157,0.2)]'
                      : 'bg-cyber-dark text-gray-400 border border-transparent hover:bg-cyber-panel hover:border-gray-600'
                  }`}
                >
                  {topic === 'Random Mix' ? '> Random Mix' : `> ${topic}`}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onStart(selectedDifficulty, selectedTopic)}
            className="w-full py-3 md:py-4 bg-cyber-neon text-cyber-black font-black text-base md:text-lg uppercase tracking-widest rounded-xl hover:bg-white hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] transition-all transform active:scale-95 shrink-0"
          >
            Initialize Sequence
          </button>
        </div>
      </div>

      <div className="absolute bottom-2 left-0 right-0 text-center p-2 z-0">
        <p className="text-cyber-dim text-[10px] md:text-xs font-mono flex items-center justify-center gap-2">
          created by <a href="https://github.com/ramunarlapati-13" target="_blank" rel="noopener noreferrer" className="text-cyber-neon hover:text-white transition-colors flex items-center gap-1"><Github size={12} /> ramunarlapati</a> @2025
        </p>
      </div>
    </div>
  );
};
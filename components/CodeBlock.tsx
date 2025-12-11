import React from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  // Simple syntax highlighting simulation for C
  const highlightCode = (source: string) => {
    return source.split('\n').map((line, i) => (
      <div key={i} className="table-row">
        <span className="table-cell text-right pr-2 md:pr-4 select-none text-cyber-dim w-6 md:w-8 text-[10px] md:text-xs align-top pt-0.5">{i + 1}</span>
        <span className="table-cell whitespace-pre-wrap font-mono text-xs md:text-sm text-gray-300 break-words">
          {line.split(/(\/\/.*|\/\*.*\*\/|#\w+|"[^"]*"|'[^']*'|\b(?:int|char|float|double|void|return|if|else|while|for|struct|typedef|sizeof|const|unsigned)\b)/g).map((token, j) => {
            if (token.startsWith('//') || token.startsWith('/*')) return <span key={j} className="text-gray-500 italic">{token}</span>;
            if (token.startsWith('#')) return <span key={j} className="text-purple-400">{token}</span>;
            if (token.startsWith('"') || token.startsWith("'")) return <span key={j} className="text-yellow-300">{token}</span>;
            if (['int', 'char', 'float', 'double', 'void', 'return', 'if', 'else', 'while', 'for', 'struct', 'typedef', 'sizeof', 'const', 'unsigned'].includes(token)) {
              return <span key={j} className="text-cyber-neon font-semibold">{token}</span>;
            }
            return token;
          })}
        </span>
      </div>
    ));
  };

  return (
    <div className="bg-cyber-dark border border-cyber-panel rounded-lg p-3 md:p-4 overflow-x-auto shadow-inner w-full">
      <div className="table w-full">
        {highlightCode(code)}
      </div>
    </div>
  );
};
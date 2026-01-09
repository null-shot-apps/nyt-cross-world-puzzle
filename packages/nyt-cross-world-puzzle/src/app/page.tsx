'use client';

import { useEffect, useState } from 'react';

// Puzzle data structure
interface Cell {
  letter: string;
  number?: number;
  isBlack: boolean;
}

interface Clue {
  number: number;
  text: string;
  answer: string;
  direction: 'across' | 'down';
}

interface Puzzle {
  grid: Cell[][];
  clues: Clue[];
  title: string;
  difficulty: 'Monday' | 'Thursday' | 'Sunday';
  date: string;
}

// Generate a simple puzzle (we'll rotate through different ones)
function generateDailyPuzzle(): Puzzle {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const puzzleIndex = dayOfYear % 3; // Rotate through 3 difficulty levels
  
  const difficulties: Array<'Monday' | 'Thursday' | 'Sunday'> = ['Monday', 'Thursday', 'Sunday'];
  const difficulty = difficulties[puzzleIndex];
  
  // Simple 5x5 Monday puzzle
  if (difficulty === 'Monday') {
    const grid: Cell[][] = [
      [
        { letter: 'C', number: 1, isBlack: false },
        { letter: 'A', number: 2, isBlack: false },
        { letter: 'T', number: 3, isBlack: false },
        { letter: 'S', isBlack: false },
        { letter: '', isBlack: true }
      ],
      [
        { letter: 'A', number: 4, isBlack: false },
        { letter: 'R', isBlack: false },
        { letter: 'E', isBlack: false },
        { letter: 'A', isBlack: false },
        { letter: '', isBlack: true }
      ],
      [
        { letter: 'R', number: 5, isBlack: false },
        { letter: 'E', isBlack: false },
        { letter: 'A', isBlack: false },
        { letter: 'D', isBlack: false },
        { letter: '', isBlack: true }
      ],
      [
        { letter: 'S', isBlack: false },
        { letter: '', isBlack: true },
        { letter: 'T', number: 6, isBlack: false },
        { letter: 'O', isBlack: false },
        { letter: 'E', number: 7, isBlack: false }
      ],
      [
        { letter: '', isBlack: true },
        { letter: '', isBlack: true },
        { letter: 'E', isBlack: false },
        { letter: 'N', isBlack: false },
        { letter: 'D', isBlack: false }
      ]
    ];
    
    const clues: Clue[] = [
      { number: 1, text: 'Feline pets', answer: 'CATS', direction: 'across' },
      { number: 4, text: 'Region or zone', answer: 'AREA', direction: 'across' },
      { number: 5, text: 'Peruse a book', answer: 'READ', direction: 'across' },
      { number: 6, text: 'Opposite of heel', answer: 'TOE', direction: 'across' },
      { number: 1, text: 'Automobile', answer: 'CARS', direction: 'down' },
      { number: 2, text: 'Exist', answer: 'ARE', direction: 'down' },
      { number: 3, text: 'Ripped', answer: 'TATE', direction: 'down' },
      { number: 7, text: 'Conclusion', answer: 'END', direction: 'down' }
    ];
    
    return {
      grid,
      clues,
      title: 'Daily Mini',
      difficulty: 'Monday',
      date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    };
  }
  
  // Placeholder for other difficulties (same puzzle for now)
  return generateDailyPuzzle();
}

export default function CrosswordPuzzle() {
  const [puzzle] = useState<Puzzle>(generateDailyPuzzle());
  const [userGrid, setUserGrid] = useState<string[][]>(() => 
    puzzle.grid.map(row => row.map(() => ''))
  );
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const [isComplete, setIsComplete] = useState(false);

  const checkPuzzle = () => {
    let correct = true;
    for (let i = 0; i < puzzle.grid.length; i++) {
      for (let j = 0; j < puzzle.grid[i].length; j++) {
        if (!puzzle.grid[i][j].isBlack && userGrid[i][j].toUpperCase() !== puzzle.grid[i][j].letter) {
          correct = false;
          break;
        }
      }
    }
    setIsComplete(correct);
  };

  const handleCellClick = (row: number, col: number) => {
    if (puzzle.grid[row][col].isBlack) return;
    
    if (selectedCell?.row === row && selectedCell?.col === col) {
      setDirection(prev => prev === 'across' ? 'down' : 'across');
    } else {
      setSelectedCell({ row, col });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    
    if (e.key === 'Backspace') {
      const newGrid = [...userGrid];
      newGrid[row][col] = '';
      setUserGrid(newGrid);
      
      // Move to previous cell
      if (direction === 'across' && col > 0) {
        let newCol = col - 1;
        while (newCol >= 0 && puzzle.grid[row][newCol].isBlack) newCol--;
        if (newCol >= 0) setSelectedCell({ row, col: newCol });
      } else if (direction === 'down' && row > 0) {
        let newRow = row - 1;
        while (newRow >= 0 && puzzle.grid[newRow][col].isBlack) newRow--;
        if (newRow >= 0) setSelectedCell({ row: newRow, col });
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      let newRow = row;
      let newCol = col;
      
      if (e.key === 'ArrowLeft') newCol--;
      else if (e.key === 'ArrowRight') newCol++;
      else if (e.key === 'ArrowUp') newRow--;
      else if (e.key === 'ArrowDown') newRow++;
      
      while (newRow >= 0 && newRow < puzzle.grid.length && newCol >= 0 && newCol < puzzle.grid[0].length) {
        if (!puzzle.grid[newRow][newCol].isBlack) {
          setSelectedCell({ row: newRow, col: newCol });
          break;
        }
        if (e.key === 'ArrowLeft') newCol--;
        else if (e.key === 'ArrowRight') newCol++;
        else if (e.key === 'ArrowUp') newRow--;
        else if (e.key === 'ArrowDown') newRow++;
      }
    } else if (/^[a-zA-Z]$/.test(e.key)) {
      const newGrid = [...userGrid];
      newGrid[row][col] = e.key.toUpperCase();
      setUserGrid(newGrid);
      
      // Move to next cell
      if (direction === 'across' && col < puzzle.grid[0].length - 1) {
        let newCol = col + 1;
        while (newCol < puzzle.grid[0].length && puzzle.grid[row][newCol].isBlack) newCol++;
        if (newCol < puzzle.grid[0].length) setSelectedCell({ row, col: newCol });
      } else if (direction === 'down' && row < puzzle.grid.length - 1) {
        let newRow = row + 1;
        while (newRow < puzzle.grid.length && puzzle.grid[newRow][col].isBlack) newRow++;
        if (newRow < puzzle.grid.length) setSelectedCell({ row: newRow, col });
      }
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (selectedCell) {
        handleKeyDown(e as unknown as React.KeyboardEvent);
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedCell, direction, userGrid]);

  const acrossClues = puzzle.clues.filter(c => c.direction === 'across');
  const downClues = puzzle.clues.filter(c => c.direction === 'down');

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="border-b border-gray-300 py-4 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-serif font-bold">The Daily Crossword</h1>
          <p className="text-sm text-gray-600 mt-1">{puzzle.date}</p>
          <p className="text-xs text-gray-500 mt-1">Difficulty: {puzzle.difficulty}</p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Puzzle grid */}
          <div className="flex flex-col items-center">
            <div className="inline-block border-2 border-black">
              {puzzle.grid.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`w-12 h-12 border border-gray-400 relative cursor-pointer ${
                        cell.isBlack ? 'bg-black' : 'bg-white'
                      } ${
                        selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                          ? 'ring-2 ring-blue-500 ring-inset'
                          : ''
                      }`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {!cell.isBlack && (
                        <>
                          {cell.number && (
                            <span className="absolute top-0 left-0.5 text-[10px] font-bold">
                              {cell.number}
                            </span>
                          )}
                          <div className="w-full h-full flex items-center justify-center text-xl font-bold">
                            {userGrid[rowIndex][colIndex]}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex gap-4">
              <button
                onClick={checkPuzzle}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
              >
                Check Puzzle
              </button>
              <button
                onClick={() => setUserGrid(puzzle.grid.map(row => row.map(() => '')))}
                className="px-6 py-2 bg-gray-200 text-black rounded hover:bg-gray-300 font-medium"
              >
                Clear
              </button>
            </div>
            
            {isComplete && (
              <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded text-green-800 font-medium">
                🎉 Congratulations! You solved the puzzle!
              </div>
            )}
          </div>

          {/* Clues */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-3 font-serif">ACROSS</h2>
              <div className="space-y-2">
                {acrossClues.map(clue => (
                  <div key={`across-${clue.number}`} className="flex gap-2">
                    <span className="font-bold min-w-[2rem]">{clue.number}.</span>
                    <span>{clue.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-3 font-serif">DOWN</h2>
              <div className="space-y-2">
                {downClues.map(clue => (
                  <div key={`down-${clue.number}`} className="flex gap-2">
                    <span className="font-bold min-w-[2rem]">{clue.number}.</span>
                    <span>{clue.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


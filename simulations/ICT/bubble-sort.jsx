import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, RefreshCw, RotateCcw, Check, X, Trophy, Info, BrainCircuit, GraduationCap } from 'lucide-react';

const BubbleSortGame = () => {
  // --- Configuration ---
  const ARRAY_SIZE = 8;
  const MIN_VAL = 10;
  const MAX_VAL = 100;
  const ANIMATION_SPEED_LEVELS = { Slow: 800, Normal: 400, Fast: 100 };

  // --- State ---
  const [mode, setMode] = useState('learn'); // 'learn' | 'play'
  const [array, setArray] = useState([]);
  const [indices, setIndices] = useState({ i: 0, j: 0 }); // i = outer loop, j = inner loop
  const [isSorting, setIsSorting] = useState(false);
  const [isSorted, setIsSorted] = useState(false);
  const [speed, setSpeed] = useState('Normal');
  const [message, setMessage] = useState("Welcome! Select a mode to start.");
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0, score: 0, mistakes: 0 });
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null

  // --- Refs for interval management ---
  const timerRef = useRef(null);

  // --- Initialization ---
  const generateArray = useCallback(() => {
    const newArray = Array.from({ length: ARRAY_SIZE }, () => 
      Math.floor(Math.random() * (MAX_VAL - MIN_VAL + 1)) + MIN_VAL
    );
    setArray(newArray);
    setIndices({ i: 0, j: 0 });
    setIsSorted(false);
    setIsSorting(false);
    setStats({ comparisons: 0, swaps: 0, score: 0, mistakes: 0 });
    setMessage(mode === 'learn' ? "Press Play to start sorting." : "Is the left bar taller than the right? Swap or Pass.");
    setFeedback(null);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [mode]);

  useEffect(() => {
    generateArray();
  }, [generateArray]);

  // --- Core Sorting Logic (Step) ---
  const performStep = useCallback((currentArray, currentI, currentJ, currentStats) => {
    // If we've completed the inner loop pass
    if (currentJ >= ARRAY_SIZE - 1 - currentI) {
      // Check if outer loop is done
      if (currentI >= ARRAY_SIZE - 2) {
        return { 
          finished: true, 
          newArray: currentArray, 
          newI: currentI, 
          newJ: currentJ,
          newStats: currentStats 
        };
      }
      // Reset inner loop, increment outer loop
      return { 
        finished: false, 
        newArray: currentArray, 
        newI: currentI + 1, 
        newJ: 0,
        newStats: currentStats
      };
    }

    // Comparison Logic
    const nextArray = [...currentArray];
    let swapped = false;
    let newStats = { ...currentStats, comparisons: currentStats.comparisons + 1 };
    
    // Bubble Sort Rule: If Left > Right, Swap
    if (nextArray[currentJ] > nextArray[currentJ + 1]) {
      [nextArray[currentJ], nextArray[currentJ + 1]] = [nextArray[currentJ + 1], nextArray[currentJ]];
      swapped = true;
      newStats.swaps += 1;
    }

    return { 
      finished: false, 
      newArray: nextArray, 
      newI: currentI, 
      newJ: currentJ + 1,
      newStats,
      swapped
    };
  }, []);

  // --- Learn Mode: Auto-Player ---
  const handleStep = useCallback(() => {
    if (isSorted) return;

    setArray(prevArray => {
      const { finished, newArray, newI, newJ, newStats, swapped } = performStep(prevArray, indices.i, indices.j, stats);

      if (finished) {
        setIsSorted(true);
        setIsSorting(false);
        setMessage("Sorting Complete! The array is fully sorted.");
        setIndices({ i: 0, j: -1 }); // j=-1 hides highlights
        if (timerRef.current) clearInterval(timerRef.current);
        return prevArray;
      }

      setIndices({ i: newI, j: newJ });
      setStats(newStats);
      
      const leftVal = prevArray[indices.j];
      const rightVal = prevArray[indices.j+1];
      
      if (swapped) {
        setMessage(`Swapped ${leftVal} and ${rightVal} because ${leftVal} > ${rightVal}.`);
      } else if (newJ === 0 && newI > indices.i) {
        setMessage(`Pass Complete. Largest remaining item bubbled to end.`);
      } else {
        setMessage(`${leftVal} <= ${rightVal}, so no swap needed.`);
      }

      return newArray;
    });
  }, [indices, isSorted, stats, performStep]);

  // --- Timer Effect for Auto-Play ---
  useEffect(() => {
    if (isSorting && !isSorted) {
      timerRef.current = setInterval(handleStep, ANIMATION_SPEED_LEVELS[speed]);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isSorting, isSorted, speed, handleStep]);

  // --- Play Mode: User Interaction ---
  const handleUserDecision = (action) => {
    if (isSorted) return;

    const currentVal = array[indices.j];
    const nextVal = array[indices.j + 1];
    const shouldSwap = currentVal > nextVal;

    let isCorrect = false;
    if (action === 'swap' && shouldSwap) isCorrect = true;
    if (action === 'pass' && !shouldSwap) isCorrect = true;

    if (isCorrect) {
      // Correct Move
      setFeedback('correct');
      setStats(prev => ({ ...prev, score: prev.score + 10 }));
      setMessage("Correct! " + (action === 'swap' ? "Swapping items." : "Items already in order."));
      
      // Execute the logic visually
      if (action === 'swap') {
        const newArr = [...array];
        [newArr[indices.j], newArr[indices.j + 1]] = [newArr[indices.j + 1], newArr[indices.j]];
        setArray(newArr);
        setStats(prev => ({ ...prev, swaps: prev.swaps + 1 }));
      }
      setStats(prev => ({ ...prev, comparisons: prev.comparisons + 1 }));

      // Advance indices
      setTimeout(() => {
        setFeedback(null);
        let nextJ = indices.j + 1;
        let nextI = indices.i;

        if (nextJ >= ARRAY_SIZE - 1 - nextI) {
          nextJ = 0;
          nextI++;
          setMessage("Pass complete! Largest item locked in.");
        }

        if (nextI >= ARRAY_SIZE - 1) {
          setIsSorted(true);
          setMessage(`Game Over! Final Score: ${stats.score + 10}`); // Add the points we just added to display
          setIndices({ i: 0, j: -1 });
        } else {
          setIndices({ i: nextI, j: nextJ });
        }
      }, 500);

    } else {
      // Wrong Move
      setFeedback('wrong');
      setStats(prev => ({ ...prev, score: Math.max(0, prev.score - 5), mistakes: prev.mistakes + 1 }));
      setMessage(shouldSwap 
        ? `Oops! ${currentVal} is greater than ${nextVal}, so they MUST swap.` 
        : `Oops! ${currentVal} is not greater than ${nextVal}, so NO swap.`);
      
      setTimeout(() => setFeedback(null), 1000);
    }
  };


  // --- Helper: Bar Color ---
  const getBarColor = (index) => {
    if (isSorted) return 'bg-emerald-400'; // All sorted
    
    // In Bubble Sort, the last 'i' elements are already sorted
    if (index >= ARRAY_SIZE - indices.i) return 'bg-emerald-400'; // Sorted partition
    
    // Active pair being compared
    if (index === indices.j || index === indices.j + 1) {
      if (feedback === 'correct') return 'bg-green-400';
      if (feedback === 'wrong') return 'bg-red-400';
      return 'bg-yellow-400';
    }
    
    return 'bg-blue-400'; // Default
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header & Mode Switch */}
        <div className="bg-slate-900 text-white p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <RefreshCw className="w-6 h-6 text-blue-400" />
              Valtorta College Bubble Sort Master
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {mode === 'learn' ? 'Watch and understand the algorithm.' : 'Apply the algorithm logic yourself!'}
            </p>
          </div>
          
          <div className="flex bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setMode('learn')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${mode === 'learn' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <GraduationCap size={18} /> Learn
            </button>
            <button
              onClick={() => setMode('play')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${mode === 'play' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <BrainCircuit size={18} /> Play
            </button>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-100 border-b border-slate-200">
          <StatBox label="Comparisons" value={stats.comparisons} />
          <StatBox label="Swaps" value={stats.swaps} />
          {mode === 'play' ? (
             <>
               <StatBox label="Score" value={stats.score} highlight />
               <StatBox label="Mistakes" value={stats.mistakes} color="text-red-600" />
             </>
          ) : (
             <div className="col-span-2 flex items-center justify-end gap-2">
                <span className="text-sm font-medium text-slate-500">Speed:</span>
                {Object.keys(ANIMATION_SPEED_LEVELS).map(level => (
                  <button
                    key={level}
                    onClick={() => setSpeed(level)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${speed === level ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-white border-slate-300 text-slate-600'}`}
                  >
                    {level}
                  </button>
                ))}
             </div>
          )}
        </div>

        {/* Visualizer Area */}
        <div className="p-6 md:p-12 min-h-[300px] flex flex-col justify-end items-center relative bg-gradient-to-b from-white to-slate-50">
          {/* Main Visualizer */}
          <div className="flex items-end justify-center gap-2 w-full h-64">
            {array.map((value, idx) => (
              <div key={idx} className="flex flex-col justify-end items-center w-8 md:w-12 transition-all duration-300" style={{ height: '100%' }}>
                <span className="mb-2 text-xs font-bold text-slate-500">{value}</span>
                <div 
                  className={`w-full rounded-t-md shadow-sm transition-all duration-200 ${getBarColor(idx)}`}
                  style={{ height: `${value}%` }}
                ></div>
                {/* Index Markers */}
                {!isSorted && idx === indices.j && <div className="mt-2 text-xs font-bold text-yellow-600">L</div>}
                {!isSorted && idx === indices.j + 1 && <div className="mt-2 text-xs font-bold text-yellow-600">R</div>}
              </div>
            ))}
          </div>

          {/* Feedback Overlay */}
          <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full shadow-lg font-medium transition-all duration-300 ${
            feedback === 'correct' ? 'bg-green-100 text-green-800 scale-100 opacity-100' : 
            feedback === 'wrong' ? 'bg-red-100 text-red-800 scale-100 opacity-100' : 
            'scale-90 opacity-0 pointer-events-none'
          }`}>
             {feedback === 'correct' ? <span className="flex items-center gap-2"><Check size={18}/> Great Job!</span> : <span className="flex items-center gap-2"><X size={18}/> Incorrect</span>}
          </div>
        </div>

        {/* Info Message */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-center">
          <p className="text-slate-700 font-medium flex items-center justify-center gap-2">
            <Info size={18} className="text-blue-500" />
            {message}
          </p>
        </div>

        {/* Controls */}
        <div className="p-6 bg-white flex justify-center gap-4">
          {mode === 'learn' ? (
            <>
               <button
                 onClick={() => { setIsSorting(!isSorting); }}
                 disabled={isSorted}
                 className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-md transition-all ${
                   isSorting ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-blue-600 text-white hover:bg-blue-700'
                 } disabled:opacity-50 disabled:cursor-not-allowed`}
               >
                 {isSorting ? <><Pause size={20} /> Pause</> : <><Play size={20} /> Play</>}
               </button>
               
               <button
                 onClick={handleStep}
                 disabled={isSorting || isSorted}
                 className="flex items-center gap-2 px-6 py-3 rounded-full bg-white border-2 border-slate-200 text-slate-700 font-bold hover:border-blue-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <SkipForward size={20} /> Step
               </button>

               <button
                 onClick={generateArray}
                 className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
               >
                 <RotateCcw size={20} /> Reset
               </button>
            </>
          ) : (
            <>
              {/* Play Mode Controls */}
              {!isSorted && (
                <>
                  <button
                    onClick={() => handleUserDecision('swap')}
                    className="flex-1 max-w-[160px] flex flex-col items-center justify-center gap-1 px-4 py-4 rounded-xl bg-orange-100 text-orange-800 border-2 border-orange-200 hover:bg-orange-200 hover:border-orange-300 transition-all font-bold"
                  >
                    <RefreshCw size={24} />
                    SWAP
                    <span className="text-xs font-normal opacity-75">(If Left &gt; Right)</span>
                  </button>
                  
                  <button
                    onClick={() => handleUserDecision('pass')}
                    className="flex-1 max-w-[160px] flex flex-col items-center justify-center gap-1 px-4 py-4 rounded-xl bg-green-100 text-green-800 border-2 border-green-200 hover:bg-green-200 hover:border-green-300 transition-all font-bold"
                  >
                    <Check size={24} />
                    PASS
                    <span className="text-xs font-normal opacity-75">(If Left &le; Right)</span>
                  </button>
                </>
              )}

              <button
                onClick={generateArray}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-4 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 ${isSorted ? 'w-full max-w-sm bg-blue-600 text-white hover:bg-blue-700 shadow-lg' : ''}`}
              >
                {isSorted ? <span className="flex items-center gap-2"><Trophy size={20}/> Play Again</span> : <RotateCcw size={20} />}
                {!isSorted && <span className="text-xs">Reset</span>}
              </button>
            </>
          )}
        </div>
        
        {/* Footer Instructions */}
        <div className="bg-slate-50 p-4 text-xs text-slate-400 text-center border-t border-slate-200">
          Bubble Sort algorithm: Iterate through the list, compare adjacent elements, and swap them if they are in the wrong order. Repeat until sorted.
        </div>

      </div>
    </div>
  );
};

const StatBox = ({ label, value, highlight = false, color = 'text-slate-800' }) => (
  <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex flex-col items-center justify-center">
    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{label}</span>
    <span className={`text-xl font-bold ${color} ${highlight ? 'text-blue-600' : ''}`}>{value}</span>
  </div>
);

export default BubbleSortGame;
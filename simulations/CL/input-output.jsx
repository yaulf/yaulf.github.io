import React, { useState, useEffect } from 'react';
import { 
  Keyboard, 
  Monitor, 
  Mouse, 
  Printer, 
  Mic, 
  // Speaker removed
  Camera, 
  Headset,
  ScanBarcode,
  Tablet,
  ArrowLeftRight,
  CheckCircle, 
  XCircle, 
  HelpCircle,
  Trophy,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

// --- Game Data ---
const DEVICES = [
  {
    id: 'keyboard',
    name: 'Keyboard',
    type: 'Input',
    icon: <Keyboard size={120} strokeWidth={1} />, 
    description: "Allows you to type letters, numbers, and commands into the computer.",
    question: "What is the primary function of this device?",
    options: [
      "To display video games",
      "To enter alphanumeric data",
      "To print documents on paper",
      "To record high-quality sound"
    ],
    correctOption: 1
  },
  {
    id: 'monitor',
    name: 'Monitor',
    type: 'Output',
    icon: <Monitor size={120} strokeWidth={1} />,
    description: "Displays the visual output from the computer's graphics card.",
    question: "Which statement best describes this device?",
    options: [
      "It processes data like a brain",
      "It captures images from the room",
      "It displays visual information to the user",
      "It stores all your files permanently"
    ],
    correctOption: 2
  },
  {
    id: 'mouse',
    name: 'Mouse',
    type: 'Input',
    icon: <Mouse size={120} strokeWidth={1} />,
    description: "A hand-held pointing device that detects two-dimensional motion relative to a surface.",
    question: "What is this device mainly used for?",
    options: [
      "Typing long essays",
      "Controlling the on-screen cursor",
      "Scanning physical photos",
      "Cooling down the CPU"
    ],
    correctOption: 1
  },
  {
    id: 'printer',
    name: 'Printer',
    type: 'Output',
    icon: <Printer size={120} strokeWidth={1} />,
    description: "Produces a hard copy (permanent human-readable text and/or graphics) of documents.",
    question: "What is the output of this device?",
    options: [
      "Digital video files",
      "Physical paper documents",
      "Audio waves",
      "3D Holograms"
    ],
    correctOption: 1
  },
  {
    id: 'mic',
    name: 'Microphone',
    type: 'Input',
    icon: <Mic size={120} strokeWidth={1} />,
    description: "Converts sound into an electrical signal.",
    question: "How does this device interact with the computer?",
    options: [
      "It captures audio from the environment",
      "It projects sound into the room",
      "It takes photos of the user",
      "It allows you to listen to music"
    ],
    correctOption: 0
  },
  // Speaker removed
  {
    id: 'webcam',
    name: 'Webcam',
    type: 'Input',
    icon: <Camera size={120} strokeWidth={1} />,
    description: "A video camera that feeds or streams an image or video in real time.",
    question: "What is this device used for during a meeting?",
    options: [
      "Hearing what others say",
      "Typing messages in chat",
      "Transmitting your video feed",
      "Printing meeting notes"
    ],
    correctOption: 2
  },
  {
    id: 'headset',
    name: 'Headset',
    type: 'Both',
    icon: <Headset size={120} strokeWidth={1} />,
    description: "Combines headphones with a microphone. Used for two-way communication like calls or gaming.",
    question: "Why is a Headset classified as 'Both'?",
    options: [
      "It blocks outside noise",
      "It allows you to hear (Output) and speak (Input)",
      "It connects via Bluetooth",
      "It is smaller than speakers"
    ],
    correctOption: 1
  },
  {
    id: 'touchscreen',
    name: 'Touchscreen',
    type: 'Both',
    icon: <Tablet size={120} strokeWidth={1} />,
    description: "An electronic visual display that the user can control through simple or multi-touch gestures.",
    question: "Why is a touchscreen considered both Input and Output?",
    options: [
      "It has a keyboard attached",
      "It displays visual info AND accepts touch commands",
      "It is wireless",
      "It can print paper while you type"
    ],
    correctOption: 1
  },
  {
    id: 'barcode',
    name: 'Barcode Reader',
    type: 'Input',
    icon: <ScanBarcode size={120} strokeWidth={1} />,
    description: "An optical scanner that reads printed barcodes, decodes the data, and sends it to a computer.",
    question: "What is the primary use of this device?",
    options: [
      "To print receipts",
      "To scan and input product codes",
      "To display prices on a screen",
      "To generate QR codes"
    ],
    correctOption: 1
  }
];

// --- Sub-Components ---

const Card = ({ children, isSelected, isMatched, onClick, className = "" }) => (
  <div
    onClick={!isMatched ? onClick : undefined}
    className={`
      relative flex items-center justify-center p-4 rounded-xl shadow-md border-2 transition-all duration-300 cursor-pointer overflow-hidden
      ${isMatched 
        ? 'bg-green-100 border-green-500 opacity-50 cursor-default grayscale-[0.5]' 
        : isSelected 
          ? 'bg-blue-50 border-blue-500 scale-105 shadow-lg ring-2 ring-blue-200' 
          : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1'
      }
      ${className}
    `}
  >
    {isMatched && (
      <div className="absolute top-2 right-2 text-green-600 z-10">
        <CheckCircle size={32} />
      </div>
    )}
    {children}
  </div>
);

const Modal = ({ isOpen, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-blue-600 p-4 text-white font-bold text-xl flex items-center gap-2">
          <HelpCircle className="text-blue-200" />
          {title}
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [shuffledDevices, setShuffledDevices] = useState([]);
  const [shuffledNames, setShuffledNames] = useState([]);
  
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedName, setSelectedName] = useState(null);
  const [matchedIds, setMatchedIds] = useState(new Set());
  
  const [score, setScore] = useState(0);
  const [quizState, setQuizState] = useState({
    isOpen: false,
    stage: 'classify', // 'classify' | 'function' | 'result'
    device: null,
    feedback: null
  });

  const [gameComplete, setGameComplete] = useState(false);

  // Initialize Game
  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    if (matchedIds.size > 0 && matchedIds.size === DEVICES.length) {
      setGameComplete(true);
    }
  }, [matchedIds]);

  const initGame = () => {
    // Shuffle devices for the left column
    const devicesCopy = [...DEVICES].sort(() => Math.random() - 0.5);
    // Shuffle names for the right column, but keep ID reference
    const namesCopy = [...DEVICES].map(d => ({ id: d.id, name: d.name })).sort(() => Math.random() - 0.5);
    
    setShuffledDevices(devicesCopy);
    setShuffledNames(namesCopy);
    setMatchedIds(new Set());
    setScore(0);
    setGameComplete(false);
    setSelectedDevice(null);
    setSelectedName(null);
    setQuizState({ isOpen: false, stage: 'classify', device: null, feedback: null });
  };

  const handleDeviceClick = (device) => {
    if (matchedIds.has(device.id)) return;
    setSelectedDevice(device.id === selectedDevice ? null : device.id);
    checkMatch(device.id, selectedName);
  };

  const handleNameClick = (nameItem) => {
    if (matchedIds.has(nameItem.id)) return;
    setSelectedName(nameItem.id === selectedName ? null : nameItem.id);
    checkMatch(selectedDevice, nameItem.id);
  };

  const checkMatch = (devId, nameId) => {
    if (devId && nameId) {
      if (devId === nameId) {
        // Correct Match
        const device = DEVICES.find(d => d.id === devId);
        // Delay slightly to show selection state before modal
        setTimeout(() => {
          setQuizState({
            isOpen: true,
            stage: 'classify',
            device: device,
            feedback: null
          });
          // Add score for matching
          setScore(s => s + 10);
        }, 500);
      } else {
        // Incorrect Match - Reset selection after brief delay
        setTimeout(() => {
          setSelectedDevice(null);
          setSelectedName(null);
        }, 800);
      }
    }
  };

  const handleClassify = (type) => {
    const isCorrect = type === quizState.device.type;
    if (isCorrect) {
      setScore(s => s + 15);
      setQuizState(prev => ({
        ...prev,
        stage: 'function',
        feedback: { type: 'success', msg: 'Correct! Now for the function...' }
      }));
    } else {
      setScore(s => Math.max(0, s - 5));
      setQuizState(prev => ({
        ...prev,
        feedback: { type: 'error', msg: 'Incorrect. Try again!' }
      }));
      // Clear error after 1.5s
      setTimeout(() => setQuizState(prev => ({ ...prev, feedback: null })), 1500);
    }
  };

  const handleFunctionAnswer = (index) => {
    const isCorrect = index === quizState.device.correctOption;
    if (isCorrect) {
      setScore(s => s + 25);
      // Success! Close modal and lock pairs
      setMatchedIds(prev => new Set([...prev, quizState.device.id]));
      setSelectedDevice(null);
      setSelectedName(null);
      setQuizState({ isOpen: false, stage: 'classify', device: null, feedback: null });
    } else {
      setScore(s => Math.max(0, s - 5));
      setQuizState(prev => ({
        ...prev,
        feedback: { type: 'error', msg: 'Incorrect function. Read carefully!' }
      }));
      setTimeout(() => setQuizState(prev => ({ ...prev, feedback: null })), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Monitor size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-none text-slate-900">Valtorta College Input Output Master</h1>
              <p className="text-xs text-slate-500 font-medium mt-1">Tech Education Game</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Progress</div>
              <div className="font-bold text-slate-700">{matchedIds.size} / {DEVICES.length} Pairs</div>
            </div>
            <div className="bg-slate-900 text-white px-5 py-2 rounded-full font-mono font-bold text-lg shadow-inner flex items-center gap-2">
              <Trophy size={18} className="text-yellow-400" />
              {score}
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {gameComplete ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center animate-in zoom-in-50 duration-500">
            <div className="w-24 h-24 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy size={48} />
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Excellent Work!</h2>
            <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
              You matched all devices and identified their functions correctly.
              You are a hardware expert!
            </p>
            <div className="text-5xl font-bold text-blue-600 mb-8">{score} <span className="text-2xl text-slate-400">pts</span></div>
            <button 
              onClick={initGame}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={24} />
              Play Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative">
            
            {/* Connection Lines Hint (Visual only - connecting visualizer in mind) */}
            <div className="hidden md:flex absolute inset-0 pointer-events-none items-center justify-center -z-0">
               <div className="h-full border-r-2 border-dashed border-slate-300 w-px absolute left-1/2 -ml-0.5 opacity-30"></div>
            </div>

            {/* Left Column: Devices */}
            <div className="space-y-4 z-0">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2 pl-1">
                <Camera size={16} /> Device Photos
              </h2>
              {/* Changed to grid-cols-3 */}
              <div className="grid grid-cols-3 gap-4">
                {shuffledDevices.map((device) => (
                  <Card 
                    key={device.id}
                    isSelected={selectedDevice === device.id}
                    isMatched={matchedIds.has(device.id)}
                    onClick={() => handleDeviceClick(device)}
                    className="flex-col h-40 md:h-40" 
                  >
                    <div className={`flex items-center justify-center transition-all duration-300 ${matchedIds.has(device.id) ? 'text-slate-300 scale-95' : 'text-blue-600 hover:scale-110'}`}>
                      {device.icon}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right Column: Names */}
            <div className="space-y-4 z-0">
               <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2 pl-1">
                <Keyboard size={16} /> Device Names
              </h2>
              {/* Changed to grid-cols-3 */}
              <div className="grid grid-cols-3 gap-4">
                {shuffledNames.map((item) => (
                  <Card 
                    key={item.id}
                    isSelected={selectedName === item.id}
                    isMatched={matchedIds.has(item.id)}
                    onClick={() => handleNameClick(item)}
                    className="h-32 md:h-40 flex-col justify-center text-center p-2"
                  >
                     <span className={`font-bold text-base md:text-lg leading-tight ${matchedIds.has(item.id) ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                       {item.name}
                     </span>
                     {matchedIds.has(item.id) && <div className="mt-2"><CheckCircle size={20} className="text-green-500 inline-block"/></div>}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Quiz Modal */}
      <Modal 
        isOpen={quizState.isOpen} 
        title={quizState.stage === 'classify' ? "Classify Device" : "Identify Function"}
      >
        {quizState.device && (
          <div className="space-y-6">
            {/* Header Device Info */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                {/* Use a smaller version of the icon for the modal header specifically */}
                {React.cloneElement(quizState.device.icon, { size: 48 })}
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-900">{quizState.device.name}</h3>
                <p className="text-sm text-slate-500">Identify this component</p>
              </div>
            </div>

            {/* Error/Success Message */}
            {quizState.feedback && (
              <div className={`p-3 rounded-lg text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2 ${
                quizState.feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {quizState.feedback.type === 'success' ? <CheckCircle size={16}/> : <XCircle size={16}/>}
                {quizState.feedback.msg}
              </div>
            )}

            {/* Stage 1: Classify */}
            {quizState.stage === 'classify' && (
              <div>
                <p className="text-lg font-medium text-slate-700 mb-6">
                  Is the <span className="font-bold text-blue-600">{quizState.device.name}</span> an Input, Output, or Both?
                </p>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <button 
                    onClick={() => handleClassify('Input')}
                    className="flex flex-col items-center p-4 sm:p-6 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <ArrowRight className="rotate-180 mb-2 text-slate-400 group-hover:text-blue-500" />
                    <span className="font-bold text-lg">Input</span>
                  </button>
                  <button 
                    onClick={() => handleClassify('Output')}
                    className="flex flex-col items-center p-4 sm:p-6 border-2 border-slate-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
                  >
                    <ArrowRight className="mb-2 text-slate-400 group-hover:text-purple-500" />
                    <span className="font-bold text-lg">Output</span>
                  </button>
                   <button 
                    onClick={() => handleClassify('Both')}
                    className="flex flex-col items-center p-4 sm:p-6 border-2 border-slate-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all group"
                  >
                    <ArrowLeftRight className="mb-2 text-slate-400 group-hover:text-orange-500" />
                    <span className="font-bold text-lg">Both</span>
                  </button>
                </div>
              </div>
            )}

            {/* Stage 2: Function */}
            {quizState.stage === 'function' && (
              <div>
                 <p className="text-lg font-medium text-slate-700 mb-4">
                  {quizState.device.question}
                </p>
                <div className="space-y-3">
                  {quizState.device.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleFunctionAnswer(idx)}
                      className="w-full text-left p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-between group"
                    >
                      <span>{opt}</span>
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-blue-500"></div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
}
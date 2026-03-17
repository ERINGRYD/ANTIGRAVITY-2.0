import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tab } from '../types';
import BattleFeedbackView from './BattleFeedbackView';
import BattleResultsView from './BattleResultsView';
import ConfidenceSelector from './ConfidenceSelector';
import { useApp } from '../contexts/AppContext';
import { 
  ConfidenceLevel, 
  QuestionAttempt, 
  sanitizeAttempts, 
  readHistoricalAttempts, 
  saveHistoricalAttempts, 
  updateEnemyRoom, 
  persistRoomUpdate,
  readTopicRoom
} from '../utils/confidenceScoring';
import { getArchivedEnemies, shouldEnemyReturn } from '../utils/ebbinghaus';

interface BattleQuestionViewProps {
  onBack: () => void;
  mode?: 'reconhecimento' | 'critica' | 'alerta' | 'revisao' | 'todas' | 'default' | string;
  topicId?: string; // Add topicId to props
  room?: string;
  questionLimit?: number;
  mixSubjects?: boolean;
  selectedSubjectIds?: string[];
  selectedTopicIds?: string[];
}

const MOCK_QUESTIONS: any[] = [];

const BattleQuestionView: React.FC<BattleQuestionViewProps> = ({ onBack, mode = 'default', topicId = '', room, questionLimit, mixSubjects, selectedSubjectIds = [], selectedTopicIds = [] }) => {
  const { subjects, setSubjects, questions, addStudySession, addXP } = useApp();
  
  const isArenaElite = room === 'sala-2';
  const isLaboratorio = room === 'sala-3';

  // Filter questions based on mixSubjects, topicId, selectedSubjectIds, and selectedTopicIds
  const baseQuestions = questions.filter(q => {
    if (topicId) {
      // If we have a topicId, we filter by it (direct combat)
      return q.topic === topicId;
    }

    // Room filtering: Only show topics that belong to the selected mode (which corresponds to Ebbinghaus rooms)
    if (mode && mode !== 'default' && mode !== 'todas') {
      let targetRoom = mode;
      if (mode === 'revisao') targetRoom = 'vencidos';
      
      // Get current room for this topic from localStorage
      const currentTopicRoom = localStorage.getItem(`room_${q.topic}`) || 'reconhecimento';
      
      let effectiveRoom = currentTopicRoom;
      
      // If it's a "vencidos" topic, check if it's returning (which puts it in "alerta")
      if (currentTopicRoom === 'vencidos') {
        const archivedEnemies = getArchivedEnemies();
        const archived = archivedEnemies.find(a => a.topicId === q.topic);
        if (archived && shouldEnemyReturn(archived)) {
          effectiveRoom = 'alerta';
        }
      }

      if (effectiveRoom !== targetRoom) return false;
    }

    if (mixSubjects) return true;
    
    if (selectedTopicIds.length > 0 && (selectedTopicIds.includes(q.topic || ''))) return true;
    if (selectedSubjectIds.length > 0 && (selectedSubjectIds.includes(q.subject || ''))) return true;
    
    return false;
  });

  // Group questions by topic
  const groupedQuestions = [...baseQuestions].sort((a, b) => (a.topic || '').localeCompare(b.topic || ''));

  // Laboratório specific filtering: prioritize questions with explanations or higher difficulty
  const filteredQuestions = isLaboratorio 
    ? groupedQuestions.sort((a, b) => (b.explanation ? 1 : 0) - (a.explanation ? 1 : 0))
    : groupedQuestions;

  const topicQuestions = filteredQuestions.map(q => {
    let correctAnswer = '';
    let options = q.options || [];
    // Fallback for questionType if missing
    const type = q.questionType || (options.length > 0 ? 'multipla' : 'certo_errado');

    if (type === 'multipla') {
      correctAnswer = q.correctAnswerMultipla || '';
    } else if (type === 'certo_errado') {
      correctAnswer = q.correctAnswerCertoErrado || '';
      options = [
        { id: 'Certo', text: 'Certo', isCorrect: correctAnswer === 'Certo' },
        { id: 'Errado', text: 'Errado', isCorrect: correctAnswer === 'Errado' }
      ];
    } else if (type === 'flashcard') {
      correctAnswer = 'Mostrar Resposta';
      options = [{ id: 'Mostrar Resposta', text: q.flashcardAnswer || 'Sem resposta', isCorrect: true }];
    }

    return {
      id: q.id,
      text: q.text || q.enunciation || '',
      options: options,
      correctAnswer: correctAnswer,
      explanation: q.explanation || '',
      topicId: q.topic || '',
      difficulty: q.difficulty
    };
  });

  // Apply question limit
  const activeQuestions = topicQuestions.slice(0, questionLimit || 10);
  const totalQuestions = activeQuestions.length;

  // Room specific state
  const [lives, setLives] = useState(isArenaElite ? 1 : 999);
  const [timeLeft, setTimeLeft] = useState(isArenaElite ? 45 : 0);
  
  const [showHint, setShowHint] = useState(false);
  const [showTopicTransition, setShowTopicTransition] = useState(false);
  const [nextTopicName, setNextTopicName] = useState('');
  const [showInitialScreen, setShowInitialScreen] = useState(true);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedConfidence, setSelectedConfidence] = useState<ConfidenceLevel | null>(null);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [questionSeconds, setQuestionSeconds] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [sessionResults, setSessionResults] = useState<any[]>([]);
  const [sessionSummary, setSessionSummary] = useState<any>(null);
  const [isProcessingEnd, setIsProcessingEnd] = useState(false);

  const currentQuestionData = activeQuestions[currentQuestionIndex];

  // Find topic and subject names from topicId prop if available
  const resolvedEnemyInfo = useMemo(() => {
    // Helper to find topic in subjects
    const findTopic = (idOrName: string) => {
      if (!idOrName) return null;
      for (const subject of subjects) {
        const topic = subject.topics.find(t => t.id === idOrName || t.name === idOrName);
        if (topic) return { topic, subject };
      }
      return null;
    };

    // 1. Try to find by topicId prop
    if (topicId) {
      const found = findTopic(topicId);
      if (found) {
        return { 
          topicName: found.topic.name, 
          subjectName: found.subject.name,
          subjectColor: found.subject.color || '#3b82f6',
          topicIcon: found.topic.icon || 'swords'
        };
      }
    }

    // 2. If not found or no topicId, try to find from the first question
    if (activeQuestions && activeQuestions.length > 0) {
      const firstQ = activeQuestions[0];
      const found = findTopic(firstQ.topicId);
      if (found) {
        return { 
          topicName: found.topic.name, 
          subjectName: found.subject.name,
          subjectColor: found.subject.color || '#3b82f6',
          topicIcon: found.topic.icon || 'swords'
        };
      }
    }

    // 3. Fallback
    return { 
      topicName: topicId && topicId !== '' ? topicId : 'Batalha Personalizada', 
      subjectName: 'Múltiplas Matérias',
      subjectColor: '#8b5cf6',
      topicIcon: 'auto_awesome'
    };
  }, [topicId, subjects, activeQuestions]);

  const [currentTopicName, setCurrentTopicName] = useState(resolvedEnemyInfo.topicName);
  const [currentSubjectName, setCurrentSubjectName] = useState(resolvedEnemyInfo.subjectName);

  // Update names when question changes
  useEffect(() => {
    if (currentQuestionData) {
      let found = false;
      for (const subject of subjects) {
        // Try to find by ID or Name (for backward compatibility)
        const topic = subject.topics.find(t => t.id === currentQuestionData.topicId || t.name === currentQuestionData.topicId);
        if (topic) {
          setCurrentTopicName(topic.name);
          setCurrentSubjectName(subject.name);
          found = true;
          break;
        }
      }
      if (!found && !topicId) {
        setCurrentTopicName('Batalha Personalizada');
        setCurrentSubjectName('Múltiplas Matérias');
      }
    }
  }, [currentQuestionData, subjects, topicId]);

  useEffect(() => {
    if (showInitialScreen && activeQuestions.length > 0) {
      const timer = setTimeout(() => {
        setShowInitialScreen(false);
      }, 2500);
      return () => clearTimeout(timer);
    } else if (activeQuestions.length === 0) {
      setShowInitialScreen(false);
    }
  }, [showInitialScreen, activeQuestions.length]);

  const processSessionEnd = async (finalResults: any[]) => {
    if (isProcessingEnd) return;
    setIsProcessingEnd(true);

    // Group results by topicId
    const resultsByTopic = finalResults.reduce((acc, result) => {
      const tId = result.topicId || topicId; // fallback to props topicId if missing
      if (!acc[tId]) acc[tId] = [];
      acc[tId].push(result);
      return acc;
    }, {} as Record<string, any[]>);

    let lastPreviousRoom = 'reconhecimento';
    let lastNewRoom = 'reconhecimento';
    let lastWeightedScore = 0;
    let lastAccuracyRate = 0;
    let lastMemoryStability = 0;

    const sessionSummaryData = calculateResults();
    const xpEarned = sessionSummaryData.totalXp;

    for (const [currentTopicId, topicResults] of Object.entries(resultsByTopic)) {
      const results = topicResults as any[];
      // Step 1 — Session ends
      console.log('[RoomUpdate] Session ended for topic:', currentTopicId);

      // Step 2 — Collect attempts
      const rawAttempts: Partial<QuestionAttempt>[] = results.map(r => ({
        isCorrect: r.isCorrect,
        confidence: r.confidence,
        topicId: currentTopicId,
        attemptedAt: new Date().toISOString(),
      }));
      
      const currentSessionAttempts = sanitizeAttempts(rawAttempts);
      console.log('[RoomUpdate] Current session attempts:', currentSessionAttempts.length);
      console.log('[RoomUpdate] Confidence values:', currentSessionAttempts.map(a => a.confidence));

      // Step 3 — Load historical attempts
      const historicalAttempts = await readHistoricalAttempts(currentTopicId);
      console.log('[RoomUpdate] Historical attempts loaded:', historicalAttempts.length);
      
      const allAttempts = [...historicalAttempts, ...currentSessionAttempts];
      console.log('[RoomUpdate] Total attempts for calculation:', allAttempts.length);

      // Step 4 — Calculate new room
      const previousRoom = await readTopicRoom(currentTopicId) || 'reconhecimento';
      lastPreviousRoom = previousRoom;
      
      // BUG FIX: Use currentSessionAttempts instead of allAttempts to calculate the new room.
      // The user's current performance should determine if they defeat the enemy NOW,
      // rather than being dragged down by past failures.
      const { room: newRoom, weightedScore, accuracyRate, memoryStability } = updateEnemyRoom(currentTopicId, currentSessionAttempts);
      
      lastNewRoom = newRoom;
      lastWeightedScore = weightedScore;
      lastAccuracyRate = accuracyRate;
      lastMemoryStability = memoryStability;
      
      console.log('[Archive] Previous room:', previousRoom);
      console.log('[Archive] New room:', newRoom);
      console.log('[Archive] Weighted score:', weightedScore, '| threshold: 75 | passes:', weightedScore >= 75);

      // Step 5 — Persist to database
      const persistResult = await persistRoomUpdate(currentTopicId, newRoom, weightedScore, accuracyRate);
      if (persistResult) {
        await saveHistoricalAttempts(currentTopicId, allAttempts);
      }
      console.log('[RoomUpdate] Persistence success:', persistResult);

      // -------------------------------------------------------
      // ADD THIS BLOCK — this is the missing archiving trigger
      // -------------------------------------------------------
      if (newRoom === 'vencidos') {
        console.log('[Archive] Score:', weightedScore, 
          '≥ 75 — triggering archive for topic:', currentTopicId);

        const { onArchiveEnemy, loadArchivedEnemy } = await import('../utils/ebbinghaus');

        // Check if enemy was already archived (returning enemy)
        const existingArchive = loadArchivedEnemy(currentTopicId);

        // Find topic details from subjects
        let topicName = currentTopicId;
        let subjectName = 'Matéria Desconhecida';
        let subjectId = 'unknown';
        
        for (const subject of subjects) {
          const topic = subject.topics.find(t => t.id === currentTopicId || t.name === currentTopicId);
          if (topic) {
            topicName = topic.name;
            subjectName = subject.name;
            subjectId = subject.id;
            break;
          }
        }

        const totalQuestionsAvailable = questions.filter(q => q.topic === currentTopicId).length;

        await onArchiveEnemy(
          currentTopicId,
          weightedScore,
          accuracyRate,
          xpEarned,
          existingArchive,  // null if first time, ArchivedEnemy if returning
          null,             // contestDate
          topicName,        // topicName
          subjectId,        // subjectId
          subjectName,      // subjectName
          totalQuestionsAvailable
        );

        console.log('[Archive] Archive complete. Enemy removed from Battle Field.');
      }
      // -------------------------------------------------------
      // END OF ADDED BLOCK
      // -------------------------------------------------------

      // Step 7 — Update local state
      // (In a real app, this would be queryClient.invalidateQueries or dispatch)
      console.log('[RoomUpdate] UI state updated to room:', newRoom);
    }

    // Record session in history (overall)
    // (These variables were redundant and causing lint errors)
    
    // Find topic details from subjects (already found above for archiving, but let's ensure we have them)
    let tName = topicId || 'Batalha Personalizada';
    let sName = 'Múltiplas Matérias';
    let sId = 'unknown';
    
    for (const subject of subjects) {
      const topic = subject.topics.find(t => t.id === topicId || t.name === topicId);
      if (topic) {
        tName = topic.name;
        sName = subject.name;
        sId = subject.id;
        break;
      }
    }

    // Step 8 — Show ConfidenceSummary
    setSessionSummary({
      previousRoom: lastPreviousRoom,
      newRoom: lastNewRoom,
      weightedScore: lastWeightedScore,
      accuracyRate: lastAccuracyRate,
      memoryStability: lastMemoryStability
    });
    
    // Dispatch event to notify CombatView that rooms have been updated
    window.dispatchEvent(new CustomEvent('rooms_updated'));
    
    setShowResults(true);
  };

  const handleFinalizeSession = (errorReasons: Record<number, string>) => {
    const results = calculateResults();
    
    // Convert errorReasons to Record<string, number> for StudySession
    const reasonCounts: Record<string, number> = {};
    Object.values(errorReasons).forEach(reason => {
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });

    // Group results by topicId to update completedQuestions
    const resultsByTopic = sessionResults.reduce((acc, result) => {
      const tId = result.topicId || topicId;
      if (!acc[tId]) acc[tId] = 0;
      acc[tId]++;
      return acc;
    }, {} as Record<string, number>);

    // Find primary topic details for the study session log
    let primaryTopicId = topicId;
    if (!primaryTopicId && sessionResults.length > 0) {
      primaryTopicId = sessionResults[0].topicId;
    }

    let tName = primaryTopicId || 'Batalha Personalizada';
    let sName = 'Múltiplas Matérias';
    let sId = 'unknown';
    
    for (const subject of subjects) {
      const topic = subject.topics.find(t => t.id === primaryTopicId || t.name === primaryTopicId);
      if (topic) {
        tName = topic.name;
        sName = subject.name;
        sId = subject.id;
        break;
      }
    }

    addStudySession({
      subjectId: sId,
      subjectName: sName,
      topicName: tName,
      minutesStudied: Math.ceil(totalSeconds / 60),
      questionsCompleted: results.accuracy.total,
      accuracy: Math.round((results.accuracy.correct / results.accuracy.total) * 100),
      type: 'batalha',
      xpEarned: results.totalXp,
      confidenceStats: results.confidenceStats,
      errorReasons: reasonCounts
    });

    // Update completedQuestions for all topics involved
    setSubjects(prevSubjects => prevSubjects.map(subject => {
      let subjectChanged = false;
      const updatedTopics = subject.topics.map(topic => {
        if (resultsByTopic[topic.id]) {
          subjectChanged = true;
          return {
            ...topic,
            completedQuestions: (topic.completedQuestions || 0) + resultsByTopic[topic.id]
          };
        }
        return topic;
      });
      return subjectChanged ? { ...subject, topics: updatedTopics } : subject;
    }));

    addXP(results.totalXp);

    onBack();
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!showFeedback && !showResults && !showInitialScreen && !showTopicTransition) {
      timer = setInterval(() => {
        setTotalSeconds(prev => prev + 1);
        setQuestionSeconds(prev => prev + 1);
        
        if (isArenaElite) {
          setTimeLeft(prev => prev - 1);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showFeedback, showResults, isArenaElite, showInitialScreen, showTopicTransition]);

  useEffect(() => {
    if (isArenaElite && timeLeft <= 0 && !showFeedback && !showResults && !isProcessingEnd && !showInitialScreen && !showTopicTransition) {
      handleTimeUp();
    }
  }, [timeLeft, isArenaElite, showFeedback, showResults, isProcessingEnd, showInitialScreen, showTopicTransition]);

  const handleTimeUp = () => {
    // Treat as wrong answer
    setIsCorrect(false);
    
    const questionResult = {
      id: currentQuestionData.id,
      text: currentQuestionData.text,
      options: currentQuestionData.options,
      correctOptionId: currentQuestionData.correctAnswer,
      selectedOptionId: 'TIME_UP',
      timeSpent: formatTime(questionSeconds),
      timeSpentSeconds: questionSeconds,
      confidence: 'guess' as ConfidenceLevel,
      isCorrect: false,
      explanation: currentQuestionData.explanation,
      topicId: currentQuestionData.topicId
    };

    const newResults = [...sessionResults, questionResult];
    setSessionResults(newResults);
    
    handleWrongAnswer(newResults);
  };

  const handleWrongAnswer = (newResults: any[]) => {
    const newLives = lives - 1;
    setLives(newLives);
    
    if (newLives <= 0) {
      // Game over
      processSessionEnd(newResults);
    } else {
      setShowFeedback(true);
    }
  };

  useEffect(() => {
    // Animate progress bar on mount
    const timer = setTimeout(() => {
      setProgressWidth(((currentQuestionIndex + 1) / totalQuestions) * 100);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentQuestionIndex, totalQuestions]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getConfirmButtonStyle = () => {
    if (!selectedOption || !selectedConfidence) {
      return 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed';
    }
    switch (selectedConfidence) {
      case 'certain':
        return 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/30';
      case 'doubtful':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-yellow-500/30';
      case 'guess':
        return 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30';
      default:
        return 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-gray-900/20 dark:shadow-white/10';
    }
  };

  const proceedToNextQuestion = async (resultsToUse: any[]) => {
    if (currentQuestionIndex < totalQuestions - 1) {
      const nextIndex = currentQuestionIndex + 1;
      const currentTopic = activeQuestions[currentQuestionIndex].topicId;
      const nextTopic = activeQuestions[nextIndex].topicId;

      if (currentTopic !== nextTopic) {
        // Find topic name
        let tName = 'Novo Tópico';
        for (const subject of subjects) {
          const topic = subject.topics.find(t => t.id === nextTopic);
          if (topic) {
            tName = topic.name;
            break;
          }
        }
        setNextTopicName(tName);
        setShowTopicTransition(true);
        
        // Hide transition after 2 seconds
        setTimeout(() => {
          setShowTopicTransition(false);
          setCurrentQuestionIndex(nextIndex);
          setQuestionSeconds(0);
          if (isArenaElite) setTimeLeft(45);
          setSelectedOption(null);
          setSelectedConfidence(null);
          setShowFeedback(false);
          setShowHint(false);
        }, 2000);
      } else {
        setCurrentQuestionIndex(nextIndex);
        setQuestionSeconds(0);
        if (isArenaElite) setTimeLeft(45);
        setSelectedOption(null);
        setSelectedConfidence(null);
        setShowFeedback(false);
        setShowHint(false);
      }
    } else {
      await processSessionEnd(resultsToUse);
    }
  };

  const handleConfirm = async () => {
    if (!selectedOption || !selectedConfidence) return;

    const isAnswerCorrect = selectedOption === currentQuestionData.correctAnswer;
    setIsCorrect(isAnswerCorrect);

    const questionResult = {
      id: currentQuestionData.id,
      text: currentQuestionData.text,
      options: currentQuestionData.options,
      correctOptionId: currentQuestionData.correctAnswer,
      selectedOptionId: selectedOption,
      timeSpent: formatTime(questionSeconds),
      timeSpentSeconds: questionSeconds,
      confidence: selectedConfidence,
      isCorrect: isAnswerCorrect,
      explanation: currentQuestionData.explanation,
      topicId: currentQuestionData.topicId
    };

    const newResults = [...sessionResults, questionResult];
    setSessionResults(newResults);

    if (!isAnswerCorrect) {
      const newLives = lives - 1;
      setLives(newLives);
      
      if (newLives <= 0) {
        // Game over
        await processSessionEnd(newResults);
        return;
      }
    }

    if (mode === 'reconhecimento') {
      await proceedToNextQuestion(newResults);
    } else {
      setShowFeedback(true);
    }
  };

  const handleNextQuestion = async () => {
    await proceedToNextQuestion(sessionResults);
  };

  const calculateResults = () => {
    const correctCount = sessionResults.filter(r => r.isCorrect).length;
    const totalTimeSeconds = sessionResults.reduce((acc, curr) => acc + curr.timeSpentSeconds, 0);
    const avgTimeSeconds = sessionResults.length > 0 ? Math.round(totalTimeSeconds / sessionResults.length) : 0;
    
    const confidenceCounts = sessionResults.reduce((acc, curr) => {
      acc[curr.confidence] = (acc[curr.confidence] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = sessionResults.length;

    // Dynamic XP calculation based on room
    let xpPerCorrect = 50;
    let xpPerQuestion = 10;

    if (room === 'sala-2') {
      xpPerCorrect = 75;
      xpPerQuestion = 15;
    } else if (room === 'sala-3') {
      xpPerCorrect = 60;
      xpPerQuestion = 12;
    }

    return {
      totalXp: correctCount * xpPerCorrect + (total * xpPerQuestion),
      accuracy: {
        correct: correctCount,
        total: total
      },
      totalTime: formatTime(totalTimeSeconds),
      averageTime: formatTime(avgTimeSeconds),
      confidenceStats: {
        certeza: total > 0 ? Math.round(((confidenceCounts['certain'] || 0) / total) * 100) : 0,
        duvida: total > 0 ? Math.round(((confidenceCounts['doubtful'] || 0) / total) * 100) : 0,
        chute: total > 0 ? Math.round(((confidenceCounts['guess'] || 0) / total) * 100) : 0
      },
      questions: sessionResults
    };
  };

  if (activeQuestions.length === 0) {
    return (
      <div className="absolute inset-0 z-50 bg-white dark:bg-[#0B1120] flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">search_off</span>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Nenhum Inimigo Encontrado</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
          Não encontramos questões cadastradas para este tema. Adicione questões no Quartel General para poder batalhar.
        </p>
        <button 
          onClick={onBack}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors"
        >
          Voltar para o Mapa
        </button>
      </div>
    );
  }

  if (showResults) {
    return <BattleResultsView results={calculateResults()} onFinish={handleFinalizeSession} sessionSummary={sessionSummary} />;
  }

  if (showFeedback) {
    const getErrorAnalysis = () => {
      if (isCorrect) return undefined;
      
      const difficulty = currentQuestionData.difficulty;
      if (difficulty === 'DIFÍCIL') {
        return "Este é um conceito avançado. Não desanime, a repetição é a chave para a maestria.";
      }
      
      if (selectedConfidence === 'certain') {
        return "Você estava confiante, mas houve um erro de percurso. Revise a base deste conceito.";
      }
      
      return "Revise o material de apoio para fortalecer este conceito e evitar novos danos.";
    };

    return (
      <BattleFeedbackView 
        isCorrect={isCorrect}
        questionText={currentQuestionData.text}
        selectedAlt={selectedOption!}
        correctAlt={currentQuestionData.correctAnswer}
        selectedAltText={currentQuestionData.options.find(o => o.id === selectedOption)?.text || ''}
        correctAltText={currentQuestionData.options.find(o => o.id === currentQuestionData.correctAnswer)?.text || ''}
        explanation={currentQuestionData.explanation}
        errorAnalysis={getErrorAnalysis()}
        onNext={handleNextQuestion}
        onReview={() => console.log('Revisar tópico')}
      />
    );
  }

  if (activeQuestions.length === 0 && !showInitialScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-[#0B1120] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-amber-600 dark:text-amber-400">warning</span>
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Nenhuma Questão Encontrada</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xs">
          Não existem questões cadastradas para este tópico ou que atendam aos critérios selecionados.
        </p>
        <button 
          onClick={onBack}
          className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-white dark:bg-[#0B1120] text-gray-900 dark:text-[#F9FAFB] font-['Inter'] min-h-screen pb-10 antialiased selection:bg-blue-500 selection:text-white flex flex-col w-full overflow-y-auto">
      <header className="bg-white dark:bg-[#1F2937] border-b border-gray-100 dark:border-gray-800 pt-8 pb-4 sticky top-0 z-30 shadow-sm transition-colors duration-300">
        <div className="px-4 max-w-md md:max-w-3xl mx-auto">
          <div className="flex items-start justify-between mb-4">
            <button 
              onClick={onBack}
              className="p-2 -ml-2 mt-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <span className="material-icons-round">arrow_back</span>
            </button>
            <div className="flex flex-col items-center flex-1 px-2">
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full mb-1.5 border border-blue-100 dark:border-blue-800/50">
                {currentSubjectName}
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight text-center line-clamp-2 max-w-[220px]">
                {currentTopicName}
              </span>
              <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 mt-1">
                Questão {currentQuestionIndex + 1} de {totalQuestions}
              </span>
            </div>
            <div className="flex flex-col items-end gap-2 mt-1">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <span className="material-icons-round text-xl">{isMuted ? 'volume_off' : 'volume_up'}</span>
              </button>
              
              {isArenaElite && (
                <div className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg border border-red-100 dark:border-red-900/30">
                  <span className={`material-icons-round text-sm ${lives > 0 ? 'text-red-500' : 'text-red-200 dark:text-red-900/50'}`}>
                    favorite
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                <span className="material-symbols-outlined text-sm text-yellow-500 filled">bolt</span>
                <span className="text-[10px] font-bold text-yellow-700 dark:text-yellow-500 uppercase">
                  {isArenaElite ? 'Arena Elite' : isLaboratorio ? 'Laboratório' : 'Sala Principal'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            <div className="flex items-center gap-1.5 flex-1 bg-gray-50 dark:bg-gray-800 px-2 py-1.5 rounded-lg">
              <span className="material-symbols-outlined text-base">timer</span>
              <span>Total: <span className="text-gray-900 dark:text-white font-bold">{formatTime(totalSeconds)}</span></span>
            </div>
            {isArenaElite ? (
              <div className={`flex items-center gap-1.5 flex-1 px-2 py-1.5 rounded-lg border ${timeLeft <= 10 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50 animate-pulse' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30'}`}>
                <span className={`material-symbols-outlined text-base ${timeLeft <= 10 ? 'text-red-500' : 'text-blue-500'}`}>timer</span>
                <span>Tempo: <span className={`${timeLeft <= 10 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'} font-bold`}>{timeLeft}s</span></span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 flex-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <span className="material-symbols-outlined text-base text-blue-500">schedule</span>
                <span>Questão: <span className="text-blue-600 dark:text-blue-400 font-bold">{formatTime(questionSeconds)}</span></span>
              </div>
            )}
          </div>
          <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressWidth}%` }}
            ></div>
          </div>
        </div>
      </header>

      <main className="flex-grow px-4 py-6 max-w-md md:max-w-3xl mx-auto w-full space-y-6">
        <div className="flex flex-wrap gap-2 text-[10px] font-semibold">
          <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-md border border-purple-100 dark:border-purple-800">{currentSubjectName}</span>
          <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md border border-blue-100 dark:border-blue-800">{currentTopicName}</span>
          <span className="px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md border border-green-100 dark:border-green-800">{currentQuestionData.difficulty || 'Normal'}</span>
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-md">Banca: FGV</span>
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-md">2023</span>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Questão {currentQuestionIndex + 1}</h1>
              <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                {currentQuestionData.text}
              </p>
            </div>
            {isLaboratorio && currentQuestionData.explanation && (
              <button 
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-sm">lightbulb</span>
                {showHint ? 'Ocultar Dica' : 'Dica da IA'}
              </button>
            )}
          </div>
          
          {showHint && isLaboratorio && currentQuestionData.explanation && (
            <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800/50">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-purple-500 mt-0.5">smart_toy</span>
                <div>
                  <h4 className="text-sm font-bold text-purple-900 dark:text-purple-300 mb-1">Análise da IA</h4>
                  <p className="text-sm text-purple-800 dark:text-purple-400 leading-relaxed">
                    {currentQuestionData.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {currentQuestionData.options.length > 0 ? (
            currentQuestionData.options.map((option) => (
              <label 
                key={option.id}
                className={`group relative flex items-start p-4 rounded-xl border cursor-pointer transition-all shadow-sm ${
                  selectedOption === option.id 
                    ? 'border-2 border-blue-500 bg-blue-50/30 dark:bg-blue-500/5' 
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1F2937] hover:border-blue-500 dark:hover:border-blue-500'
                }`}
              >
                <div className="flex items-center h-5">
                  <input 
                    type="radio" 
                    name="question-option" 
                    className={`h-4 w-4 border-gray-300 focus:ring-blue-500 focus:ring-offset-0 dark:bg-gray-800 dark:border-gray-600 ${
                      selectedOption === option.id ? 'text-blue-500 border-blue-500' : 'text-blue-500'
                    }`}
                    checked={selectedOption === option.id}
                    onChange={() => setSelectedOption(option.id)}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <span className={`font-bold mr-2 ${selectedOption === option.id ? 'text-blue-500 dark:text-blue-500' : 'text-gray-900 dark:text-white'}`}>{option.id})</span>
                  <span className={`${selectedOption === option.id ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'}`}>{option.text}</span>
                </div>
              </label>
            ))
          ) : (
            <div className="p-8 text-center bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
              <span className="material-symbols-outlined text-amber-500 text-4xl mb-2">warning</span>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Esta questão não possui alternativas cadastradas.</p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">Por favor, edite a questão para adicionar as opções de resposta.</p>
            </div>
          )}
        </div>

        <ConfidenceSelector 
          isVisible={selectedOption !== null} 
          selectedValue={selectedConfidence}
          onSelect={(confidence) => setSelectedConfidence(confidence)} 
        />

        <div className="pt-4">
          <button 
            onClick={handleConfirm}
            disabled={!selectedOption || !selectedConfidence}
            className={`w-full text-base font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${getConfirmButtonStyle()}`}
          >
            <span className="material-symbols-outlined filled">security</span>
            Confirmar Resposta
          </button>
        </div>
      </main>
      <AnimatePresence>
        {showInitialScreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.1, opacity: 0, y: -20 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="flex flex-col items-center max-w-2xl"
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 border" style={{ backgroundColor: `${resolvedEnemyInfo.subjectColor}20`, borderColor: `${resolvedEnemyInfo.subjectColor}40` }}>
                <span className="material-symbols-outlined text-4xl" style={{ color: resolvedEnemyInfo.subjectColor }}>{resolvedEnemyInfo.topicIcon}</span>
              </div>
              <div className="flex flex-col items-center mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border mb-2" style={{ color: resolvedEnemyInfo.subjectColor, backgroundColor: `${resolvedEnemyInfo.subjectColor}10`, borderColor: `${resolvedEnemyInfo.subjectColor}30` }}>
                  {resolvedEnemyInfo.subjectName}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">swords</span>
                  INIMIGO
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">
                {resolvedEnemyInfo.topicName}
              </h1>
              <div className="flex items-center gap-3 text-slate-400 font-medium bg-slate-800/50 px-6 py-3 rounded-2xl border border-slate-700/50">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Preparando Batalha...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showTopicTransition && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center"
            >
              <span className="material-symbols-outlined text-6xl text-blue-400 mb-4 animate-bounce">
                swords
              </span>
              <h2 className="text-3xl font-black text-white mb-2">Próximo Inimigo!</h2>
              <p className="text-xl text-blue-200 font-medium">{nextTopicName}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BattleQuestionView;

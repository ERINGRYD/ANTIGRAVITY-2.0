
import React from 'react';
import { Tab } from '../types';
import BottomNav from './BottomNav';

interface BattleFeedbackViewProps {
  isCorrect: boolean;
  questionText: string;
  selectedAlt: string;
  correctAlt: string;
  selectedAltText: string;
  correctAltText: string;
  explanation: string;
  errorAnalysis?: string;
  onNext: () => void;
  onReview?: () => void;
}

const BattleFeedbackView: React.FC<BattleFeedbackViewProps> = ({ 
  isCorrect,
  questionText, 
  selectedAlt, 
  correctAlt,
  selectedAltText,
  correctAltText, 
  explanation, 
  errorAnalysis,
  onNext,
  onReview
}) => {
  return (
    <div className="fixed inset-0 z-[180] bg-[#F8FAFC] flex flex-col animate-in fade-in duration-300 overflow-y-auto no-scrollbar pb-44">
      {/* Header Adaptativo */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="px-4 py-3 flex items-center justify-between max-w-5xl mx-auto w-full">
          <button onClick={onNext} className="w-10 h-10 flex items-center justify-start text-gray-400">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
          
          <h1 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            {isCorrect ? 'Feedback de Defesa' : 'Questão 1 de 5'}
          </h1>
          
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border ${
            isCorrect 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
              : 'bg-red-50 border-red-100 text-red-600'
          }`}>
            <span className="text-[9px] font-black uppercase tracking-tighter">
              {isCorrect ? 'Defesa Bem-Sucedida' : 'Dano Recebido'}
            </span>
          </div>
        </div>
        
        {/* Barra de Progresso Colorida */}
        <div className="w-full h-1 bg-gray-50">
          <div className={`h-full w-1/5 transition-all duration-500 ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-8 space-y-8 w-full flex-1">
        {/* Hero State Area */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            {isCorrect && <div className="absolute inset-0 bg-emerald-400/20 blur-3xl rounded-full scale-150"></div>}
            <div className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-lg ${
              isCorrect 
                ? 'bg-emerald-500 shadow-emerald-500/40' 
                : 'bg-red-50 dark:bg-red-900/10 border-2 border-red-100'
            }`}>
              <span className={`material-symbols-outlined text-5xl font-variation-fill-1 ${isCorrect ? 'text-white' : 'text-red-500'}`}>
                {isCorrect ? 'shield' : 'heart_broken'}
              </span>
            </div>
          </div>
          
          <div>
            <h2 className={`text-2xl font-black tracking-tight uppercase ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
              {isCorrect ? 'Ataque Repelido!' : 'Defesa Falhou!'}
            </h2>
            <div className={`mt-3 inline-flex items-center gap-2 px-5 py-2 rounded-full text-white shadow-lg ${
              isCorrect ? 'bg-[#F59E0B] shadow-orange-500/20' : 'bg-gray-100 border border-gray-200 !text-gray-600 !shadow-none'
            }`}>
              <span className="material-symbols-outlined text-sm font-variation-fill-1">stars</span>
              <span className="text-[10px] font-black uppercase tracking-wider">
                {isCorrect ? '+25 XP (BÔNUS DE CERTEZA)' : '+5 XP (Esforço de Guerra)'}
              </span>
            </div>
          </div>
        </div>

        {/* Comparison Cards / Question Review */}
        {isCorrect ? (
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 space-y-5">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">A Questão</span>
              <p className="text-sm font-bold text-gray-600 leading-snug">{questionText}</p>
            </div>
            <div className="flex items-center p-4 bg-emerald-50/50 border-2 border-emerald-500 rounded-2xl">
              <span className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-500 text-white font-black text-xs mr-4">{selectedAlt}</span>
              <div className="flex flex-col">
                <span className="text-sm font-black text-emerald-600">{correctAltText}</span>
                <span className="text-[10px] text-emerald-600/70 font-bold">Sua resposta está correta</span>
              </div>
              <span className="material-symbols-outlined text-emerald-500 ml-auto font-variation-fill-1">check_circle</span>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-3">
            <div className="relative p-5 bg-white border-2 border-red-500 rounded-2xl shadow-sm text-left flex items-center gap-4">
              <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-red-50 text-red-500 font-black text-xs">{selectedAlt}</div>
              <div className="flex-grow">
                <p className="text-[10px] font-black text-red-500 uppercase mb-0.5">Sua Resposta</p>
                <p className="text-sm font-bold text-gray-700">{selectedAltText}</p>
              </div>
              <span className="material-symbols-outlined text-red-500 font-black">close</span>
            </div>
            <div className="relative p-5 bg-white border-2 border-emerald-500 rounded-2xl shadow-sm text-left flex items-center gap-4">
              <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 font-black text-xs">{correctAlt}</div>
              <div className="flex-grow">
                <p className="text-[10px] font-black text-emerald-500 uppercase mb-0.5">Resposta Correta</p>
                <p className="text-sm font-bold text-gray-700">{correctAltText}</p>
              </div>
              <span className="material-symbols-outlined text-emerald-500 font-black">check_circle</span>
            </div>
          </div>
        )}

        {/* Explanation Section */}
        <section className={`rounded-2xl p-6 border transition-colors ${
          isCorrect 
            ? 'bg-slate-50 border-slate-200/50' 
            : 'bg-slate-50 border-gray-200'
        }`}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm ${isCorrect ? 'bg-blue-500' : 'bg-gray-400'}`}>
              <span className="material-symbols-outlined text-xl">{isCorrect ? 'psychology' : 'description'}</span>
            </div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
              {isCorrect ? 'Explicação do Mestre' : 'Relatório de Falha'}
            </h3>
          </div>
          
          <div className="space-y-4">
            {!isCorrect && errorAnalysis && (
              <div>
                <p className="text-[10px] font-black text-red-500 uppercase mb-1">Onde você errou</p>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">{errorAnalysis}</p>
                <div className="h-px bg-gray-200 my-4"></div>
              </div>
            )}
            
            <div>
              {(!isCorrect) && <p className="text-[10px] font-black text-emerald-500 uppercase mb-1">Lógica Correta</p>}
              <p className="text-sm text-slate-600 leading-relaxed font-medium">{explanation}</p>
            </div>
          </div>
        </section>
      </main>

      {/* Fixed Footer Action */}
      <div className={`fixed bottom-[84px] left-0 right-0 px-4 pb-6 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/95 to-transparent z-50`}>
        <div className={`max-w-md mx-auto ${!isCorrect ? 'grid grid-cols-2 gap-3' : ''}`}>
          {!isCorrect && (
            <button 
              onClick={onReview}
              className="h-14 border-2 border-gray-200 text-gray-500 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all bg-white"
            >
              <span className="material-symbols-outlined text-lg">history_edu</span>
              Revisar Tópico
            </button>
          )}
          <button 
            onClick={onNext}
            className={`h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${!isCorrect ? 'w-full' : 'w-full'}`}
          >
            <span className="text-xs font-black uppercase tracking-widest">Próxima Questão</span>
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </button>
        </div>
      </div>

      <BottomNav activeTab={Tab.BATALHA} setActiveTab={() => {}} />
    </div>
  );
};

export default BattleFeedbackView;

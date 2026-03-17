
import React from 'react';

const ColiseumView: React.FC = () => {
  const players = [
    { rank: 1, name: 'Lucas Estudo', xp: '12.450', avatar: 'https://i.pravatar.cc/150?u=lucas', isMe: false },
    { rank: 2, name: 'Bia Concursos', xp: '10.200', avatar: 'https://i.pravatar.cc/150?u=bia', isMe: false },
    { rank: 3, name: 'João Silva', xp: '9.800', avatar: 'https://i.pravatar.cc/150?u=joao', isMe: true },
    { rank: 4, name: 'Mariana P.', xp: '8.400', avatar: 'https://i.pravatar.cc/150?u=mari', isMe: false },
    { rank: 5, name: 'Pedro Tech', xp: '7.100', avatar: 'https://i.pravatar.cc/150?u=pedro', isMe: false },
  ];

  return (
    <main className="px-5 py-6 flex flex-col gap-8 animate-in fade-in duration-500 pb-32">
      <section className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-[32px] p-8 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-white/5 opacity-50 flex items-center justify-center pointer-events-none">
          <span className="material-icons-round text-[200px] -rotate-12">emoji_events</span>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 shadow-2xl">
            <span className="material-icons-round text-4xl text-white">military_tech</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Liga de Ouro</h2>
          <p className="text-xs font-black uppercase tracking-widest opacity-80">Você está no Top 3% este mês</p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">Torneios Ativos</h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1">
          <TournamentCard 
            title="Grande Slam da Redação" 
            participants="1.2k" 
            time="2h 14m" 
            color="bg-indigo-600" 
          />
          <TournamentCard 
            title="Desafio Lógica Pura" 
            participants="840" 
            time="Terminado" 
            color="bg-emerald-600" 
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Ranking Global</h3>
          <button className="text-[10px] font-black text-blue-500 uppercase">Ver Ranking Completo</button>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          {players.map((player) => (
            <div 
              key={player.rank} 
              className={`flex items-center gap-4 p-4 border-b border-slate-50 dark:border-slate-800 last:border-0 transition-colors ${player.isMe ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
            >
              <div className="w-6 text-center text-xs font-black text-slate-400 dark:text-slate-500">
                {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : player.rank}
              </div>
              <img src={player.avatar} alt={player.name} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" />
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-bold truncate ${player.isMe ? 'text-blue-600' : 'text-slate-900 dark:text-white'}`}>
                  {player.name} {player.isMe && '(Você)'}
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Liga de Ouro</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-slate-900 dark:text-white">{player.xp}</span>
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase">XP</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

const TournamentCard: React.FC<{ title: string; participants: string; time: string; color: string }> = ({ title, participants, time, color }) => (
  <div className={`${color} min-w-[240px] rounded-3xl p-5 text-white shadow-lg relative overflow-hidden group cursor-pointer active:scale-95 transition-all`}>
    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform"></div>
    <h4 className="text-sm font-black leading-tight mb-4 pr-8">{title}</h4>
    <div className="flex items-center justify-between mt-auto">
      <div className="flex items-center gap-2">
        <span className="material-icons-round text-xs">groups</span>
        <span className="text-[10px] font-black uppercase">{participants} participando</span>
      </div>
      <div className="bg-white/20 px-2 py-1 rounded-lg text-[9px] font-black uppercase backdrop-blur-md">
        {time}
      </div>
    </div>
  </div>
);

export default ColiseumView;

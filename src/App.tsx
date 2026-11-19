/**
 * @license
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useState, useEffect } from 'react';
import { Medal, Trophy, Scale, X } from 'lucide-react';
import agplLicenseText from '../LICENSE?raw';
import { WORD_CARDS } from './data/wordsDeck';
import { DuelArenaView } from './components/DuelArenaView';
import { SyllableWorkshopView } from './components/SyllableWorkshopView';
import { GrimoireCollectionView } from './components/GrimoireCollectionView';
import { BnccGuideView, StudentProgressStats } from './components/BnccGuideView';
import { soundEngine } from './utils/sound';

type ActiveSection = 'arena' | 'oficina' | 'grimorio' | 'bncc';
type RankTier = 'Bronze' | 'Prata' | 'Ouro';

interface RankInfo {
  tier: RankTier;
  title: string;
  nextMilestone: string;
  badgeClasses: string;
  iconColor: string;
}

function getStudentRank(matchesWon: number): RankInfo {
  if (matchesWon >= 5) {
    return {
      tier: 'Ouro',
      title: 'Selo Ouro · Mestre das Sílabas',
      nextMilestone: 'Nível máximo alcançado!',
      badgeClasses: 'bg-amber-500/20 border-amber-400/70 text-amber-200',
      iconColor: 'text-amber-400',
    };
  }
  if (matchesWon >= 2) {
    return {
      tier: 'Prata',
      title: 'Selo Prata · Guardião Sonoro',
      nextMilestone: `Faltam ${5 - matchesWon} vitórias para Ouro`,
      badgeClasses: 'bg-slate-300/15 border-slate-300/60 text-slate-100',
      iconColor: 'text-slate-200',
    };
  }
  return {
    tier: 'Bronze',
    title: 'Selo Bronze · Aprendiz Silábico',
    nextMilestone: `Faltam ${2 - matchesWon} vitórias para Prata`,
    badgeClasses: 'bg-amber-900/40 border-amber-600/60 text-amber-200',
    iconColor: 'text-amber-500',
  };
}

const INITIAL_UNLOCKED_IDS = [
  'card-sol',
  'card-cafe',
  'card-fada',
  'card-jacare',
  'card-boneca',
  'card-lampada',
  'card-borboleta',
  'card-relampago',
];

const INITIAL_STATS: StudentProgressStats = {
  matchesPlayed: 0,
  matchesWon: 0,
  winStreak: 0,
  correctDivisions: 0,
  correctCountClass: 0,
  correctTonicClass: 0,
  recentChallengingWords: [],
};

export default function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('arena');
  const [workshopCardId, setWorkshopCardId] = useState<string | null>(null);
  const [isLicenseOpen, setIsLicenseOpen] = useState<boolean>(false);

  const [unlockedCardIds, setUnlockedCardIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('grimorio_unlocked_cards_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_UNLOCKED_IDS;
  });

  const [stats, setStats] = useState<StudentProgressStats>(() => {
    try {
      const saved = localStorage.getItem('grimorio_student_stats_v1');
      if (saved) {
        return { ...INITIAL_STATS, ...JSON.parse(saved) };
      }
    } catch {}
    return INITIAL_STATS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('grimorio_unlocked_cards_v1', JSON.stringify(unlockedCardIds));
    } catch {}
  }, [unlockedCardIds]);

  useEffect(() => {
    try {
      localStorage.setItem('grimorio_student_stats_v1', JSON.stringify(stats));
    } catch {}
  }, [stats]);

  const handleUnlockCard = (cardId: string) => {
    setUnlockedCardIds((prev) => (prev.includes(cardId) ? prev : [...prev, cardId]));
  };

  const handleUnlockAllForStudy = () => {
    setUnlockedCardIds(WORD_CARDS.map((c) => c.id));
  };

  const handleRecordChallengingWord = (attempt: {
    cardId: string;
    perfect: boolean;
    divisionCorrect: boolean;
    countCorrect: boolean;
    tonicCorrect: boolean;
  }) => {
    setStats((prev) => {
      const existing = (prev.recentChallengingWords || []).filter(
        (item) => item.cardId !== attempt.cardId
      );
      // Place non-perfect or newly faced challenging words at the front, keeping up to 3
      const updated = [attempt, ...existing].slice(0, 3);
      return {
        ...prev,
        recentChallengingWords: updated,
      };
    });
  };

  const handleRecordMatchStats = (matchResult: {
    correctDivisions: number;
    correctCountClass: number;
    correctTonicClass: number;
    wonMatch: boolean;
  }) => {
    setStats((prev) => ({
      ...prev,
      matchesPlayed: prev.matchesPlayed + 1,
      matchesWon: prev.matchesWon + (matchResult.wonMatch ? 1 : 0),
      winStreak: matchResult.wonMatch ? (prev.winStreak || 0) + 1 : 0,
      correctDivisions: prev.correctDivisions + matchResult.correctDivisions,
      correctCountClass: prev.correctCountClass + matchResult.correctCountClass,
      correctTonicClass: prev.correctTonicClass + matchResult.correctTonicClass,
    }));
  };

  const handleResetProgress = () => {
    soundEngine.playClick();
    setUnlockedCardIds(INITIAL_UNLOCKED_IDS);
    setStats(INITIAL_STATS);
  };

  const switchSection = (sec: ActiveSection) => {
    soundEngine.playClick();
    setActiveSection(sec);
  };

  const handleReviewInWorkshop = (cardId: string) => {
    soundEngine.playClick();
    setWorkshopCardId(cardId);
    setActiveSection('oficina');
  };

  const currentRank = getStudentRank(stats.matchesWon);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1F17] text-[#F8FAFC]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-emerald-900/80 bg-[#0B1F17]/95 sticky top-0 z-30 backdrop-blur-sm">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#arena"
          onClick={(e) => {
            e.preventDefault();
            switchSection('arena');
          }}
          className="text-xl font-display font-bold tracking-tight text-amber-400 whitespace-nowrap shrink-0"
        >
          Grimório das Sílabas
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-300 overflow-x-auto">
          <a
            href="#arena"
            onClick={(e) => {
              e.preventDefault();
              switchSection('arena');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeSection === 'arena'
                ? 'text-amber-400 underline underline-offset-8 decoration-2 decoration-amber-400 font-semibold'
                : 'hover:text-white hover:underline hover:underline-offset-8'
            }`}
          >
            Arena de Duelo
          </a>
          <a
            href="#oficina"
            onClick={(e) => {
              e.preventDefault();
              switchSection('oficina');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeSection === 'oficina'
                ? 'text-amber-400 underline underline-offset-8 decoration-2 decoration-amber-400 font-semibold'
                : 'hover:text-white hover:underline hover:underline-offset-8'
            }`}
          >
            Oficina Tônica
          </a>
          <a
            href="#grimorio"
            onClick={(e) => {
              e.preventDefault();
              switchSection('grimorio');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeSection === 'grimorio'
                ? 'text-amber-400 underline underline-offset-8 decoration-2 decoration-amber-400 font-semibold'
                : 'hover:text-white hover:underline hover:underline-offset-8'
            }`}
          >
            Grimório
          </a>
          <a
            href="#bncc"
            onClick={(e) => {
              e.preventDefault();
              switchSection('bncc');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeSection === 'bncc'
                ? 'text-amber-400 underline underline-offset-8 decoration-2 decoration-amber-400 font-semibold'
                : 'hover:text-white hover:underline hover:underline-offset-8'
            }`}
          >
            Guia BNCC
          </a>
        </nav>

        {/* Zone 3: Student Rank Seal (Bronze, Prata, Ouro) & Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => switchSection('bncc')}
            title={`${currentRank.title} (${stats.matchesWon} ${
              stats.matchesWon === 1 ? 'vitória' : 'vitórias'
            }) — ${currentRank.nextMilestone}`}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${currentRank.badgeClasses}`}
          >
            {currentRank.tier === 'Ouro' ? (
              <Trophy className={`w-3.5 h-3.5 shrink-0 ${currentRank.iconColor}`} />
            ) : (
              <Medal className={`w-3.5 h-3.5 shrink-0 ${currentRank.iconColor}`} />
            )}
            <span>Selo {currentRank.tier}</span>
            <span aria-hidden="true" className="opacity-60">·</span>
            <span className="font-mono-num">
              {stats.matchesWon} {stats.matchesWon === 1 ? 'vitória' : 'vitórias'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => switchSection(activeSection === 'grimorio' ? 'arena' : 'grimorio')}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-sm"
          >
            {activeSection === 'grimorio' ? 'Jogar Duelo' : 'Ver Cartas'}
          </button>
        </div>
      </header>

      {/* Main Content Container (1440px Desktop Baseline) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeSection === 'arena' && (
          <DuelArenaView
            unlockedCardIds={unlockedCardIds}
            winStreak={stats.winStreak || 0}
            onUnlockCard={handleUnlockCard}
            onRecordChallengingWord={handleRecordChallengingWord}
            onRecordMatchStats={handleRecordMatchStats}
            onOpenGrimoire={() => switchSection('grimorio')}
          />
        )}

        {activeSection === 'oficina' && (
          <SyllableWorkshopView initialCardId={workshopCardId} />
        )}

        {activeSection === 'grimorio' && (
          <GrimoireCollectionView
            unlockedCardIds={unlockedCardIds}
            winStreak={stats.winStreak || 0}
            onUnlockAllForStudy={handleUnlockAllForStudy}
          />
        )}

        {activeSection === 'bncc' && (
          <BnccGuideView
            stats={stats}
            unlockedCount={unlockedCardIds.length}
            onResetProgress={handleResetProgress}
            onGoToDuel={() => switchSection('arena')}
            onReviewInWorkshop={handleReviewInWorkshop}
          />
        )}
      </main>

      {/* Quiet Pedagogical Footer */}
      <footer className="border-t border-emerald-900/70 py-5 px-6 text-center text-xs text-slate-400">
        <span>Grimório das Sílabas</span>
        <span aria-hidden="true" className="mx-2">·</span>
        <span>Jogo Educativo para o 3º Ano do Ensino Fundamental</span>
        <span aria-hidden="true" className="mx-2">·</span>
        <span>Habilidades BNCC EF03LP05 e EF03LP06</span>
        <span aria-hidden="true" className="mx-2">·</span>
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setIsLicenseOpen(true);
          }}
          className="text-amber-300/90 hover:text-amber-300 underline underline-offset-4 transition-colors cursor-pointer"
        >
          Licença GNU AGPL v3
        </button>
      </footer>

      {/* GNU AGPL v3 License Modal */}
      {isLicenseOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="agpl-license-title"
          onClick={() => setIsLicenseOpen(false)}
        >
          <div
            className="w-full max-w-3xl max-h-[82vh] flex flex-col rounded-2xl bg-[#132A20] border border-amber-500/40 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-emerald-800/80 bg-[#0B1F17]">
              <div className="flex items-center gap-2.5">
                <Scale className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <h2
                    id="agpl-license-title"
                    className="text-base font-display font-bold text-white"
                  >
                    GNU Affero General Public License v3.0 (AGPL-3.0-or-later)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Grimório das Sílabas é software livre sob os termos da licença GNU AGPL v3.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLicenseOpen(false)}
                aria-label="Fechar janela da licença"
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-900/70 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-[#0B1F17]/70">
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-200">
                {agplLicenseText}
              </pre>
            </div>

            <div className="flex items-center justify-between gap-4 px-6 py-3.5 border-t border-emerald-800/80 bg-[#0B1F17]">
              <span className="text-xs text-slate-400">
                SPDX-License-Identifier: AGPL-3.0-or-later
              </span>
              <button
                type="button"
                onClick={() => setIsLicenseOpen(false)}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

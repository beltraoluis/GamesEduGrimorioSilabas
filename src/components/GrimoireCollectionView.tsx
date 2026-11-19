import React, { useState } from 'react';
import { BookOpen, Sparkles, Unlock, Lock, Flame, Crown, Gem } from 'lucide-react';
import {
  WORD_CARDS,
  WordCard,
  SyllableCountCategory,
  TonicCategory,
  CardRarity,
} from '../data/wordsDeck';
import { CollectibleCard } from './CollectibleCard';
import { soundEngine } from '../utils/sound';

interface GrimoireCollectionViewProps {
  unlockedCardIds: string[];
  winStreak: number;
  onUnlockAllForStudy: () => void;
}

export const GrimoireCollectionView: React.FC<GrimoireCollectionViewProps> = ({
  unlockedCardIds,
  winStreak,
  onUnlockAllForStudy,
}) => {
  const [filterCount, setFilterCount] = useState<SyllableCountCategory | 'Todas'>('Todas');
  const [filterTonic, setFilterTonic] = useState<TonicCategory | 'Todas'>('Todas');
  const [filterRarity, setFilterRarity] = useState<CardRarity | 'Todas'>('Todas');
  const [inspectedCard, setInspectedCard] = useState<WordCard | null>(WORD_CARDS[0]);

  const filteredCards = WORD_CARDS.filter((card) => {
    const matchCount = filterCount === 'Todas' || card.countCategory === filterCount;
    const matchTonic = filterTonic === 'Todas' || card.tonicCategory === filterTonic;
    const matchRarity = filterRarity === 'Todas' || card.rarity === filterRarity;
    return matchCount && matchTonic && matchRarity;
  });

  const unlockedCount = unlockedCardIds.length;
  const totalCount = WORD_CARDS.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      {/* Top Collection Header & Progress Bar */}
      <div className="rounded-2xl bg-[#132A20] border border-amber-500/30 p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <div className="text-xs font-medium text-amber-300 flex flex-wrap items-center gap-2">
            <span>Álbum de Cartas Colecionáveis</span>
            <span aria-hidden="true">·</span>
            <span>Sistema de Raridade Visual</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 text-amber-200 font-semibold">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Sequência Atual: {winStreak} {winStreak === 1 ? 'vitória seguida' : 'vitórias seguidas'}</span>
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
            Grimório das Cartas Silábicas
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Cartas desbloqueadas exibem bordas estilizadas e brilho suave conforme sua raridade:{' '}
            <strong className="text-emerald-300">Comum</strong> (esmeralda),{' '}
            <strong className="text-sky-300">Rara</strong> (safira, 1ª vitória),{' '}
            <strong className="text-amber-300">Épica</strong> (âmbar, 2 vitórias seguidas) e{' '}
            <strong className="text-yellow-300">Lendária</strong> (ouro radiante, 3+ vitórias consecutivas).
          </p>
        </div>

        {/* Collection Completion Progress */}
        <div className="p-4 rounded-xl bg-[#0B1F17] border border-emerald-800/80 min-w-[260px] space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Cartas Descobertas</span>
            <span className="font-mono-num font-bold text-amber-400">
              {unlockedCount} / {totalCount} ({progressPercent}%)
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-[#132A20] overflow-hidden border border-emerald-800">
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {unlockedCount < totalCount && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playSuccess();
                onUnlockAllForStudy();
              }}
              className="w-full py-1.5 px-3 rounded-lg bg-emerald-900/70 hover:bg-emerald-800 text-amber-200 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Unlock className="w-3.5 h-3.5 text-amber-400" />
              <span>Revelar Todas para Estudo</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Segmented Filter Controls */}
      <div className="rounded-xl bg-[#132A20] border border-emerald-800/70 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-2">
              Número de Sílabas:
            </span>
            {(
              ['Todas', 'Monossílaba', 'Dissílaba', 'Trissílaba', 'Polissílaba'] as const
            ).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setFilterCount(cat);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  filterCount === cat
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-[#0B1F17] text-slate-300 hover:text-white border border-emerald-800/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-2">
              Sílaba Tônica:
            </span>
            {(['Todas', 'Oxítona', 'Paroxítona', 'Proparoxítona'] as const).map(
              (tonic) => (
                <button
                  key={tonic}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setFilterTonic(tonic);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    filterTonic === tonic
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-[#0B1F17] text-slate-300 hover:text-white border border-emerald-800/60'
                  }`}
                >
                  {tonic}
                </button>
              )
            )}
          </div>
        </div>

        {/* Rarity Tier Filter Bar */}
        <div className="pt-2.5 border-t border-emerald-800/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-2">
              Raridade & Moldura:
            </span>
            {(['Todas', 'Comum', 'Rara', 'Épica', 'Lendária'] as const).map((rarity) => (
              <button
                key={rarity}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setFilterRarity(rarity);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  filterRarity === rarity
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'bg-[#0B1F17] text-slate-300 hover:text-white border border-emerald-800/60'
                }`}
              >
                {rarity === 'Lendária' && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                {(rarity === 'Rara' || rarity === 'Épica') && (
                  <Gem className="w-3.5 h-3.5 text-sky-400" />
                )}
                <span>{rarity}</span>
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400">
            <span>Exibindo {filteredCards.length} cartas</span>
          </div>
        </div>
      </div>

      {/* Inspected Card Detail Spotlight */}
      {inspectedCard && (
        <div className="rounded-2xl bg-[#132A20] border border-amber-500/40 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-amber-300">
              <Sparkles className="w-4 h-4" />
              <span>Carta Selecionada no Grimório</span>
              <span aria-hidden="true">·</span>
              <span>Raridade {inspectedCard.rarity}</span>
              <span aria-hidden="true">·</span>
              <span>{inspectedCard.element}</span>
              <span aria-hidden="true">·</span>
              <span>Habilidade {inspectedCard.bnccSkill}</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-2xl font-display font-bold text-white">
                {inspectedCard.word}
              </h2>
              <span className="text-base font-mono-num font-bold text-amber-400">
                {inspectedCard.syllables.join(' - ')}
              </span>
              <span className="text-xs text-emerald-300 font-semibold">
                ({inspectedCard.countCategory} · {inspectedCard.tonicCategory} · Sílaba
                tônica: "{inspectedCard.syllables[inspectedCard.tonicIndex]}")
              </span>
            </div>
            <p className="text-xs text-slate-300 pt-1">
              <strong>Curiosidade:</strong> {inspectedCard.curiosity} —{' '}
              <span className="text-amber-200">{inspectedCard.callHint}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {unlockedCardIds.includes(inspectedCard.id) ? (
              <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>Carta Conquistada</span>
              </span>
            ) : (
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                <Lock className="w-4 h-4" />
                <span>Bloqueada (Vença duelos para revelar)</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Cards Collection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredCards.map((card) => {
          const isUnlocked = unlockedCardIds.includes(card.id);
          return (
            <CollectibleCard
              key={card.id}
              card={card}
              isSelected={inspectedCard?.id === card.id}
              isUnlocked={isUnlocked}
              showSolution={true}
              onSelect={(c) => setInspectedCard(c)}
            />
          );
        })}
      </div>
    </div>
  );
};


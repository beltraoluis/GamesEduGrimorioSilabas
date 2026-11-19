import React, { useState } from 'react';
import { Volume2, Sparkles, Shield, Swords, Crown, Gem } from 'lucide-react';
import { WordCard, CardRarity, CARD_ARTWORKS } from '../data/wordsDeck';
import { soundEngine } from '../utils/sound';

interface CollectibleCardProps {
  card: WordCard;
  isSelected?: boolean;
  isPlayable?: boolean;
  isUnlocked?: boolean;
  showSolution?: boolean;
  compact?: boolean;
  onSelect?: (card: WordCard) => void;
}

interface RarityVisualConfig {
  unlockedBorder: string;
  selectedBorder: string;
  softGlowShadow: string;
  surfaceBg: string;
  rarityTextColor: string;
  dividerBorder: string;
  imageFrameBorder: string;
  shimmerGradient: string;
}

const RARITY_STYLES: Record<CardRarity, RarityVisualConfig> = {
  Comum: {
    unlockedBorder: 'border-emerald-600/60 hover:border-emerald-400',
    selectedBorder: 'border-emerald-400 ring-2 ring-emerald-400/40 -translate-y-2',
    softGlowShadow: 'shadow-[0_0_16px_-4px_rgba(16,185,129,0.28)]',
    surfaceBg: 'bg-[#FDFBF7]',
    rarityTextColor: 'text-emerald-800 font-semibold',
    dividerBorder: 'border-emerald-900/15',
    imageFrameBorder: 'border-emerald-700/25',
    shimmerGradient: 'from-emerald-400/10 via-transparent to-emerald-500/5',
  },
  Rara: {
    unlockedBorder: 'border-sky-500/75 hover:border-sky-300',
    selectedBorder: 'border-sky-400 ring-2 ring-sky-400/45 -translate-y-2',
    softGlowShadow: 'shadow-[0_0_22px_-3px_rgba(14,165,233,0.42)]',
    surfaceBg: 'bg-gradient-to-b from-[#F8FCFF] via-[#FDFBF7] to-[#F0F9FF]',
    rarityTextColor: 'text-sky-800 font-bold',
    dividerBorder: 'border-sky-900/15',
    imageFrameBorder: 'border-sky-500/35',
    shimmerGradient: 'from-sky-400/15 via-transparent to-sky-500/10',
  },
  Épica: {
    unlockedBorder: 'border-amber-500/80 hover:border-amber-300',
    selectedBorder: 'border-amber-400 ring-2 ring-amber-400/50 -translate-y-2',
    softGlowShadow: 'shadow-[0_0_24px_-3px_rgba(245,158,11,0.46)]',
    surfaceBg: 'bg-gradient-to-b from-[#FFFDF7] via-[#FDFBF7] to-[#FEF3C7]/40',
    rarityTextColor: 'text-amber-800 font-bold',
    dividerBorder: 'border-amber-900/15',
    imageFrameBorder: 'border-amber-500/40',
    shimmerGradient: 'from-amber-400/18 via-transparent to-amber-500/10',
  },
  Lendária: {
    unlockedBorder: 'border-amber-400 ring-1 ring-amber-300/60 hover:border-yellow-200',
    selectedBorder: 'border-yellow-300 ring-2 ring-amber-400/70 -translate-y-2',
    softGlowShadow: 'shadow-[0_0_30px_-2px_rgba(251,191,36,0.62)]',
    surfaceBg: 'bg-gradient-to-b from-[#FFFBEB] via-[#FDFBF7] to-[#FEF3C7]/65',
    rarityTextColor: 'text-amber-900 font-extrabold',
    dividerBorder: 'border-amber-700/25',
    imageFrameBorder: 'border-amber-400/70',
    shimmerGradient: 'from-amber-300/25 via-yellow-200/10 to-amber-500/20',
  },
};

export const CollectibleCard: React.FC<CollectibleCardProps> = ({
  card,
  isSelected = false,
  isPlayable = true,
  isUnlocked = true,
  showSolution = false,
  compact = false,
  onSelect,
}) => {
  const [imgError, setImgError] = useState(false);

  const artworkSrc = CARD_ARTWORKS[card.artworkType];
  const rarityStyle = RARITY_STYLES[card.rarity];

  const handleCardClick = () => {
    if (onSelect && isPlayable) {
      soundEngine.playClick();
      onSelect(card);
    }
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.speakWord(card.word, false);
  };

  const borderTheme = isSelected
    ? `${rarityStyle.selectedBorder} ${isUnlocked ? rarityStyle.softGlowShadow : 'shadow-md'}`
    : isUnlocked
    ? `${rarityStyle.unlockedBorder} ${rarityStyle.softGlowShadow} hover:-translate-y-1`
    : 'border-slate-700/70 opacity-75 shadow-sm';

  return (
    <div
      onClick={handleCardClick}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect && isPlayable ? 0 : undefined}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onSelect && isPlayable) {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={`group relative overflow-hidden flex flex-col justify-between rounded-xl ${
        isUnlocked ? rarityStyle.surfaceBg : 'bg-[#F1F5F9]'
      } text-[#0F172A] border-2 transition-all duration-150 select-none ${borderTheme} ${
        onSelect && isPlayable ? 'cursor-pointer' : ''
      } ${compact ? 'p-3 w-48 shrink-0' : 'p-4 w-full'}`}
    >
      {/* Subtle Ambient Rarity Aura Overlay when Unlocked */}
      {isUnlocked && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 bg-gradient-to-tr ${rarityStyle.shimmerGradient}`}
        />
      )}

      {/* Inner Filigree Frame for Lendária & Rara/Épica unlocked cards */}
      {isUnlocked && (card.rarity === 'Lendária' || card.rarity === 'Épica') && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-1 rounded-lg border border-amber-500/25"
        />
      )}

      {/* Top Card Header: Rarity Tier & Base Power */}
      <div
        className={`relative z-10 flex items-center justify-between gap-2 pb-2 border-b ${rarityStyle.dividerBorder}`}
      >
        <div className="flex items-center gap-1 text-xs truncate">
          {card.rarity === 'Lendária' ? (
            <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
          ) : card.rarity === 'Rara' || card.rarity === 'Épica' ? (
            <Gem
              className={`w-3.5 h-3.5 shrink-0 ${
                card.rarity === 'Rara' ? 'text-sky-600' : 'text-amber-600'
              }`}
              aria-hidden="true"
            />
          ) : null}
          <span className={isUnlocked ? rarityStyle.rarityTextColor : 'text-slate-600 font-medium'}>
            {card.rarity}
          </span>
          <span aria-hidden="true" className="mx-1 text-slate-400">·</span>
          <span className="text-slate-600 font-medium">{card.bnccSkill}</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-amber-800 font-mono-num shrink-0">
          <Swords className="w-3.5 h-3.5 text-amber-600" />
          <span>ATQ {card.basePower}</span>
        </div>
      </div>

      {/* Card Illustration Slot with Zero-Broken-Image Policy Fallback */}
      <div
        className={`relative z-10 w-full overflow-hidden rounded-lg bg-slate-900 my-2.5 border ${
          isUnlocked ? rarityStyle.imageFrameBorder : 'border-slate-400/30'
        } ${compact ? 'h-24' : 'h-36'}`}
      >
        {!imgError ? (
          <img
            src={artworkSrc}
            alt={`Ilustração da carta ${card.word}`}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-transform duration-200 group-hover:scale-105 ${
              !isUnlocked ? 'grayscale contrast-75' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-950 via-slate-900 to-amber-950 text-amber-300 p-2 text-center">
            <Shield className="w-7 h-7 mb-1 opacity-80" />
            <span className="text-xs font-display">{card.element}</span>
          </div>
        )}

        {/* Scrim overlay at bottom of image for word legibility & audio action */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-2 flex items-end justify-between">
          <span className="text-[11px] font-medium text-amber-200/95 truncate">
            {card.element}
          </span>
          <button
            type="button"
            onClick={handleSpeak}
            title={`Ouvir pronúncia de ${card.word}`}
            aria-label={`Ouvir pronúncia de ${card.word}`}
            className="w-7 h-7 rounded-md bg-amber-500/90 hover:bg-amber-400 text-slate-950 flex items-center justify-center transition-colors shrink-0"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Word & Syllable Structure */}
      <div className="relative z-10 my-1 text-center">
        <h3
          className={`font-display font-bold tracking-wide text-slate-900 ${
            compact ? 'text-lg' : 'text-xl'
          }`}
        >
          {card.word}
        </h3>

        {showSolution ? (
          <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1">
            {card.syllables.map((syl, index) => {
              const isTonic = index === card.tonicIndex;
              return (
                <React.Fragment key={`${card.id}-syl-${index}`}>
                  <span
                    className={`text-xs font-mono-num px-1.5 py-0.5 rounded ${
                      isTonic
                        ? 'bg-amber-500/20 text-amber-900 font-bold underline decoration-amber-600 decoration-2'
                        : 'text-slate-600 font-medium'
                    }`}
                    title={isTonic ? 'Sílaba Tônica (mais forte)' : 'Sílaba Átona'}
                  >
                    {syl}
                  </span>
                  {index < card.syllables.length - 1 && (
                    <span className="text-slate-400 text-xs font-bold">-</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          <p className="mt-1 text-xs text-slate-500">
            Divida e classifique para conjurar!
          </p>
        )}
      </div>

      {/* Footer Metadata (Zero-Pill Unboxed Text with · separator) */}
      <div
        className={`relative z-10 mt-2 pt-2 border-t ${rarityStyle.dividerBorder} flex items-center justify-between text-xs text-slate-600`}
      >
        {showSolution ? (
          <div className="truncate">
            <span className="font-semibold text-slate-800">{card.countCategory}</span>
            <span aria-hidden="true" className="mx-1.5">·</span>
            <span className="font-semibold text-amber-800">{card.tonicCategory}</span>
          </div>
        ) : (
          <div className="truncate text-slate-500">
            <span>{card.word.length} letras</span>
            <span aria-hidden="true" className="mx-1.5">·</span>
            <span>Duelo Silábico</span>
          </div>
        )}

        {isUnlocked && (
          <Sparkles
            className={`w-3.5 h-3.5 shrink-0 ${
              card.rarity === 'Lendária'
                ? 'text-amber-500'
                : card.rarity === 'Rara'
                ? 'text-sky-600'
                : 'text-emerald-600'
            }`}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};


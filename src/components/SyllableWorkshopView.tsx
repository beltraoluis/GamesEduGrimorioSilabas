import React, { useState, useEffect } from 'react';
import { Volume2, Sparkles, Scissors, HelpCircle, CheckCircle2 } from 'lucide-react';
import {
  WORD_CARDS,
  WordCard,
  SyllableCountCategory,
  TonicCategory,
} from '../data/wordsDeck';
import { soundEngine } from '../utils/sound';

interface SyllableWorkshopViewProps {
  initialCardId?: string | null;
}

export const SyllableWorkshopView: React.FC<SyllableWorkshopViewProps> = ({
  initialCardId,
}) => {
  const [selectedCard, setSelectedCard] = useState<WordCard>(() => {
    if (initialCardId) {
      const found = WORD_CARDS.find((c) => c.id === initialCardId);
      if (found) return found;
    }
    return WORD_CARDS[17]; // LÂMPADA default
  });
  const [filterCount, setFilterCount] = useState<SyllableCountCategory | 'Todas'>('Todas');
  const [filterTonic, setFilterTonic] = useState<TonicCategory | 'Todas'>('Todas');
  const [testCuts, setTestCuts] = useState<number[]>([]);

  useEffect(() => {
    if (initialCardId) {
      const found = WORD_CARDS.find((c) => c.id === initialCardId);
      if (found) {
        setSelectedCard(found);
      }
    }
  }, [initialCardId]);

  const filteredWords = WORD_CARDS.filter((card) => {
    const matchCount = filterCount === 'Todas' || card.countCategory === filterCount;
    const matchTonic = filterTonic === 'Todas' || card.tonicCategory === filterTonic;
    return matchCount && matchTonic;
  });

  const handleSelectWord = (card: WordCard) => {
    soundEngine.playClick();
    setSelectedCard(card);
    // Pre-populate correct cuts so student can inspect or toggle
    const cuts: number[] = [];
    let acc = 0;
    for (let i = 0; i < card.syllables.length - 1; i++) {
      acc += card.syllables[i].length;
      cuts.push(acc - 1);
    }
    setTestCuts(cuts);
  };

  // Helper to get position label counting from end (Última, Penúltima, Antepenúltima)
  const getRetrogradePosition = (index: number, total: number) => {
    const posFromEnd = total - index;
    if (posFromEnd === 1) return { badge: '1ª do fim (Última)', rule: 'Oxítona' };
    if (posFromEnd === 2) return { badge: '2ª do fim (Penúltima)', rule: 'Paroxítona' };
    if (posFromEnd === 3) return { badge: '3ª do fim (Antepenúltima)', rule: 'Proparoxítona' };
    return { badge: `${posFromEnd}ª do fim`, rule: 'Sílaba Átona' };
  };

  return (
    <div className="space-y-6">
      {/* Header Description */}
      <div className="rounded-2xl bg-[#132A20] border border-amber-500/30 p-6">
        <div className="text-xs font-medium text-amber-300">
          Laboratório Interativo de Gramática · 3º Ano
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white mt-1">
          Oficina da Sílaba Tônica & Contagem Retroativa
        </h1>
        <p className="mt-2 text-sm text-slate-300 max-w-3xl">
          Sabia que para descobrir se uma palavra é <strong>Oxítona</strong>,{' '}
          <strong>Paroxítona</strong> ou <strong>Proparoxítona</strong> nós sempre
          contamos as sílabas <strong>de trás para frente</strong> (da última até a
          antepenúltima)? Escolha uma palavra ao lado e experimente no palco sonoro!
        </p>
      </div>

      {/* Two-Zone Sandbox Layout (Education & Simulations Reference §2.A) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT STAGE (7 cols): Interactive Visual Acoustic & Syllable Diagram */}
        <div className="lg:col-span-7 rounded-2xl bg-[#132A20] border border-amber-500/35 p-6 space-y-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-emerald-800/70">
            <div>
              <div className="text-xs text-slate-300">
                <span>Palavra em Análise</span>
                <span aria-hidden="true" className="mx-1.5">·</span>
                <span>Habilidade {selectedCard.bnccSkill}</span>
              </div>
              <h2 className="text-3xl font-display font-bold text-amber-400 mt-0.5">
                {selectedCard.word}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => soundEngine.speakWord(selectedCard.word, false)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Volume2 className="w-4 h-4" />
                <span>Ouvir Normal</span>
              </button>
              <button
                type="button"
                onClick={() => soundEngine.speakWord(selectedCard.word, true)}
                className="px-3.5 py-2 rounded-xl bg-[#0B1F17] hover:bg-emerald-950 text-amber-200 border border-amber-500/30 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Chamar no Portão (Lento)</span>
              </button>
            </div>
          </div>

          {/* Interactive Acoustic Pulse Visualization (Counting from Last to Antepenultimate) */}
          <div className="p-5 rounded-xl bg-[#0B1F17] border border-emerald-800/80 space-y-4">
            <div className="flex items-center justify-between text-xs text-emerald-200">
              <span>Mapa de Intensidade da Voz (Clique em cada sílaba para ouvir):</span>
              <span className="font-mono-num text-amber-300">
                ← Contamos de trás para frente
              </span>
            </div>

            <div className="flex flex-wrap items-end justify-center gap-4 pt-4 pb-2">
              {selectedCard.syllables.map((syl, index) => {
                const isTonic = index === selectedCard.tonicIndex;
                const retro = getRetrogradePosition(
                  index,
                  selectedCard.syllables.length
                );

                return (
                  <button
                    key={`stage-syl-${index}`}
                    type="button"
                    onClick={() => soundEngine.speakWord(syl.toLowerCase(), false)}
                    className="group flex flex-col items-center focus:outline-none"
                  >
                    {/* Intensity Bar Pillar */}
                    <div className="text-[11px] font-mono-num mb-1.5 text-amber-300 font-semibold">
                      {isTonic ? '▲ TÔNICA (FORTE)' : '● ÁTONA (SUAVE)'}
                    </div>

                    <div
                      className={`w-24 md:w-28 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                        isTonic
                          ? 'h-28 bg-amber-500 text-slate-950 border-amber-200 shadow-lg scale-105'
                          : 'h-20 bg-[#132A20] hover:bg-emerald-900/60 text-white border-emerald-700/70'
                      }`}
                    >
                      <span className="text-2xl font-display font-bold">{syl}</span>
                      <span
                        className={`text-[11px] font-mono-num mt-1 ${
                          isTonic ? 'text-slate-900 font-bold' : 'text-slate-300'
                        }`}
                      >
                        { index + 1 }ª sílaba
                      </span>
                    </div>

                    {/* Retrograde Position from End */}
                    <div
                      className={`mt-2 text-xs text-center px-2 py-1 rounded ${
                        isTonic
                          ? 'text-amber-300 font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      <div>{retro.badge}</div>
                      {isTonic && (
                        <div className="text-amber-400 font-display text-sm mt-0.5">
                          → {selectedCard.tonicCategory}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Two Classification Summary Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#0B1F17]/90 border border-emerald-800/70">
              <div className="text-xs text-slate-400">
                1. Quanto ao Número de Sílabas (EF03LP05)
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-display font-bold text-white">
                  {selectedCard.countCategory}
                </span>
                <span className="text-xs font-mono-num text-emerald-300">
                  ({selectedCard.syllables.length}{' '}
                  {selectedCard.syllables.length === 1 ? 'sílaba' : 'sílabas'})
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-300">
                {selectedCard.syllables.length === 1 &&
                  'Tem apenas 1 sílaba pronunciada de uma só vez.'}
                {selectedCard.syllables.length === 2 &&
                  'Dividida em 2 impulsos sonoros (duas sílabas).'}
                {selectedCard.syllables.length === 3 &&
                  'Dividida em 3 impulsos sonoros (três sílabas).'}
                {selectedCard.syllables.length >= 4 &&
                  'Possui 4 ou mais sílabas, por isso é Polissílaba.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1F17]/90 border border-amber-500/40">
              <div className="text-xs text-amber-300/90">
                2. Quanto à Sílaba Tônica (EF03LP06)
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-display font-bold text-amber-400">
                  {selectedCard.tonicCategory}
                </span>
                <span className="text-xs font-mono-num text-amber-200">
                  (Força em "{selectedCard.syllables[selectedCard.tonicIndex]}")
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-300">
                {selectedCard.tonicCategory === 'Oxítona' &&
                  'A sílaba mais forte é a ÚLTIMA da palavra.'}
                {selectedCard.tonicCategory === 'Paroxítona' &&
                  'A sílaba mais forte é a PENÚLTIMA (segunda de trás para frente).'}
                {selectedCard.tonicCategory === 'Proparoxítona' &&
                  'A sílaba mais forte é a ANTEPENÚLTIMA (terceira de trás para frente) e sempre leva acento!'}
              </p>
            </div>
          </div>

          {/* Call Hint & Grammatical Explanation */}
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-2 text-sm">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>Como Testar Chamando no Portão:</span>
            </div>
            <p className="text-amber-100">{selectedCard.callHint}</p>
            <p className="text-xs text-slate-300 pt-1 border-t border-amber-500/20">
              <strong>Curiosidade Gramatical:</strong> {selectedCard.curiosity}
            </p>
          </div>
        </div>

        {/* RIGHT DECK (5 cols): Interactive Word Selector & Filters */}
        <div className="lg:col-span-5 rounded-2xl bg-[#132A20] border border-emerald-800/80 p-5 space-y-4">
          <h3 className="text-lg font-display font-bold text-white">
            Escolha uma Palavra para Investigar
          </h3>

          {/* Filter by Number of Syllables */}
          <div>
            <span className="text-xs text-slate-400 block mb-1.5">
              Filtrar por Quantidade de Sílabas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(
                ['Todas', 'Monossílaba', 'Dissílaba', 'Trissílaba', 'Polissílaba'] as const
              ).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterCount(cat)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    filterCount === cat
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-[#0B1F17] text-slate-300 hover:text-white border border-emerald-800/70'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Filter by Tonic Syllable */}
          <div>
            <span className="text-xs text-slate-400 block mb-1.5">
              Filtrar por Posição da Sílaba Tônica:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(['Todas', 'Oxítona', 'Paroxítona', 'Proparoxítona'] as const).map(
                (tonic) => (
                  <button
                    key={tonic}
                    type="button"
                    onClick={() => setFilterTonic(tonic)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      filterTonic === tonic
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-[#0B1F17] text-slate-300 hover:text-white border border-emerald-800/70'
                    }`}
                  >
                    {tonic}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Word List Buttons */}
          <div className="grid grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1 pt-1">
            {filteredWords.map((card) => {
              const isCurrent = selectedCard.id === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleSelectWord(card)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-amber-500/20 border-amber-400 text-white shadow-sm'
                      : 'bg-[#0B1F17] hover:bg-emerald-950/80 border-emerald-800/60 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-display font-bold text-base text-white">
                      {card.word}
                    </span>
                    {isCurrent && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400 truncate">
                    <span>{card.countCategory}</span>
                    <span aria-hidden="true" className="mx-1">·</span>
                    <span className="text-amber-300">{card.tonicCategory}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

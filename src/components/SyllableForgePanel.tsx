import React, { useState, useEffect } from 'react';
import {
  Scissors,
  Volume2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Swords,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import {
  WordCard,
  SyllableCountCategory,
  TonicCategory,
} from '../data/wordsDeck';
import { soundEngine } from '../utils/sound';

interface SyllableForgePanelProps {
  card: WordCard;
  onCompleteSpell: (result: {
    card: WordCard;
    divisionCorrect: boolean;
    countCorrect: boolean;
    tonicIndexCorrect: boolean;
    tonicCategoryCorrect: boolean;
    totalPower: number;
    perfectCombo: boolean;
  }) => void;
  onCancel: () => void;
}

const COUNT_OPTIONS: { label: SyllableCountCategory; subtitle: string }[] = [
  { label: 'Monossílaba', subtitle: '1 sílaba' },
  { label: 'Dissílaba', subtitle: '2 sílabas' },
  { label: 'Trissílaba', subtitle: '3 sílabas' },
  { label: 'Polissílaba', subtitle: '4 ou + sílabas' },
];

const TONIC_OPTIONS: { label: TonicCategory; subtitle: string }[] = [
  { label: 'Oxítona', subtitle: 'Última forte' },
  { label: 'Paroxítona', subtitle: 'Penúltima forte' },
  { label: 'Proparoxítona', subtitle: 'Antepenúltima forte' },
];

export const SyllableForgePanel: React.FC<SyllableForgePanelProps> = ({
  card,
  onCompleteSpell,
  onCancel,
}) => {
  // Cut indices after letter i (0 to card.word.length - 2)
  const [cutIndices, setCutIndices] = useState<number[]>([]);
  const [selectedCountCat, setSelectedCountCat] = useState<SyllableCountCategory | null>(null);
  const [selectedTonicIdx, setSelectedTonicIdx] = useState<number | null>(null);
  const [selectedTonicCat, setSelectedTonicCat] = useState<TonicCategory | null>(null);
  const [showCallHint, setShowCallHint] = useState<boolean>(false);
  const [evaluated, setEvaluated] = useState<boolean>(false);

  // Reset state whenever card changes
  useEffect(() => {
    setCutIndices([]);
    setSelectedCountCat(null);
    setSelectedTonicIdx(card.syllables.length === 1 ? 0 : null);
    setSelectedTonicCat(null);
    setShowCallHint(false);
    setEvaluated(false);
  }, [card]);

  // Compute user's divided syllables based on cutIndices
  const userSyllables: string[] = React.useMemo(() => {
    const sortedCuts = [...cutIndices].sort((a, b) => a - b);
    const result: string[] = [];
    let start = 0;
    for (const cutAfter of sortedCuts) {
      result.push(card.word.slice(start, cutAfter + 1));
      start = cutAfter + 1;
    }
    result.push(card.word.slice(start));
    return result;
  }, [card.word, cutIndices]);

  // Automatically select tonic syllable if there is only 1 syllable currently
  useEffect(() => {
    if (userSyllables.length === 1) {
      setSelectedTonicIdx(0);
    } else if (selectedTonicIdx !== null && selectedTonicIdx >= userSyllables.length) {
      setSelectedTonicIdx(null);
    }
  }, [userSyllables.length, selectedTonicIdx]);

  const toggleCut = (index: number) => {
    if (evaluated) return;
    soundEngine.playSyllableCut();
    setCutIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const resetCuts = () => {
    if (evaluated) return;
    soundEngine.playClick();
    setCutIndices([]);
    setSelectedTonicIdx(0);
  };

  // Helper to get position label from end (Última, Penúltima, Antepenúltima)
  const getPositionFromEndLabel = (index: number, total: number): string => {
    const posFromEnd = total - index;
    if (posFromEnd === 1) return 'Última sílaba';
    if (posFromEnd === 2) return 'Penúltima sílaba';
    if (posFromEnd === 3) return 'Antepenúltima sílaba';
    return `${posFromEnd}ª do fim`;
  };

  // Evaluate correctness
  const isDivisionCorrect =
    userSyllables.length === card.syllables.length &&
    userSyllables.every((syl, i) => syl === card.syllables[i]);

  const isCountCorrect = selectedCountCat === card.countCategory;
  const isTonicIndexCorrect = isDivisionCorrect && selectedTonicIdx === card.tonicIndex;
  const isTonicCategoryCorrect = selectedTonicCat === card.tonicCategory;

  const canEvaluate =
    selectedCountCat !== null &&
    selectedTonicIdx !== null &&
    selectedTonicCat !== null;

  const calculateAttackResult = () => {
    let bonus = 0;
    if (isDivisionCorrect) bonus += 12;
    if (isCountCorrect) bonus += 10;
    if (isTonicIndexCorrect) bonus += 10;
    if (isTonicCategoryCorrect) bonus += 12;

    const perfectCombo =
      isDivisionCorrect &&
      isCountCorrect &&
      isTonicIndexCorrect &&
      isTonicCategoryCorrect;

    // Even if the student misses some steps, give them base power or partial bonus so they learn from feedback
    const activeBase =
      isDivisionCorrect || isCountCorrect || isTonicCategoryCorrect
        ? card.basePower
        : Math.round(card.basePower * 0.5);

    const totalPower = activeBase + bonus + (perfectCombo ? 10 : 0);

    return {
      card,
      divisionCorrect: isDivisionCorrect,
      countCorrect: isCountCorrect,
      tonicIndexCorrect: isTonicIndexCorrect,
      tonicCategoryCorrect: isTonicCategoryCorrect,
      totalPower,
      perfectCombo,
    };
  };

  const handleConfirmVerify = () => {
    if (!canEvaluate || evaluated) return;
    setEvaluated(true);
    const res = calculateAttackResult();
    if (res.perfectCombo) {
      soundEngine.playCriticalAttack();
    } else if (res.divisionCorrect || res.countCorrect || res.tonicCategoryCorrect) {
      soundEngine.playSuccess();
    } else {
      soundEngine.playError();
    }
  };

  const handleLaunchSpell = () => {
    const res = calculateAttackResult();
    onCompleteSpell(res);
  };

  const letters = card.word.split('');

  return (
    <div className="rounded-2xl bg-[#132A20] border border-amber-500/35 p-5 md:p-6 shadow-xl text-[#F8FAFC]">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-emerald-800/60">
        <div>
          <div className="text-xs text-amber-300/90 font-medium">
            <span>Forja Silábica de Duelo</span>
            <span aria-hidden="true" className="mx-1.5">·</span>
            <span>Habilidades {card.bnccSkill}</span>
          </div>
          <h3 className="text-xl md:text-2xl font-display font-bold text-white mt-0.5">
            Conjurar Carta: <span className="text-amber-400">{card.word}</span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => soundEngine.speakWord(card.word, false)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-amber-200 border border-amber-500/30 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>Ouvir Palavra</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setShowCallHint((prev) => !prev);
              soundEngine.speakWord(card.word, true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Dica do Portão</span>
          </button>

          {!evaluated && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors whitespace-nowrap shrink-0"
            >
              Trocar Carta
            </button>
          )}
        </div>
      </div>

      {/* Pedagogical Hint Banner ("Dica do Portão") */}
      {showCallHint && (
        <div className="mt-4 p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-100 text-sm flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-300">
              Truque de Chamar a Palavra no Portão:
            </p>
            <p className="mt-0.5 text-amber-100/95">{card.callHint}</p>
            <p className="mt-1 text-xs text-amber-300/80">
              A sílaba que demora mais tempo quando você chama a palavra de longe é a{' '}
              <strong>Sílaba Tônica</strong>!
            </p>
          </div>
        </div>
      )}

      {/* STEP 1: Interactive Syllable Cutter */}
      <div className="mt-5">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <label className="text-sm font-semibold text-emerald-100">
            01. Divisão Silábica — Clique na tesoura entre as letras para separar as sílabas:
          </label>
          {cutIndices.length > 0 && !evaluated && (
            <button
              type="button"
              onClick={resetCuts}
              className="flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Juntar letras</span>
            </button>
          )}
        </div>

        <div className="p-4 rounded-xl bg-[#0B1F17] border border-emerald-800/70 flex flex-wrap items-center justify-center gap-1.5">
          {letters.map((letter, idx) => {
            const isCutAfter = cutIndices.includes(idx);
            const isLast = idx === letters.length - 1;

            return (
              <React.Fragment key={`letter-${idx}`}>
                <span className="w-11 h-12 md:w-12 md:h-14 rounded-lg bg-[#FDFBF7] text-[#0F172A] font-display font-bold text-xl md:text-2xl flex items-center justify-center shadow-sm border-2 border-amber-500/30 select-none">
                  {letter}
                </span>

                {!isLast && (
                  <button
                    type="button"
                    disabled={evaluated}
                    onClick={() => toggleCut(idx)}
                    aria-label={
                      isCutAfter
                        ? `Remover corte entre ${letter} e ${letters[idx + 1]}`
                        : `Cortar sílaba entre ${letter} e ${letters[idx + 1]}`
                    }
                    title={isCutAfter ? 'Clique para juntar' : 'Clique para separar a sílaba aqui'}
                    className={`group relative h-11 px-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                      isCutAfter
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md scale-105'
                        : 'bg-emerald-900/50 hover:bg-amber-500/25 text-emerald-300/70 hover:text-amber-300 border border-dashed border-emerald-700/70'
                    }`}
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-mono-num leading-none mt-0.5">
                      {isCutAfter ? '-' : '+'}
                    </span>
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-emerald-200/80">
          <div>
            <span>Sua divisão atual: </span>
            <strong className="text-amber-300 font-mono-num text-sm">
              {userSyllables.join(' - ')}
            </strong>
          </div>
          <div className="font-mono-num">
            Total contado: <strong className="text-white">{userSyllables.length}</strong>{' '}
            {userSyllables.length === 1 ? 'sílaba' : 'sílabas'}
          </div>
        </div>
      </div>

      {/* STEP 2 & STEP 3 in 2-Column Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* STEP 2: Number of Syllables Classification (EF03LP05) */}
        <div className="p-4 rounded-xl bg-[#0B1F17]/80 border border-emerald-800/60 flex flex-col justify-between">
          <div>
            <span className="text-sm font-semibold text-emerald-100 block mb-3">
              02. Classificação pelo Número de Sílabas (EF03LP05):
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {COUNT_OPTIONS.map((opt) => {
                const isSelected = selectedCountCat === opt.label;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    disabled={evaluated}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedCountCat(opt.label);
                    }}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold shadow-sm'
                        : 'bg-[#132A20] hover:bg-emerald-900/60 text-slate-200 border-emerald-800/80'
                    }`}
                  >
                    <div className="text-sm font-semibold whitespace-nowrap truncate">
                      {opt.label}
                    </div>
                    <div
                      className={`text-xs mt-0.5 ${
                        isSelected ? 'text-slate-900 font-medium' : 'text-emerald-300/75'
                      }`}
                    >
                      {opt.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* STEP 3: Tonic Syllable & Position Classification (EF03LP06) */}
        <div className="p-4 rounded-xl bg-[#0B1F17]/80 border border-emerald-800/60 flex flex-col justify-between">
          <div>
            <span className="text-sm font-semibold text-emerald-100 block mb-2">
              03. Toque na Sílaba Tônica (a mais forte) e classifique (EF03LP06):
            </span>

            {/* Interactive Syllable Blocks to Pick the Tonic One */}
            <div className="flex flex-wrap items-center gap-2 my-3 p-2.5 rounded-lg bg-[#132A20] border border-emerald-800/50">
              {userSyllables.map((syl, idx) => {
                const isTonicSelected = selectedTonicIdx === idx;
                const posLabel = getPositionFromEndLabel(idx, userSyllables.length);
                return (
                  <button
                    key={`pick-tonic-${idx}`}
                    type="button"
                    disabled={evaluated}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedTonicIdx(idx);
                    }}
                    className={`px-3.5 py-2 rounded-lg font-mono-num text-sm transition-all flex flex-col items-center min-w-[68px] border ${
                      isTonicSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-200 font-bold shadow-sm scale-105'
                        : 'bg-[#0B1F17] hover:bg-emerald-900/70 text-white border-emerald-700/70'
                    }`}
                  >
                    <span className="text-base font-bold">{syl}</span>
                    <span
                      className={`text-[10px] mt-0.5 whitespace-nowrap ${
                        isTonicSelected ? 'text-slate-900 font-semibold' : 'text-emerald-300/70'
                      }`}
                    >
                      {posLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tonic Category Buttons */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {TONIC_OPTIONS.map((opt) => {
                const isSelected = selectedTonicCat === opt.label;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    disabled={evaluated}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedTonicCat(opt.label);
                    }}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold shadow-sm'
                        : 'bg-[#132A20] hover:bg-emerald-900/60 text-slate-200 border-emerald-800/80'
                    }`}
                  >
                    <div className="text-xs md:text-sm font-semibold whitespace-nowrap truncate">
                      {opt.label}
                    </div>
                    <div
                      className={`text-[11px] mt-0.5 whitespace-nowrap truncate ${
                        isSelected ? 'text-slate-900 font-medium' : 'text-emerald-300/75'
                      }`}
                    >
                      {opt.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Evaluation & Pedagogical Feedback Area */}
      {evaluated && (
        <div className="mt-6 p-4 rounded-xl bg-[#0B1F17] border border-amber-500/40 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-display font-bold text-lg text-amber-300">
              Resultado da Análise Silábica
            </h4>
            <div className="text-sm font-mono-num font-bold text-white">
              Poder Total Conjurado:{' '}
              <span className="text-amber-400 text-base">
                {calculateAttackResult().totalPower} ATQ
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Feedback 1: Division */}
            <div
              className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                isDivisionCorrect
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-100'
                  : 'bg-rose-950/50 border-rose-500/40 text-rose-100'
              }`}
            >
              {isDivisionCorrect ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold">
                  {isDivisionCorrect ? '✓ Divisão Correta (+12 ATQ)' : '✕ Atenção na Divisão'}
                </div>
                <div className="mt-0.5">
                  Correto: <strong className="font-mono-num">{card.syllables.join(' - ')}</strong> (
                  {card.syllables.length}{' '}
                  {card.syllables.length === 1 ? 'sílaba' : 'sílabas'})
                </div>
              </div>
            </div>

            {/* Feedback 2: Syllable Count */}
            <div
              className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                isCountCorrect
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-100'
                  : 'bg-rose-950/50 border-rose-500/40 text-rose-100'
              }`}
            >
              {isCountCorrect ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold">
                  {isCountCorrect
                    ? '✓ Quantidade Correta (+10 ATQ)'
                    : '✕ Classificação de Sílabas'}
                </div>
                <div className="mt-0.5">
                  Esta palavra é <strong>{card.countCategory}</strong>.
                </div>
              </div>
            </div>

            {/* Feedback 3: Tonic Syllable */}
            <div
              className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                isTonicIndexCorrect && isTonicCategoryCorrect
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-100'
                  : 'bg-rose-950/50 border-rose-500/40 text-rose-100'
              }`}
            >
              {isTonicIndexCorrect && isTonicCategoryCorrect ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold">
                  {isTonicIndexCorrect && isTonicCategoryCorrect
                    ? '✓ Sílaba Tônica Perfeita (+22 ATQ)'
                    : '✕ Sílaba Tônica'}
                </div>
                <div className="mt-0.5">
                  A mais forte é <strong>{card.syllables[card.tonicIndex]}</strong> (
                  <strong>{card.tonicCategory}</strong>).
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-amber-200/90 pt-1">
            <strong>Explicação do Grimório:</strong> {card.curiosity}
          </p>
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-6 flex items-center justify-end gap-3">
        {!evaluated ? (
          <button
            type="button"
            disabled={!canEvaluate}
            onClick={handleConfirmVerify}
            className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
              canEvaluate
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Verificar & Carregar Feitiço</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleLaunchSpell}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Lançar Ataque na Arena</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

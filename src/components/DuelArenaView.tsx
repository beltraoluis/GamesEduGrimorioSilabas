import React, { useState } from 'react';
import {
  Swords,
  Shield,
  Volume2,
  VolumeX,
  RotateCcw,
  Award,
  BookOpen,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import {
  WordCard,
  WORD_CARDS,
  OPPONENT_BOSSES,
  OpponentBoss,
  CARD_ARTWORKS,
  ARENA_TABLE_IMAGE,
} from '../data/wordsDeck';
import { CollectibleCard } from './CollectibleCard';
import { SyllableForgePanel } from './SyllableForgePanel';
import { soundEngine } from '../utils/sound';

export type GameState = 'TITLE_MENU' | 'PLAYING' | 'ROUND_SUMMARY' | 'GAME_OVER';

interface DuelLogEntry {
  id: string;
  round: number;
  word: string;
  syllablesJoined: string;
  countCat: string;
  tonicCat: string;
  damageDealt: number;
  damageTaken: number;
  perfect: boolean;
}

interface DuelArenaViewProps {
  unlockedCardIds: string[];
  winStreak: number;
  onUnlockCard: (cardId: string) => void;
  onRecordChallengingWord: (attempt: {
    cardId: string;
    perfect: boolean;
    divisionCorrect: boolean;
    countCorrect: boolean;
    tonicCorrect: boolean;
  }) => void;
  onRecordMatchStats: (stats: {
    correctDivisions: number;
    correctCountClass: number;
    correctTonicClass: number;
    wonMatch: boolean;
  }) => void;
  onOpenGrimoire: () => void;
}

export const DuelArenaView: React.FC<DuelArenaViewProps> = ({
  unlockedCardIds,
  winStreak,
  onUnlockCard,
  onRecordChallengingWord,
  onRecordMatchStats,
  onOpenGrimoire,
}) => {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [selectedBoss, setSelectedBoss] = useState<OpponentBoss>(OPPONENT_BOSSES[0]);
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [bossHp, setBossHp] = useState<number>(OPPONENT_BOSSES[0].maxHp);
  const [round, setRound] = useState<number>(1);
  const [hand, setHand] = useState<WordCard[]>([]);
  const [drawPile, setDrawPile] = useState<WordCard[]>([]);
  const [activeCard, setActiveCard] = useState<WordCard | null>(null);
  const [duelLogs, setDuelLogs] = useState<DuelLogEntry[]>([]);
  const [newlyUnlockedCards, setNewlyUnlockedCards] = useState<WordCard[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.isMuted);
  const [bossImgError, setBossImgError] = useState<boolean>(false);
  const [arenaBgError, setArenaBgError] = useState<boolean>(false);
  const [matchTelemetry, setMatchTelemetry] = useState({
    correctDivisions: 0,
    correctCountClass: 0,
    correctTonicClass: 0,
  });

  // Shuffle helper
  const shuffleCards = (cards: WordCard[]): WordCard[] => {
    const copy = [...cards];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const startDuel = (boss: OpponentBoss) => {
    soundEngine.playClick();
    setSelectedBoss(boss);
    setPlayerHp(100);
    setBossHp(boss.maxHp);
    setRound(1);
    setActiveCard(null);
    setDuelLogs([]);
    setNewlyUnlockedCards([]);
    setMatchTelemetry({
      correctDivisions: 0,
      correctCountClass: 0,
      correctTonicClass: 0,
    });

    const shuffled = shuffleCards(WORD_CARDS);
    setHand(shuffled.slice(0, 4));
    setDrawPile(shuffled.slice(4));
    setGameState('PLAYING');
  };

  const toggleAudioMute = () => {
    soundEngine.isMuted = !soundEngine.isMuted;
    setIsMuted(soundEngine.isMuted);
  };

  const handleSpellComplete = (result: {
    card: WordCard;
    divisionCorrect: boolean;
    countCorrect: boolean;
    tonicIndexCorrect: boolean;
    tonicCategoryCorrect: boolean;
    totalPower: number;
    perfectCombo: boolean;
  }) => {
    const newBossHp = Math.max(0, bossHp - result.totalPower);

    // If student got a perfect combo, shield blocks 50% of boss counter-attack
    const bossCounterDamage =
      newBossHp === 0
        ? 0
        : result.perfectCombo
        ? Math.max(4, Math.round(selectedBoss.baseAttack * 0.4))
        : selectedBoss.baseAttack;

    const newPlayerHp = Math.max(0, playerHp - bossCounterDamage);

    // Update match stats
    const updatedStats = {
      correctDivisions:
        matchTelemetry.correctDivisions + (result.divisionCorrect ? 1 : 0),
      correctCountClass:
        matchTelemetry.correctCountClass + (result.countCorrect ? 1 : 0),
      correctTonicClass:
        matchTelemetry.correctTonicClass +
        (result.tonicIndexCorrect && result.tonicCategoryCorrect ? 1 : 0),
    };
    setMatchTelemetry(updatedStats);

    // Record word faced in the Arena for the Last 3 Challenging Words review widget
    onRecordChallengingWord({
      cardId: result.card.id,
      perfect: result.perfectCombo,
      divisionCorrect: result.divisionCorrect,
      countCorrect: result.countCorrect,
      tonicCorrect: result.tonicIndexCorrect && result.tonicCategoryCorrect,
    });

    // Unlock card in Grimoire if student got at least 2 criteria right
    const criteriaPassed =
      (result.divisionCorrect ? 1 : 0) +
      (result.countCorrect ? 1 : 0) +
      (result.tonicCategoryCorrect ? 1 : 0);

    if (criteriaPassed >= 2) {
      if (!unlockedCardIds.includes(result.card.id)) {
        onUnlockCard(result.card.id);
        setNewlyUnlockedCards((prev) =>
          prev.some((c) => c.id === result.card.id) ? prev : [...prev, result.card]
        );
      }
    }

    // Add log entry
    const newEntry: DuelLogEntry = {
      id: `${result.card.id}-${round}`,
      round,
      word: result.card.word,
      syllablesJoined: result.card.syllables.join('-'),
      countCat: result.card.countCategory,
      tonicCat: result.card.tonicCategory,
      damageDealt: result.totalPower,
      damageTaken: bossCounterDamage,
      perfect: result.perfectCombo,
    };
    setDuelLogs((prev) => [newEntry, ...prev]);

    // Update HP & Hand
    setBossHp(newBossHp);
    setPlayerHp(newPlayerHp);
    setActiveCard(null);

    // Replenish card from draw pile
    const remainingHand = hand.filter((c) => c.id !== result.card.id);
    if (drawPile.length > 0) {
      const [nextCard, ...restPile] = drawPile;
      setHand([...remainingHand, nextCard]);
      setDrawPile(restPile);
    } else if (remainingHand.length === 0) {
      // Reshuffle deck if exhausted
      const fresh = shuffleCards(WORD_CARDS);
      setHand(fresh.slice(0, 4));
      setDrawPile(fresh.slice(4));
    } else {
      setHand(remainingHand);
    }

    if (newBossHp === 0 || newPlayerHp === 0) {
      const won = newBossHp === 0;
      if (won) {
        const nextStreak = winStreak + 1;
        // Consecutive wins unlock rarer cards automatically in the Grimoire
        const targetRarities =
          nextStreak >= 3
            ? ['Lendária', 'Épica', 'Rara', 'Comum']
            : nextStreak === 2
            ? ['Épica', 'Rara', 'Lendária', 'Comum']
            : ['Rara', 'Comum', 'Épica', 'Lendária'];

        let streakRewardCard: WordCard | undefined;
        for (const r of targetRarities) {
          streakRewardCard = WORD_CARDS.find(
            (c) =>
              c.rarity === r &&
              !unlockedCardIds.includes(c.id) &&
              !newlyUnlockedCards.some((nu) => nu.id === c.id)
          );
          if (streakRewardCard) break;
        }

        if (streakRewardCard) {
          const reward = streakRewardCard;
          onUnlockCard(reward.id);
          setNewlyUnlockedCards((prev) =>
            prev.some((c) => c.id === reward.id) ? prev : [...prev, reward]
          );
        }
      }

      onRecordMatchStats({
        ...updatedStats,
        wonMatch: won,
      });
      setGameState('GAME_OVER');
    } else {
      setRound((r) => r + 1);
    }
  };

  // Automatically trigger the festive victory sound effect whenever the player wins a duel
  React.useEffect(() => {
    if (gameState === 'GAME_OVER' && bossHp === 0) {
      soundEngine.playVictoryFanfare();
    }
  }, [gameState, bossHp]);

  // ---------------------------------------------------------------------------
  // STATE 1: TITLE_MENU (Choose guardian opponent & review rules)
  // ---------------------------------------------------------------------------
  if (gameState === 'TITLE_MENU') {
    return (
      <div className="space-y-8">
        {/* Hero Split Arena Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 rounded-2xl bg-[#132A20] border border-amber-500/30 p-6 md:p-8 flex flex-col justify-between shadow-lg">
            <div>
              <div className="text-xs font-medium text-amber-300/90 flex items-center gap-2">
                <span>Língua Portuguesa · 3º Ano do Ensino Fundamental</span>
                <span aria-hidden="true">·</span>
                <span>BNCC EF03LP05 & EF03LP06</span>
              </div>
              <h1
                className="mt-3 text-3xl md:text-4xl font-display font-bold text-white leading-tight"
                style={{ textWrap: 'balance' }}
              >
                Domine a Divisão Silábica e a Sílaba Tônica em Duelos de Cartas
              </h1>
              <p className="mt-3 text-slate-300 text-base leading-relaxed max-w-2xl">
                Cada palavra da Língua Portuguesa guarda uma energia sonora! Escolha uma
                carta da sua mão, separe suas sílabas com a tesoura encantada e descubra
                qual é a <strong>sílaba tônica</strong> para conjurar ataques críticos e
                colecionar cartas raras no seu Grimório.
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-emerald-800/60 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => startDuel(selectedBoss)}
                className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Swords className="w-4 h-4" />
                <span>Iniciar Duelo com {selectedBoss.name}</span>
              </button>

              <button
                type="button"
                onClick={onOpenGrimoire}
                className="px-5 py-3.5 rounded-xl bg-[#0B1F17] hover:bg-emerald-950 text-amber-200 border border-amber-500/30 font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Ver Coleção ({unlockedCardIds.length}/{WORD_CARDS.length} Cartas)</span>
              </button>
            </div>
          </div>

          {/* Right Column: Visual Arena Tabletop Showcase */}
          <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-amber-500/30 relative min-h-[260px] bg-[#132A20] shadow-lg">
            {!arenaBgError ? (
              <img
                src={ARENA_TABLE_IMAGE}
                alt="Tabuleiro da Arena de Duelo Silábico"
                referrerPolicy="no-referrer"
                onError={() => setArenaBgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-950 via-slate-900 to-amber-950" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-6 flex flex-col justify-end">
              <div className="text-xs text-amber-300 font-medium">
                Regras de Poder na Arena
              </div>
              <h2 className="text-lg font-display font-bold text-white mt-1">
                Como Calcular seu Ataque Silábico
              </h2>
              <ul className="mt-2.5 space-y-1.5 text-xs text-slate-200">
                <li>
                  1. <strong>Separar as sílabas certinho</strong>: +12 Pontos de Poder
                </li>
                <li>
                  2. <strong>Classificar (Monossílaba a Polissílaba)</strong>: +10 Pontos
                </li>
                <li>
                  3. <strong>Acertar a Sílaba Tônica (Oxítona a Proparoxítona)</strong>: +22 Pontos
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Guardian Opponent Selector */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-display font-bold text-white">
                Escolha seu Guardião Desafiante
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Selecione um mestre abaixo e clique em Iniciar Duelo para testar seus conhecimentos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {OPPONENT_BOSSES.map((boss) => {
              const isChosen = selectedBoss.id === boss.id;
              return (
                <div
                  key={boss.id}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedBoss(boss);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedBoss(boss);
                    }
                  }}
                  className={`rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                    isChosen
                      ? 'bg-[#173528] border-amber-400 ring-2 ring-amber-400/30 shadow-lg'
                      : 'bg-[#132A20] border-emerald-800/70 hover:border-amber-500/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-3.5">
                      <img
                        src={CARD_ARTWORKS[boss.artworkType]}
                        alt={boss.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover border border-amber-500/40 shrink-0"
                      />
                      <div>
                        <div className="text-xs text-amber-300 font-medium">
                          {boss.title}
                        </div>
                        <h3 className="text-lg font-display font-bold text-white">
                          {boss.name}
                        </h3>
                        <div className="text-xs text-slate-300 font-mono-num mt-0.5">
                          <span>PV: {boss.maxHp}</span>
                          <span aria-hidden="true" className="mx-1.5">·</span>
                          <span>ATQ: {boss.baseAttack}</span>
                        </div>
                      </div>
                    </div>

                    <p className="mt-3.5 text-xs text-slate-300 leading-relaxed">
                      {boss.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-emerald-800/50 flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-300">
                      {isChosen ? '✓ Guardião Selecionado' : 'Clique para selecionar'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        startDuel(boss);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors whitespace-nowrap shrink-0"
                    >
                      Duelar Agora
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // STATE 2: GAME_OVER (Victory or Try Again Modal View)
  // ---------------------------------------------------------------------------
  if (gameState === 'GAME_OVER') {
    const playerWon = bossHp === 0;

    return (
      <div className="max-w-3xl mx-auto rounded-2xl bg-[#132A20] border-2 border-amber-500/50 p-6 md:p-8 shadow-2xl text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
          <Award className="w-9 h-9" />
        </div>

        <div>
          <div className="text-xs font-semibold text-amber-300">
            {playerWon ? 'VITÓRIA NA ARENA SILÁBICA' : 'FIM DO DUELO · CONTINUE PRATICANDO'}
          </div>
          <h2 className="text-3xl font-display font-bold text-white mt-1">
            {playerWon
              ? `Parabéns! Você venceu ${selectedBoss.name}!`
              : `Quase lá! ${selectedBoss.name} resistiu ao duelo.`}
          </h2>
          <p className="mt-2 text-sm text-slate-300 max-w-xl mx-auto">
            {playerWon
              ? 'Sua precisão na separação de sílabas e na identificação da sílaba tônica liberou todo o poder das cartas!'
              : 'Cada palavra dividida ajuda você a ficar mais forte. Revise as dicas do portão e tente novamente!'}
          </p>
        </div>

        {/* Match Performance Summary */}
        <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-[#0B1F17] border border-emerald-800/70">
          <div>
            <div className="text-xs text-slate-400">Divisões Corretas</div>
            <div className="text-2xl font-mono-num font-bold text-emerald-400 mt-1">
              {matchTelemetry.correctDivisions}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Número de Sílabas</div>
            <div className="text-2xl font-mono-num font-bold text-amber-400 mt-1">
              {matchTelemetry.correctCountClass}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Sílabas Tônicas</div>
            <div className="text-2xl font-mono-num font-bold text-amber-300 mt-1">
              {matchTelemetry.correctTonicClass}
            </div>
          </div>
        </div>

        {/* Newly Unlocked Cards Showcase */}
        {newlyUnlockedCards.length > 0 && (
          <div className="text-left space-y-3 pt-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
              <Sparkles className="w-4 h-4" />
              <span>
                Novas Cartas Desbloqueadas no seu Grimório ({newlyUnlockedCards.length}):
              </span>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {newlyUnlockedCards.map((card) => (
                <CollectibleCard
                  key={`reward-${card.id}`}
                  card={card}
                  compact
                  showSolution
                  isUnlocked
                />
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => startDuel(selectedBoss)}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Jogar Novamente</span>
          </button>

          <button
            type="button"
            onClick={() => setGameState('TITLE_MENU')}
            className="px-5 py-3 rounded-xl bg-[#0B1F17] hover:bg-emerald-950 text-slate-200 border border-emerald-700 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Escolher Outro Guardião
          </button>

          <button
            type="button"
            onClick={onOpenGrimoire}
            className="px-5 py-3 rounded-xl bg-emerald-800/70 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-4 h-4" />
            <span>Abrir Grimório de Cartas</span>
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // STATE 3: PLAYING (Active Card Table Layout)
  // ---------------------------------------------------------------------------
  const playerHpPercent = Math.round((playerHp / 100) * 100);
  const bossHpPercent = Math.round((bossHp / selectedBoss.maxHp) * 100);

  return (
    <div className="space-y-6">
      {/* Unobtrusive Top Duel HUD */}
      <div className="rounded-2xl bg-[#132A20] border border-amber-500/30 p-4 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Player Health Bar & Status */}
          <div className="md:col-span-5 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-900 border border-amber-400/50 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-white truncate">Aprendiz das Sílabas (Você)</span>
                <span className="font-mono-num text-emerald-300">
                  PV: {playerHp}/100 · {playerHp > 35 ? 'ESTÁVEL' : 'ALERTA'}
                </span>
              </div>
              <div className="mt-1.5 h-3 w-full rounded-full bg-[#0B1F17] overflow-hidden border border-emerald-800">
                <div
                  className="h-full bg-emerald-500 transition-all duration-200"
                  style={{ width: `${playerHpPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Center Round Counter & Quick Controls */}
          <div className="md:col-span-2 flex flex-col items-center justify-center text-center">
            <div className="text-xs font-mono-num font-bold text-amber-300">
              RODADA {round}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={toggleAudioMute}
                title={isMuted ? 'Ativar som' : 'Silenciar som'}
                className="p-1.5 rounded-lg bg-[#0B1F17] hover:bg-emerald-900 text-slate-300 hover:text-white border border-emerald-800/80 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setGameState('TITLE_MENU')}
                title="Trocar Guardião ou Reiniciar"
                className="px-2.5 py-1 rounded-lg bg-[#0B1F17] hover:bg-emerald-900 text-xs text-slate-300 hover:text-white border border-emerald-800/80 transition-colors whitespace-nowrap shrink-0"
              >
                Trocar Rival
              </button>
            </div>
          </div>

          {/* Opponent Boss Health Bar & Status */}
          <div className="md:col-span-5 flex items-center gap-3.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-amber-300 truncate">{selectedBoss.name}</span>
                <span className="font-mono-num text-amber-200">
                  PV: {bossHp}/{selectedBoss.maxHp} · ATQ {selectedBoss.baseAttack}
                </span>
              </div>
              <div className="mt-1.5 h-3 w-full rounded-full bg-[#0B1F17] overflow-hidden border border-amber-900/60">
                <div
                  className="h-full bg-amber-500 transition-all duration-200"
                  style={{ width: `${bossHpPercent}%` }}
                />
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-400/50 bg-slate-900 shrink-0">
              {!bossImgError ? (
                <img
                  src={CARD_ARTWORKS[selectedBoss.artworkType]}
                  alt={selectedBoss.name}
                  referrerPolicy="no-referrer"
                  onError={() => setBossImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-amber-400">
                  <Swords className="w-5 h-5" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Center Battle Zone: Either Syllable Forge (when a card is selected) or Selection Prompt */}
      {activeCard ? (
        <SyllableForgePanel
          card={activeCard}
          onCompleteSpell={handleSpellComplete}
          onCancel={() => setActiveCard(null)}
        />
      ) : (
        <div className="rounded-2xl bg-[#132A20]/90 border border-emerald-800/80 p-6 text-center space-y-2">
          <div className="text-xs font-semibold text-amber-300">
            SUA VEZ DE JOGAR · ESCOLHA UMA CARTA DA SUA MÃO ABAIXO
          </div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-white">
            Selecione uma Carta de Palavra para Abrir a Forja Silábica
          </h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto">
            Clique em qualquer uma das 4 cartas abaixo para separar as sílabas, apontar a
            sílaba tônica e atacar <strong>{selectedBoss.name}</strong>!
          </p>
        </div>
      )}

      {/* Player Hand Zone (4 Playable Cards) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-amber-200 flex items-center gap-2">
            <span>Sua Mão de Cartas ({hand.length} disponíveis)</span>
            <span aria-hidden="true">·</span>
            <span className="text-xs text-slate-400 font-normal">
              Baralho restante: {drawPile.length} cartas
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {hand.map((card) => (
            <CollectibleCard
              key={card.id}
              card={card}
              isSelected={activeCard?.id === card.id}
              isPlayable={true}
              isUnlocked={unlockedCardIds.includes(card.id)}
              showSolution={false}
              onSelect={(chosen) => setActiveCard(chosen)}
            />
          ))}
        </div>
      </div>

      {/* Recent Battle Turns History Log */}
      {duelLogs.length > 0 && (
        <div className="rounded-xl bg-[#132A20]/70 border border-emerald-800/60 p-4">
          <h4 className="text-xs font-semibold text-amber-300 mb-2.5">
            Histórico de Conjurações deste Duelo
          </h4>
          <div className="space-y-2">
            {duelLogs.slice(0, 3).map((entry) => (
              <div
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-2 text-xs p-2.5 rounded-lg bg-[#0B1F17]/90 border border-emerald-900/60"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      entry.perfect ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  />
                  <span className="font-mono-num text-slate-400">
                    Rodada {entry.round}:
                  </span>
                  <strong className="text-white">{entry.word}</strong>
                  <span className="font-mono-num text-amber-300">
                    ({entry.syllablesJoined})
                  </span>
                  <span aria-hidden="true" className="text-slate-500">·</span>
                  <span className="text-slate-300">{entry.countCat}</span>
                  <span aria-hidden="true" className="text-slate-500">·</span>
                  <span className="text-emerald-300">{entry.tonicCat}</span>
                </div>
                <div className="font-mono-num font-semibold text-amber-400">
                  Causou {entry.damageDealt} ATQ{' '}
                  {entry.perfect ? '(Combo Perfeito!)' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

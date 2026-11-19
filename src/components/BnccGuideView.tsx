import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Swords,
  RotateCcw,
  Volume2,
  Sparkles,
  Eye,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { WORD_CARDS, WordCard } from '../data/wordsDeck';
import { soundEngine } from '../utils/sound';

export interface ChallengingWordAttempt {
  cardId: string;
  perfect: boolean;
  divisionCorrect: boolean;
  countCorrect: boolean;
  tonicCorrect: boolean;
}

export interface StudentProgressStats {
  matchesPlayed: number;
  matchesWon: number;
  winStreak?: number;
  correctDivisions: number;
  correctCountClass: number;
  correctTonicClass: number;
  recentChallengingWords?: ChallengingWordAttempt[];
}

interface BnccGuideViewProps {
  stats: StudentProgressStats;
  unlockedCount: number;
  onResetProgress: () => void;
  onGoToDuel: () => void;
  onReviewInWorkshop: (cardId: string) => void;
}

const DEFAULT_CHALLENGING_IDS: ChallengingWordAttempt[] = [
  {
    cardId: 'card-passaro',
    perfect: false,
    divisionCorrect: true,
    countCorrect: true,
    tonicCorrect: true,
  },
  {
    cardId: 'card-relampago',
    perfect: false,
    divisionCorrect: true,
    countCorrect: true,
    tonicCorrect: true,
  },
  {
    cardId: 'card-matematica',
    perfect: false,
    divisionCorrect: true,
    countCorrect: true,
    tonicCorrect: true,
  },
];

export const BnccGuideView: React.FC<BnccGuideViewProps> = ({
  stats,
  unlockedCount,
  onResetProgress,
  onGoToDuel,
  onReviewInWorkshop,
}) => {
  const [activeReviewCardId, setActiveReviewCardId] = useState<string | null>(null);

  const recentAttempts: ChallengingWordAttempt[] =
    stats.recentChallengingWords && stats.recentChallengingWords.length > 0
      ? stats.recentChallengingWords.slice(0, 3)
      : DEFAULT_CHALLENGING_IDS;

  const isFromArenaHistory =
    Boolean(stats.recentChallengingWords && stats.recentChallengingWords.length > 0);

  const activeReviewCard: WordCard | undefined = WORD_CARDS.find(
    (c) => c.id === activeReviewCardId
  );

  return (
    <div className="space-y-8">
      {/* Top Pedagogical Overview */}
      <div className="rounded-2xl bg-[#132A20] border border-amber-500/30 p-6 md:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-medium text-amber-300">
            Guia Pedagógico para Professores, Pais e Alunos · Ensino Fundamental Anos Iniciais
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
            Alinhamento Curricular BNCC — 3º Ano
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            O <strong>Grimório das Sílabas</strong> transforma a análise linguística e
            semiótica do 3º ano em uma experiência concreta: a criança segmenta a palavra
            visualmente, escuta a duração sonora da sílaba tônica e recebe bônus
            estratégicos a cada acerto.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onGoToDuel}
            className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Swords className="w-4 h-4" />
            <span>Ir para a Arena de Duelo</span>
          </button>

          <button
            type="button"
            onClick={onResetProgress}
            className="px-4 py-3 rounded-xl bg-[#0B1F17] hover:bg-rose-950/60 text-slate-300 hover:text-rose-200 border border-emerald-800/80 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Zerar Estatísticas da Turma</span>
          </button>
        </div>
      </div>

      {/* Student Performance Dashboard Metrics (Tabular Numerals) */}
      <div className="space-y-4">
        <h2 className="text-lg font-display font-bold text-white">
          Relatório de Desempenho do Aluno na Sessão
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl bg-[#132A20] border border-emerald-800/80">
            <div className="text-xs text-slate-400">Duelos Concluídos</div>
            <div className="text-2xl font-mono-num font-bold text-white mt-1">
              {stats.matchesPlayed}
            </div>
            <div className="text-[11px] text-emerald-300 mt-1">
              {stats.matchesWon} vitórias conquistadas
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#132A20] border border-emerald-800/80">
            <div className="text-xs text-slate-400">Divisões Silábicas Certas</div>
            <div className="text-2xl font-mono-num font-bold text-emerald-400 mt-1">
              {stats.correctDivisions}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Segmentação com a tesoura
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#132A20] border border-emerald-800/80">
            <div className="text-xs text-slate-400">Classificação (EF03LP05)</div>
            <div className="text-2xl font-mono-num font-bold text-amber-400 mt-1">
              {stats.correctCountClass}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Mono, Di, Tri e Polissílabas
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#132A20] border border-emerald-800/80">
            <div className="text-xs text-slate-400">Sílaba Tônica (EF03LP06)</div>
            <div className="text-2xl font-mono-num font-bold text-amber-300 mt-1">
              {stats.correctTonicClass}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Oxítonas, Paroxítonas e Proparoxítonas
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#132A20] border border-amber-500/40">
            <div className="text-xs text-amber-300">Cartas no Grimório</div>
            <div className="text-2xl font-mono-num font-bold text-white mt-1">
              {unlockedCount} / {WORD_CARDS.length}
            </div>
            <div className="text-[11px] text-amber-200/80 mt-1">
              Coleção desbloqueada
            </div>
          </div>
        </div>

        {/* Last 3 Challenging Words Quick-Review Widget */}
        <div className="rounded-2xl bg-[#132A20] border border-amber-500/35 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs font-medium text-amber-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {isFromArenaHistory
                    ? 'Últimas 3 Palavras Desafiadoras Enfrentadas na Arena'
                    : '3 Palavras Desafiadoras Recomendadas para Revisão'}
                </span>
              </div>
              <h3 className="text-base md:text-lg font-display font-bold text-white mt-0.5">
                Revisão Rápida de Divisão Silábica & Sílaba Tônica
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Clique em <strong>Revisar</strong> para ouvir a palavra e ver a explicação passo a passo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentAttempts.map((attempt) => {
              const card = WORD_CARDS.find((c) => c.id === attempt.cardId);
              if (!card) return null;
              const isInspecting = activeReviewCardId === card.id;
              const neededReview =
                isFromArenaHistory &&
                (!attempt.divisionCorrect || !attempt.countCorrect || !attempt.tonicCorrect);

              return (
                <div
                  key={`challenge-${card.id}`}
                  className={`rounded-xl p-4 border transition-all flex flex-col justify-between ${
                    isInspecting
                      ? 'bg-[#173528] border-amber-400 ring-1 ring-amber-400/40'
                      : 'bg-[#0B1F17] border-emerald-800/80 hover:border-amber-500/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-lg font-display font-bold text-white">
                        {card.word}
                      </span>
                      <span className="text-xs text-amber-300 font-medium">
                        {card.rarity} · {card.bnccSkill}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-1">
                      {card.syllables.map((syl, idx) => {
                        const isTonic = idx === card.tonicIndex;
                        return (
                          <React.Fragment key={`${card.id}-rev-${idx}`}>
                            <span
                              className={`text-xs font-mono-num px-1.5 py-0.5 rounded ${
                                isTonic
                                  ? 'bg-amber-500/25 text-amber-300 font-bold underline decoration-amber-400'
                                  : 'bg-[#132A20] text-slate-300'
                              }`}
                            >
                              {syl}
                            </span>
                            {idx < card.syllables.length - 1 && (
                              <span className="text-slate-500 text-xs font-bold">-</span>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    <div className="mt-2.5 text-xs text-slate-300">
                      <span>{card.countCategory}</span>
                      <span aria-hidden="true" className="mx-1.5">·</span>
                      <span className="text-amber-300 font-semibold">{card.tonicCategory}</span>
                    </div>

                    {isFromArenaHistory && (
                      <div className="mt-2 text-[11px] flex items-center gap-1.5">
                        {neededReview ? (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="text-amber-200">
                              Ponto de atenção na última tentativa
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="text-emerald-300">
                              Conjurada com precisão na Arena
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-emerald-900/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        soundEngine.speakWord(card.word, true);
                        setActiveReviewCardId(isInspecting ? null : card.id);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        isInspecting
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isInspecting ? 'Fechar Revisão' : 'Revisar'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => soundEngine.speakWord(card.word, false)}
                      title={`Ouvir pronúncia de ${card.word}`}
                      className="p-1.5 rounded-lg bg-[#132A20] hover:bg-emerald-900 text-amber-300 border border-emerald-800 transition-colors cursor-pointer shrink-0"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expandable Quick Review Pedagogical Drawer */}
          {activeReviewCard && (
            <div className="p-4 rounded-xl bg-[#0B1F17] border border-amber-400/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-amber-300 flex items-center gap-2">
                  <span>Ficha de Revisão Guiada: {activeReviewCard.word}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Sílaba Tônica: "{activeReviewCard.syllables[activeReviewCard.tonicIndex]}"
                  </span>
                </div>
                <p className="text-xs md:text-sm text-amber-100">
                  <strong>Dica do Portão:</strong> {activeReviewCard.callHint}
                </p>
                <p className="text-xs text-slate-300">
                  <strong>Regra Gramatical:</strong> {activeReviewCard.curiosity}
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => soundEngine.speakWord(activeReviewCard.word, true)}
                  className="px-3.5 py-2 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-amber-200 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ouvir Silabado</span>
                </button>

                <button
                  type="button"
                  onClick={() => onReviewInWorkshop(activeReviewCard.id)}
                  className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>Treinar na Oficina Tônica</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BNCC Skills Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-[#132A20] border border-emerald-800/80 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-amber-300 font-mono-num font-bold">
              <span>CÓDIGO BNCC: EF03LP05</span>
              <BookOpen className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-lg font-display font-bold text-white mt-2">
              Número de Sílabas e Classificação
            </h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              "Identificar o número de sílabas de palavras, classificando-as em
              monossílabas, dissílabas, trissílabas e polissílabas."
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-800/60 text-xs text-emerald-200 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Na Arena:</strong> O aluno corta a palavra sílaba por sílaba e
              associa imediatamente a contagem (1, 2, 3, 4+) à nomenclatura oficial.
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-[#132A20] border border-emerald-800/80 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-amber-300 font-mono-num font-bold">
              <span>CÓDIGO BNCC: EF03LP06</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-lg font-display font-bold text-white mt-2">
              Identificação da Sílaba Tônica
            </h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              "Identificar a sílaba tônica em palavras, classificando-as em oxítonas,
              paroxítonas e proparoxítonas."
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-800/60 text-xs text-emerald-200 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Na Arena:</strong> A Forja exibe a posição retroativa (Última,
              Penúltima, Antepenúltima) e oferece a "Dica do Portão" com síntese de voz.
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-[#132A20] border border-emerald-800/80 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-amber-300 font-mono-num font-bold">
              <span>CÓDIGO BNCC: EF03LP04</span>
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-lg font-display font-bold text-white mt-2">
              Acentuação e Marcas Gráficas
            </h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              "Usar acento gráfico (agudo ou circunflexo) em monossílabos tônicos e
              palavras oxítonas, paroxítonas e em todas as proparoxítonas."
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-800/60 text-xs text-emerald-200 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Na Arena:</strong> Cada carta traz uma explicação sobre o papel do
              acento agudo, circunflexo, til e dígrafos separáveis como SS e RR.
            </span>
          </div>
        </div>
      </div>

      {/* Reference Table for 3rd Grade Students */}
      <div className="rounded-2xl bg-[#132A20] border border-emerald-800/80 p-6">
        <h3 className="text-lg font-display font-bold text-white mb-4">
          Tabela de Consulta Rápida para Sala de Aula
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-emerald-800 text-amber-300">
                <th className="py-2.5 pr-4 font-semibold">Classificação</th>
                <th className="py-2.5 px-4 font-semibold">Regra Simples</th>
                <th className="py-2.5 pl-4 font-semibold">Exemplos do Baralho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/60 text-slate-200">
              <tr>
                <td className="py-3 pr-4 font-bold text-white">Monossílaba</td>
                <td className="py-3 px-4">Possui apenas 1 sílaba (não se separa)</td>
                <td className="py-3 pl-4 font-mono-num text-amber-300">
                  SOL · FLOR · MEL · TREM
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-white">Dissílaba</td>
                <td className="py-3 px-4">Possui 2 sílabas</td>
                <td className="py-3 pl-4 font-mono-num text-amber-300">
                  CA-FÉ · FA-DA · TI-GRE · LÁ-PIS
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-white">Trissílaba</td>
                <td className="py-3 px-4">Possui 3 sílabas</td>
                <td className="py-3 pl-4 font-mono-num text-amber-300">
                  JA-CA-RÉ · CAS-TE-LO · LÂM-PA-DA
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-white">Polissílaba</td>
                <td className="py-3 px-4">Possui 4 ou mais sílabas</td>
                <td className="py-3 pl-4 font-mono-num text-amber-300">
                  BOR-BO-LE-TA · MA-TE-MÁ-TI-CA
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-amber-400">Oxítona</td>
                <td className="py-3 px-4">
                  A sílaba tônica (mais forte) é a <strong>última</strong>
                </td>
                <td className="py-3 pl-4 font-mono-num text-emerald-300">
                  CA-<strong>FÉ</strong> · DRA-<strong>GÃO</strong> · A-BA-CA-<strong>XI</strong>
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-amber-400">Paroxítona</td>
                <td className="py-3 px-4">
                  A sílaba tônica é a <strong>penúltima</strong> (2ª de trás para frente)
                </td>
                <td className="py-3 px-4 font-mono-num text-emerald-300">
                  <strong>FA</strong>-DA · CAS-<strong>TE</strong>-LO · BOR-BO-<strong>LE</strong>-TA
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-amber-400">Proparoxítona</td>
                <td className="py-3 px-4">
                  A sílaba tônica é a <strong>antepenúltima</strong> (3ª do fim — sempre
                  acentuada!)
                </td>
                <td className="py-3 pl-4 font-mono-num text-emerald-300">
                  <strong>ÁR</strong>-VO-RE · <strong>PÁS</strong>-SA-RO · RE-<strong>LÂM</strong>-PA-GO
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

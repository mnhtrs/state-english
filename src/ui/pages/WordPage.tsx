import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useServices } from '../ServiceProvider';
import type { WordEntry, UsageItem, QuizItem } from '../../core/domain';
import { Card } from '../components/Card';

// ============================================================
// Pill Button (for action buttons in header)
// ============================================================
const PillButton: React.FC<{
  href?: string;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ href, onClick, danger, disabled, children }) => {
  const base: React.CSSProperties = {
    padding: '0.4rem 1rem',
    fontSize: '0.875rem',
    borderRadius: '20px',
    border: danger ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(255,255,255,0.1)',
    background: danger ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
    color: danger ? 'var(--danger-color)' : 'var(--text-primary)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 500,
    transition: 'background 0.2s',
    textDecoration: 'none',
    opacity: disabled ? 0.5 : 1,
    fontFamily: 'inherit',
  };

  const handleHover = (in_: boolean) => (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    (e.currentTarget as HTMLElement).style.background = in_
      ? (danger ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)')
      : (danger ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)');
  };

  if (href) return (
    <a href={href} target="_blank" rel="noreferrer" style={base}
      onMouseOver={handleHover(true)} onMouseOut={handleHover(false)}>
      {children}
    </a>
  );
  return (
    <button onClick={onClick} disabled={disabled} style={base}
      onMouseOver={handleHover(true)} onMouseOut={handleHover(false)}>
      {children}
    </button>
  );
};

// ============================================================
// Collapsible Section
// ============================================================
const Collapsible: React.FC<{ title: string; emoji?: string; defaultOpen?: boolean; children: React.ReactNode }> = ({
  title, emoji, defaultOpen = false, children
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ backgroundColor: 'var(--bg-color)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
      <button onClick={() => setOpen(v => !v)} style={{
        width: '100%', background: 'none', border: 'none', borderBottom: open ? '1px solid rgba(255,255,255,0.1)' : 'none',
        padding: '0.75rem 1rem', color: 'var(--text-primary)',
        cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s'
      }}>
        <span>{emoji && `${emoji} `}{title}</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{open ? '▲ Thu gọn' : '▼ Mở rộng'}</span>
      </button>
      {open && <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)' }}>{children}</div>}
    </div>
  );
};

// ============================================================
// Translation Quiz Item Component
// ============================================================
const TranslationQuizItem: React.FC<{
  quiz: QuizItem;
  index: number;
  word: string;
}> = ({ quiz, word }) => {
  const { learningService } = useServices();
  const [translation, setTranslation] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<{ score: number; feedback: string; suggestedTranslation: string } | null>(null);

  const handleEvaluate = async () => {
    if (!translation.trim()) return;
    setEvaluating(true);
    setResult(null);
    try {
      const res = await learningService.evaluateTranslation(word, quiz.question, translation);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div style={{ padding: '1.25rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', borderLeft: '3px solid var(--accent-color)' }}>
      {quiz.context && (
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <span style={{ opacity: 0.6 }}>Ngữ cảnh:</span> {quiz.context}
        </p>
      )}
      <p style={{ margin: '0 0 1.25rem', fontSize: '1.05rem', fontWeight: 600, fontFamily: 'monospace' }}>
        "{quiz.question}"
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <textarea
          value={translation}
          onChange={e => setTranslation(e.target.value)}
          placeholder="Nhập bản dịch tiếng Việt của bạn..."
          style={{ width: '100%', minHeight: '80px', padding: '0.875rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', resize: 'vertical', fontFamily: 'inherit' }}
        />
        <button
          onClick={handleEvaluate}
          disabled={evaluating || !translation.trim()}
          style={{ alignSelf: 'flex-start', padding: '0.6rem 1.25rem', backgroundColor: evaluating ? 'rgba(255,255,255,0.1)' : 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: evaluating ? 'not-allowed' : 'pointer', fontWeight: 600 }}
        >
          {evaluating ? 'Đang chấm...' : 'Kiểm tra'}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: '1.25rem', padding: '1rem', backgroundColor: result.score >= 80 ? 'rgba(34,197,94,0.08)' : 'rgba(234,179,8,0.08)', borderRadius: '8px', border: `1px solid ${result.score >= 80 ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.2)'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: result.score >= 80 ? 'var(--success-color)' : '#eab308' }}>
              Điểm: {result.score}/100
            </span>
          </div>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', lineHeight: 1.6 }}>{result.feedback}</p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--success-color)', fontStyle: 'italic', paddingLeft: '0.75rem', borderLeft: '2px solid var(--success-color)' }}>
            Đề xuất: "{result.suggestedTranslation}"
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================================
// Array Chunker
// ============================================================
const chunkArray = <T,>(arr: T[], size: number): T[][] => {
  if (!arr || size <= 0) return [];
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

// ============================================================
// Slide Navigator (wraps a list of items into paged slides)
// ============================================================
function SlideNavigator<T>({
  slides,
  renderSlide,
  onRequestMore,
  moreLoading,
  moreLabel = 'Xem thêm ví dụ →',
}: {
  slides: T[];
  renderSlide: (item: T, index: number) => React.ReactNode;
  onRequestMore?: () => Promise<void>;
  moreLoading?: boolean;
  moreLabel?: string;
}) {
  const [page, setPage] = useState(0);
  const [inputVal, setInputVal] = useState('1');
  const total = slides.length;

  // Keep inputVal in sync when page changes via buttons
  const goToPage = (newPage: number) => {
    const clamped = Math.max(0, Math.min(total - 1, newPage));
    setPage(clamped);
    setInputVal(String(clamped + 1));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
  };

  const handleInputCommit = () => {
    const parsed = parseInt(inputVal, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= total) {
      goToPage(parsed - 1);
    } else {
      // Reset to current page on invalid input
      setInputVal(String(page + 1));
    }
  };

  return (
    <div>
      {/* Slide content */}
      <div style={{ transition: 'opacity 0.2s', opacity: 1 }}>
        {renderSlide(slides[page], page)}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
        <button
          onClick={() => goToPage(page - 1)}
          disabled={page === 0}
          style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
            padding: '0.35rem 0.875rem', color: page === 0 ? 'var(--text-secondary)' : 'var(--text-primary)',
            cursor: page === 0 ? 'not-allowed' : 'pointer', fontSize: '0.875rem', transition: 'background 0.2s'
          }}
        >← Trước</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
          <input
            type="number"
            min={1}
            max={total}
            value={inputVal}
            onChange={handleInputChange}
            onBlur={handleInputCommit}
            onKeyDown={(e) => { if (e.key === 'Enter') handleInputCommit(); }}
            style={{
              width: '2.75rem',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              padding: '0.2rem 0.3rem',
              outline: 'none',
              MozAppearance: 'textfield' as any,
            }}
          />
          <span>/ {total}</span>
        </div>

        {page < total - 1 ? (
          <button
            onClick={() => goToPage(page + 1)}
            style={{
              background: 'var(--accent-color)', border: 'none', borderRadius: '8px',
              padding: '0.35rem 0.875rem', color: 'white',
              cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'opacity 0.2s'
            }}
          >Tiếp →</button>
        ) : onRequestMore ? (
          <button
            onClick={async () => {
              await onRequestMore();
              goToPage(total); // move to newly added slide
            }}
            disabled={moreLoading}
            style={{
              background: moreLoading ? 'rgba(59,130,246,0.4)' : 'var(--accent-color)',
              border: 'none', borderRadius: '8px', padding: '0.35rem 0.875rem',
              color: 'white', cursor: moreLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem', fontWeight: 600, transition: 'opacity 0.2s'
            }}
          >{moreLoading ? '⏳ Đang tải...' : moreLabel}</button>
        ) : (
          <span style={{ width: '80px' }} />
        )}
      </div>
    </div>
  );
}

// ============================================================
// WordPage
// ============================================================
export const WordPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { learningService } = useServices();

  const [word, setWord] = useState<WordEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // For dynamic generation
  const [usages, setUsages] = useState<UsageItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [misconceptions, setMisconceptions] = useState<import('../../core/domain').MisconceptionItem[]>([]);
  const [usagesLoading, setUsagesLoading] = useState(false);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [misconceptionsLoading, setMisconceptionsLoading] = useState(false);
  const [showExplanationVN, setShowExplanationVN] = useState(false);

  useEffect(() => {
    const loadWord = async () => {
      if (!id) return;
      const w = await learningService.getWordById(id);
      setWord(w);
      setUsages(w?.aiData?.usages ?? []);
      setQuizzes(w?.aiData?.quiz ?? []);
      setMisconceptions(w?.aiData?.commonMisconceptions ?? []);
      setLoading(false);
    };
    loadWord();
  }, [id, learningService]);

  const handleDelete = async () => {
    if (!word) return;
    if (!confirm(`Xoá từ "${word.word}"? Thao tác này không thể hoàn tác.`)) return;
    setDeleting(true);
    await learningService.deleteWord(word.id);
    navigate('/');
  };

  const handleMoreUsages = async () => {
    if (!word) return;
    setUsagesLoading(true);
    try {
      const updated = await learningService.generateMoreUsages(word.id);
      setUsages(updated);
    } catch (e) {
      alert('Không thể tải thêm ví dụ. Thử lại sau.');
    } finally {
      setUsagesLoading(false);
    }
  };

  const handleMoreQuizzes = async () => {
    if (!word) return;
    setQuizzesLoading(true);
    try {
      const updated = await learningService.generateMoreQuizzes(word.id);
      setQuizzes(updated);
    } catch (e) {
      alert('Không thể tải thêm câu hỏi. Thử lại sau.');
    } finally {
      setQuizzesLoading(false);
    }
  };

  const handleMoreMisconceptions = async () => {
    if (!word) return;
    setMisconceptionsLoading(true);
    try {
      const updated = await learningService.generateMoreMisconceptions(word.id);
      setMisconceptions(updated);
    } catch (e) {
      alert('Không thể tải thêm ví dụ. Thử lại sau.');
    } finally {
      setMisconceptionsLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Đang tải...</div>;
  if (!word) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--danger-color)' }}>Không tìm thấy từ này.</div>;

  const ai = word.aiData;
  const usageChunkSize = usages.length > 0 ? new Set(usages.map(u => u.label)).size : 1;
  const usagesSlides = chunkArray(usages, usageChunkSize);
  const quizSlides = chunkArray(quizzes, 1);
  const misconceptionSlides = chunkArray(misconceptions, 1);

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Back */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>← Quay về</Link>
      </div>

      {/* ── Header ── */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '3rem', margin: '0 0 0.25rem 0', color: 'var(--accent-color)', letterSpacing: '-1px' }}>
          {word.word}
        </h1>
        {word.dictionaryData.phonetics && (
          <span style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>{word.dictionaryData.phonetics}</span>
        )}
        <p style={{ margin: '0.5rem 0 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontStyle: 'italic' }}>
          "{word.originalSentence}"
          {word.learningSource && <span> — {word.learningSource}</span>}
        </p>

        {/* Action buttons — all in one row */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <PillButton href={`https://youglish.com/pronounce/${encodeURIComponent(word.word)}/english`}>
            🔊 YouGlish
          </PillButton>
          <PillButton href={`https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(word.word)}`}>
            📖 Cambridge
          </PillButton>
          <PillButton href={`https://www.oxfordlearnersdictionaries.com/us/definition/english/${encodeURIComponent(word.word)}`}>
            📕 Oxford
          </PillButton>
          <PillButton href={`https://www.dictionary.com/browse/${encodeURIComponent(word.word)}`}>
            📘 Dictionary.com
          </PillButton>
          <PillButton danger onClick={handleDelete} disabled={deleting}>
            🗑 {deleting ? 'Đang xoá...' : 'Xoá từ'}
          </PillButton>
        </div>
      </div>

      {/* ── Dictionary Reference (collapsed) ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Collapsible title="Định nghĩa từ điển (tham khảo)" defaultOpen={false}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.07)', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--text-primary)' }}>{word.dictionaryData.partOfSpeech}</strong>
            <div style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{word.dictionaryData.definition}</div>
          </div>
        </Collapsible>
      </div>

      {ai ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* ── Giải thích (bilingual, short) ── */}
          <Card style={{ borderLeft: '4px solid var(--accent-color)' }}>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--accent-color)' }}>
              Giải thích
            </p>
            <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {ai.vietnameseExplanation?.split('\n')[0]}
            </p>
            <button
              onClick={() => setShowExplanationVN(v => !v)}
              style={{ marginTop: '0.75rem', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '0.8rem', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              {showExplanationVN ? '▲ Ẩn tiếng Việt' : '▼ Xem tiếng Việt'}
            </button>
            {showExplanationVN && (
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.95rem', lineHeight: 1.8, color: 'rgba(148,163,184,0.9)', fontStyle: 'italic', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                {ai.vietnameseExplanation?.split('\n').slice(1).join('\n').trim() || '(Bản dịch tiếng Việt chưa được cập nhật cho từ này. Vui lòng tạo lại từ mới)'}
              </p>
            )}
          </Card>

          {/* ── Các cách dùng (Carousel with "More") ── */}
          {usages.length > 0 && (
            <Collapsible title="Các cách dùng" defaultOpen={true}>
              <SlideNavigator
                slides={usagesSlides}
                onRequestMore={handleMoreUsages}
                moreLoading={usagesLoading}
                moreLabel="Thêm ví dụ →"
                renderSlide={(slideUsages) => (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {slideUsages?.map((u, i) => (
                      <div key={i} style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--accent-color)' }}>
                        <p style={{ margin: '0 0 0.4rem', fontWeight: 700, color: 'var(--accent-color)', fontSize: '0.9rem' }}>{u.label}</p>
                        <p style={{ margin: '0 0 0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{u.situation}</p>
                        <p style={{ margin: '0 0 0.3rem', fontFamily: 'monospace', fontSize: '1rem' }}>"{u.sentence}"</p>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>→ {u.naturalVietnamese}</p>
                      </div>
                    ))}
                  </div>
                )}
              />
            </Collapsible>
          )}

          {misconceptions.length > 0 && (
            <Collapsible title="Hay bị hiểu sai" emoji="❌" defaultOpen={true}>
              <SlideNavigator
                slides={misconceptionSlides}
                onRequestMore={handleMoreMisconceptions}
                moreLoading={misconceptionsLoading}
                moreLabel="Thêm ví dụ →"
                renderSlide={(slideMisconceptions) => (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {slideMisconceptions?.map((m, i) => (
                      <div key={i} style={{ padding: '1rem', backgroundColor: 'rgba(239,68,68,0.06)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.18)' }}>
                        <p style={{ margin: '0 0 0.3rem', color: 'var(--danger-color)', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                          ❌ "{m.incorrect}"
                        </p>
                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                          {m.whyWrong}
                          {m.whyWrongTranslation && (
                            <span style={{ color: 'rgba(148,163,184,0.85)', fontStyle: 'italic', marginLeft: '0.4rem' }}>
                              ({m.whyWrongTranslation.replace(/^\(|\)$/g, '').trim()})
                            </span>
                          )}
                        </p>
                        <p style={{ margin: '0 0 0.3rem', color: 'var(--success-color)', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                          ✓ "{m.correct}"
                        </p>
                        <p style={{ margin: '0 0 0.3rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                          {m.difference}
                          {m.translation && (
                            <span style={{ color: 'rgba(148,163,184,0.85)', fontStyle: 'italic', marginLeft: '0.4rem' }}>
                              ({m.translation.replace(/^\(|\)$/g, '').trim()})
                            </span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              />
            </Collapsible>
          )}

          {/* ── Quiz (Carousel with "More") ── */}
          {quizzes.length > 0 && (
            <Collapsible title="Bài tập dịch thuật" emoji="📝" defaultOpen={false}>
              <SlideNavigator
                slides={quizSlides}
                onRequestMore={handleMoreQuizzes}
                moreLoading={quizzesLoading}
                moreLabel="Thêm câu hỏi →"
                renderSlide={(slideQuizzes) => (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {slideQuizzes?.map((quiz) => {
                      const globalIndex = quizzes.indexOf(quiz);
                      return (
                        <TranslationQuizItem
                          key={globalIndex}
                          quiz={quiz}
                          index={globalIndex}
                          word={word.word}
                        />
                      );
                    })}
                  </div>
                )}
              />
            </Collapsible>
          )}

          {/* ── Từ liên quan ── */}
          {Array.isArray(ai.relatedConcepts) && ai.relatedConcepts.length > 0 && (
            <Card>
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-secondary)' }}>
                Từ liên quan
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {ai.relatedConcepts.map((c, i) => (
                  <span key={i} style={{ padding: '0.35rem 0.875rem', backgroundColor: 'var(--bg-color)', borderRadius: '999px', fontSize: '0.875rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {c}
                  </span>
                ))}
              </div>
            </Card>
          )}

        </div>
      ) : (
        <Card>
          <p style={{ color: 'var(--text-secondary)' }}>Không có dữ liệu AI cho từ này.</p>
        </Card>
      )}

      <div style={{ height: '3rem' }} />
    </div>
  );
};

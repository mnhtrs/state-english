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
  icon?: string;
  children: React.ReactNode;
}> = ({ href, onClick, danger, disabled, icon, children }) => {
  const base: React.CSSProperties = {
    padding: '0.45rem 1rem',
    fontSize: '0.835rem',
    borderRadius: 'var(--radius-full)',
    border: danger
      ? '1px solid rgba(192,57,43,0.3)'
      : '1px solid var(--border-strong)',
    background: danger ? 'var(--danger-light)' : 'var(--bg-surface)',
    color: danger ? 'var(--danger)' : 'var(--text-secondary)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 500,
    transition: 'all 0.2s var(--ease)',
    textDecoration: 'none',
    opacity: disabled ? 0.5 : 1,
    fontFamily: 'inherit',
    boxShadow: 'var(--shadow-sm)',
  };

  const handleHover = (hovering: boolean) => (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    if (danger) {
      e.currentTarget.style.background = hovering ? 'rgba(192,57,43,0.18)' : 'var(--danger-light)';
      e.currentTarget.style.color = 'var(--danger)';
    } else {
      e.currentTarget.style.background = hovering ? 'var(--accent-light)' : 'var(--bg-surface)';
      e.currentTarget.style.borderColor = hovering ? 'var(--accent)' : 'var(--border-strong)';
      e.currentTarget.style.color = hovering ? 'var(--accent)' : 'var(--text-secondary)';
    }
    e.currentTarget.style.transform = hovering ? 'translateY(-1px)' : 'translateY(0)';
  };

  const content = (
    <>
      {icon && <i className={icon} />}
      {children}
    </>
  );

  if (href) return (
    <a href={href} target="_blank" rel="noreferrer" style={base}
      onMouseOver={handleHover(true)} onMouseOut={handleHover(false)}>
      {content}
    </a>
  );
  return (
    <button onClick={onClick} disabled={disabled} style={base}
      onMouseOver={handleHover(true)} onMouseOut={handleHover(false)}>
      {content}
    </button>
  );
};

// ============================================================
// Collapsible Section
// ============================================================
const Collapsible: React.FC<{
  title: string;
  icon?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, icon, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', background: 'none', border: 'none',
          borderBottom: open ? '1px solid var(--border)' : 'none',
          padding: '0.875rem 1.25rem',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '0.925rem', fontWeight: 600,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          transition: 'background 0.2s',
          fontFamily: 'inherit',
        }}
        onMouseOver={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
        onMouseOut={e => (e.currentTarget.style.background = 'none')}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {icon && (
            <span style={{
              width: '28px', height: '28px',
              background: 'var(--accent-light)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent)', fontSize: '0.8rem',
            }}>
              <i className={icon} />
            </span>
          )}
          {title}
        </span>
        <span style={{
          color: 'var(--text-muted)',
          fontSize: '0.775rem',
          display: 'flex', alignItems: 'center', gap: '0.35rem',
          fontWeight: 400,
        }}>
          {open ? (
            <><i className="fa-solid fa-chevron-up" /> Thu gọn</>
          ) : (
            <><i className="fa-solid fa-chevron-down" /> Mở rộng</>
          )}
        </span>
      </button>
      {open && (
        <div className="animate-fade-in" style={{ padding: '1.25rem', background: 'var(--bg-primary)' }}>
          {children}
        </div>
      )}
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

  const isGood = result && result.score >= 80;

  return (
    <div style={{
      padding: '1.25rem',
      background: 'var(--bg-surface)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)',
      borderLeft: '3px solid var(--accent)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {quiz.context && (
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Ngữ cảnh: </span>
          {quiz.context}
        </p>
      )}
      <p style={{
        margin: '0 0 1.25rem',
        fontSize: '1rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        fontStyle: 'italic',
        lineHeight: 1.6,
      }}>
        "{quiz.question}"
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <label htmlFor="translation-input" style={{ display: 'none' }}>Bản dịch</label>
        <textarea
          id="translation-input"
          name="translation"
          value={translation}
          onChange={e => setTranslation(e.target.value)}
          placeholder="Nhập bản dịch tiếng Việt của bạn..."
          style={{
            width: '100%', minHeight: '80px', padding: '0.875rem',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--border-strong)',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            resize: 'vertical',
            fontFamily: 'inherit',
            fontSize: '0.9rem',
            outline: 'none',
            transition: 'var(--transition)',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = 'none'; }}
        />
        <button
          onClick={handleEvaluate}
          disabled={evaluating || !translation.trim()}
          style={{
            alignSelf: 'flex-start',
            padding: '0.6rem 1.25rem',
            background: evaluating ? 'var(--bg-secondary)' : 'linear-gradient(135deg, var(--accent), #a0632a)',
            color: evaluating ? 'var(--text-muted)' : 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: evaluating ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontFamily: 'inherit',
            boxShadow: evaluating ? 'none' : 'var(--shadow-accent)',
            transition: 'var(--transition)',
          }}
        >
          {evaluating ? (
            <><i className="fa-solid fa-spinner fa-spin" /> Đang chấm điểm...</>
          ) : (
            <><i className="fa-solid fa-check-circle" /> Kiểm tra</>
          )}
        </button>
      </div>

      {result && (
        <div className="animate-fade-in" style={{
          marginTop: '1.25rem',
          padding: '1rem',
          background: isGood ? 'var(--success-light)' : 'rgba(230,126,34,0.08)',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${isGood ? 'rgba(39,174,96,0.3)' : 'rgba(230,126,34,0.3)'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
            <i
              className={isGood ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-half-stroke'}
              style={{ color: isGood ? 'var(--success)' : 'var(--warning)', fontSize: '1.1rem' }}
            />
            <span style={{ fontWeight: 700, fontSize: '1rem', color: isGood ? 'var(--success)' : 'var(--warning)' }}>
              Điểm: {result.score}/100
            </span>
          </div>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
            {result.feedback}
          </p>
          <p style={{
            margin: 0,
            fontSize: '0.875rem',
            color: 'var(--success)',
            fontStyle: 'italic',
            paddingLeft: '0.75rem',
            borderLeft: '2px solid var(--success)',
          }}>
            <i className="fa-solid fa-lightbulb" style={{ marginRight: '0.35rem' }} />
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
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
};

// ============================================================
// Slide Navigator
// ============================================================
function SlideNavigator<T>({
  slides,
  renderSlide,
  onRequestMore,
  moreLoading,
  moreLabel = 'Xem thêm ví dụ',
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

  const goToPage = (newPage: number) => {
    const clamped = Math.max(0, Math.min(total - 1, newPage));
    setPage(clamped);
    setInputVal(String(clamped + 1));
  };

  const handleInputCommit = () => {
    const parsed = parseInt(inputVal, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= total) {
      goToPage(parsed - 1);
    } else {
      setInputVal(String(page + 1));
    }
  };

  const navBtnStyle = (disabled: boolean): React.CSSProperties => ({
    background: disabled ? 'var(--bg-secondary)' : 'var(--bg-surface)',
    border: '1px solid var(--border-strong)',
    borderRadius: 'var(--radius-md)',
    padding: '0.4rem 1rem',
    color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '0.825rem',
    fontWeight: 500,
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    fontFamily: 'inherit',
    transition: 'var(--transition)',
    boxShadow: disabled ? 'none' : 'var(--shadow-sm)',
  });

  return (
    <div>
      <div className="animate-fade-in-fast">{renderSlide(slides[page], page)}</div>

      {/* Navigation */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: '1.25rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border)',
      }}>
        <button
          onClick={() => goToPage(page - 1)}
          disabled={page === 0}
          style={navBtnStyle(page === 0)}
          onMouseOver={e => { if (page !== 0) { e.currentTarget.style.background = 'var(--accent-light)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}}
          onMouseOut={e => { e.currentTarget.style.background = page === 0 ? 'var(--bg-secondary)' : 'var(--bg-surface)'; e.currentTarget.style.color = page === 0 ? 'var(--text-muted)' : 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
        >
          <i className="fa-solid fa-chevron-left" />
          Trước
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
          <label htmlFor="page-number-input" style={{ display: 'none' }}>Số trang</label>
          <input
            id="page-number-input"
            name="page-number"
            type="number"
            min={1}
            max={total}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onBlur={handleInputCommit}
            onKeyDown={e => { if (e.key === 'Enter') handleInputCommit(); }}
            style={{
              width: '3rem',
              textAlign: 'center',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '0.825rem',
              padding: '0.3rem',
              outline: 'none',
              fontFamily: 'inherit',
              MozAppearance: 'textfield' as any,
            }}
          />
          <span>/ {total}</span>
        </div>

        {page < total - 1 ? (
          <button
            onClick={() => goToPage(page + 1)}
            style={{
              background: 'linear-gradient(135deg, var(--accent), #a0632a)',
              border: 'none', borderRadius: 'var(--radius-md)',
              padding: '0.4rem 1rem', color: 'white',
              cursor: 'pointer', fontSize: '0.825rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              fontFamily: 'inherit', boxShadow: 'var(--shadow-accent)',
              transition: 'var(--transition)',
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(192,125,58,0.4)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-accent)'; }}
          >
            Tiếp
            <i className="fa-solid fa-chevron-right" />
          </button>
        ) : onRequestMore ? (
          <button
            onClick={async () => { await onRequestMore(); goToPage(total); }}
            disabled={moreLoading}
            style={{
              background: moreLoading ? 'var(--bg-secondary)' : 'linear-gradient(135deg, var(--accent), #a0632a)',
              border: 'none', borderRadius: 'var(--radius-md)',
              padding: '0.4rem 1rem',
              color: moreLoading ? 'var(--text-muted)' : 'white',
              cursor: moreLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.825rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              fontFamily: 'inherit',
              boxShadow: moreLoading ? 'none' : 'var(--shadow-accent)',
              transition: 'var(--transition)',
            }}
          >
            {moreLoading ? (
              <><i className="fa-solid fa-spinner fa-spin" /> Đang tải...</>
            ) : (
              <><i className="fa-solid fa-rotate-right" /> {moreLabel}</>
            )}
          </button>
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
    try { const updated = await learningService.generateMoreUsages(word.id); setUsages(updated); }
    catch { alert('Không thể tải thêm ví dụ. Thử lại sau.'); }
    finally { setUsagesLoading(false); }
  };

  const handleMoreQuizzes = async () => {
    if (!word) return;
    setQuizzesLoading(true);
    try { const updated = await learningService.generateMoreQuizzes(word.id); setQuizzes(updated); }
    catch { alert('Không thể tải thêm câu hỏi. Thử lại sau.'); }
    finally { setQuizzesLoading(false); }
  };

  const handleMoreMisconceptions = async () => {
    if (!word) return;
    setMisconceptionsLoading(true);
    try { const updated = await learningService.generateMoreMisconceptions(word.id); setMisconceptions(updated); }
    catch { alert('Không thể tải thêm ví dụ. Thử lại sau.'); }
    finally { setMisconceptionsLoading(false); }
  };

  if (loading) return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <div className="skeleton" style={{ height: '20px', width: '100px', borderRadius: 'var(--radius-sm)', marginBottom: '2rem' }} />
      <div className="skeleton" style={{ height: '64px', width: '260px', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }} />
      <div className="skeleton" style={{ height: '20px', width: '180px', borderRadius: 'var(--radius-sm)', marginBottom: '2rem' }} />
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-lg)', marginBottom: '1rem' }} />
      ))}
    </div>
  );

  if (!word) return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center' }}>
      <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '2.5rem', color: 'var(--danger)', marginBottom: '1rem', display: 'block' }} />
      <p style={{ color: 'var(--text-secondary)' }}>Không tìm thấy từ này.</p>
      <Link to="/" style={{ color: 'var(--accent)', marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <i className="fa-solid fa-arrow-left" /> Quay về
      </Link>
    </div>
  );

  const ai = word.aiData;
  const usageChunkSize = usages.length > 0 ? new Set(usages.map(u => u.label)).size : 1;
  const usagesSlides = chunkArray(usages, usageChunkSize);
  const quizSlides = chunkArray(quizzes, 1);
  const misconceptionSlides = chunkArray(misconceptions, 1);

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

      {/* Back */}
      <div className="animate-slide-left" style={{ marginBottom: '1.75rem' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500,
            transition: 'color 0.2s',
          }}
          onMouseOver={e => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <i className="fa-solid fa-arrow-left" />
          Quay về danh sách
        </Link>
      </div>

      {/* ── Header ── */}
      <div className="animate-fade-in" style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '3.2rem',
            margin: '0 0 0.25rem',
            color: 'var(--accent)',
            letterSpacing: '-1px',
            lineHeight: 1.1,
          }}>
            {word.word}
          </h1>
          {word.dictionaryData.phonetics && (
            <span style={{
              display: 'inline-block',
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              background: 'var(--bg-secondary)',
              padding: '0.15rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              marginBottom: '0.5rem',
            }}>
              {word.dictionaryData.phonetics}
            </span>
          )}
        </div>

        <p style={{
          margin: '0 0 1.25rem',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          fontStyle: 'italic',
          lineHeight: 1.7,
          paddingLeft: '0.75rem',
          borderLeft: '2px solid var(--border-strong)',
        }}>
          "{word.originalSentence}"
          {word.learningSource && (
            <span style={{ display: 'block', marginTop: '0.25rem', fontStyle: 'normal', color: 'var(--text-secondary)' }}>
              <i className="fa-solid fa-bookmark" style={{ marginRight: '0.35rem', fontSize: '0.75rem' }} />
              {word.learningSource}
            </span>
          )}
        </p>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <PillButton icon="fa-solid fa-volume-high" href={`https://youglish.com/pronounce/${encodeURIComponent(word.word)}/english`}>
            YouGlish
          </PillButton>
          <PillButton icon="fa-solid fa-book" href={`https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(word.word)}`}>
            Cambridge
          </PillButton>
          <PillButton icon="fa-solid fa-book-open" href={`https://www.oxfordlearnersdictionaries.com/us/definition/english/${encodeURIComponent(word.word)}`}>
            Oxford
          </PillButton>
          <PillButton icon="fa-solid fa-globe" href={`https://www.dictionary.com/browse/${encodeURIComponent(word.word)}`}>
            Dictionary.com
          </PillButton>
          <PillButton danger icon="fa-solid fa-trash" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Đang xoá...' : 'Xoá từ'}
          </PillButton>
        </div>
      </div>

      {/* ── Dictionary Reference ── */}
      <div className="animate-fade-in stagger-1" style={{ marginBottom: '1.25rem' }}>
        <Collapsible title="Định nghĩa từ điển (tham khảo)" icon="fa-solid fa-magnifying-glass" defaultOpen={false}>
          <div style={{
            padding: '1rem',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.8,
          }}>
            <strong style={{ color: 'var(--accent)', display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {word.dictionaryData.partOfSpeech}
            </strong>
            <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
              {word.dictionaryData.definition}
            </div>
          </div>
        </Collapsible>
      </div>

      {ai ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

          {/* ── Giải thích ── */}
          {(() => {
            // Data may use "<br>", "<br/>", "<BR>" or "\n" as EN/VN separator
            const raw = ai.vietnameseExplanation ?? '';
            const brIdx = raw.search(/<br\s*\/?>/i);
            const nlIdx = raw.indexOf('\n');
            // pick whichever separator appears first (and exists)
            let enPart = raw;
            let vnPart = '';
            if (brIdx !== -1 && (nlIdx === -1 || brIdx <= nlIdx)) {
              enPart = raw.slice(0, brIdx).trim();
              vnPart = raw.slice(brIdx).replace(/<br\s*\/?>/gi, '').trim();
            } else if (nlIdx !== -1) {
              enPart = raw.slice(0, nlIdx).trim();
              vnPart = raw.slice(nlIdx + 1).trim();
            }
            return (
              <Card className="animate-fade-in stagger-2" style={{ borderLeft: '3px solid var(--accent)' }}>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--accent)', fontWeight: 600 }}>
                  <i className="fa-solid fa-graduation-cap" style={{ marginRight: '0.4rem' }} />
                  Giải thích
                </p>
                {/* English explanation */}
                <p style={{ margin: 0, fontSize: '0.975rem', lineHeight: 1.8, color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
                  {enPart}
                </p>
                {/* Toggle Vietnamese */}
                {vnPart && (
                  <button
                    onClick={() => setShowExplanationVN(v => !v)}
                    style={{
                      marginTop: '0.875rem',
                      background: 'none', border: 'none', padding: 0,
                      cursor: 'pointer', fontSize: '0.8rem',
                      color: 'var(--accent)',
                      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                      fontFamily: 'inherit', fontWeight: 500, transition: 'opacity 0.2s',
                    }}
                  >
                    {showExplanationVN
                      ? <><i className="fa-solid fa-chevron-up" /> Ẩn bản tiếng Việt</>
                      : <><i className="fa-solid fa-chevron-down" /> Xem bản tiếng Việt</>
                    }
                  </button>
                )}
                {showExplanationVN && vnPart && (
                  <p className="animate-fade-in" style={{
                    margin: '0.75rem 0 0',
                    fontSize: '0.925rem',
                    lineHeight: 1.8,
                    color: 'var(--text-secondary)',
                    fontStyle: 'italic',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border)',
                    whiteSpace: 'pre-line',
                  }}>
                    {vnPart}
                  </p>
                )}
              </Card>
            );
          })()}

          {/* ── Các cách dùng ── */}
          {usages.length > 0 && (
            <div className="animate-fade-in stagger-3">
              <Collapsible title="Các cách dùng" icon="fa-solid fa-list-check" defaultOpen={true}>
                <SlideNavigator
                  slides={usagesSlides}
                  onRequestMore={handleMoreUsages}
                  moreLoading={usagesLoading}
                  moreLabel="Thêm ví dụ"
                  renderSlide={(slideUsages) => (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                      {slideUsages?.map((u, i) => (
                        <div key={i} style={{
                          padding: '1rem',
                          background: 'var(--bg-surface)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          borderLeft: '3px solid var(--accent)',
                        }}>
                          <p style={{ margin: '0 0 0.35rem', fontWeight: 700, color: 'var(--accent)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {u.label}
                          </p>
                          <p style={{ margin: '0 0 0.4rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            <i className="fa-solid fa-tag" style={{ marginRight: '0.35rem', fontSize: '0.75rem', opacity: 0.6 }} />
                            {u.situation}
                          </p>
                          <p style={{ margin: '0 0 0.35rem', fontStyle: 'italic', fontSize: '0.975rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                            "{u.sentence}"
                          </p>
                          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            <i className="fa-solid fa-arrow-right" style={{ marginRight: '0.35rem', fontSize: '0.75rem', color: 'var(--accent)' }} />
                            {u.naturalVietnamese}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </Collapsible>
            </div>
          )}

          {/* ── Misconceptions ── */}
          {misconceptions.length > 0 && (
            <div className="animate-fade-in stagger-4">
              <Collapsible title="Hay bị hiểu sai" icon="fa-solid fa-triangle-exclamation" defaultOpen={true}>
                <SlideNavigator
                  slides={misconceptionSlides}
                  onRequestMore={handleMoreMisconceptions}
                  moreLoading={misconceptionsLoading}
                  moreLabel="Thêm ví dụ"
                  renderSlide={(slideMisconceptions) => (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                      {slideMisconceptions?.map((m, i) => (
                        <div key={i} style={{
                          padding: '1rem',
                          background: 'var(--danger-light)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid rgba(192,57,43,0.2)',
                        }}>
                          <p style={{ margin: '0 0 0.35rem', color: 'var(--danger)', fontSize: '0.925rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <i className="fa-solid fa-xmark" />
                            <em>"{m.incorrect}"</em>
                          </p>
                          <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            {m.whyWrong}
                            {m.whyWrongTranslation && (
                              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginLeft: '0.4rem' }}>
                                ({m.whyWrongTranslation.replace(/^\(|\)$/g, '').trim()})
                              </span>
                            )}
                          </p>
                          <p style={{ margin: '0 0 0.35rem', color: 'var(--success)', fontSize: '0.925rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <i className="fa-solid fa-check" />
                            <em>"{m.correct}"</em>
                          </p>
                          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            {m.difference}
                            {m.translation && (
                              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginLeft: '0.4rem' }}>
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
            </div>
          )}

          {/* ── Quiz ── */}
          {quizzes.length > 0 && (
            <div className="animate-fade-in stagger-5">
              <Collapsible title="Bài tập dịch thuật" icon="fa-solid fa-pen-to-square" defaultOpen={false}>
                <SlideNavigator
                  slides={quizSlides}
                  onRequestMore={handleMoreQuizzes}
                  moreLoading={quizzesLoading}
                  moreLabel="Thêm câu hỏi"
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
            </div>
          )}

          {/* ── Từ liên quan ── */}
          {Array.isArray(ai.relatedConcepts) && ai.relatedConcepts.length > 0 && (
            <Card className="animate-fade-in stagger-5">
              <p style={{ margin: '0 0 0.875rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
                <i className="fa-solid fa-link" style={{ marginRight: '0.4rem', color: 'var(--accent)' }} />
                Từ liên quan
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {ai.relatedConcepts.map((c, i) => (
                  <span key={i} className="pill">{c}</span>
                ))}
              </div>
            </Card>
          )}

        </div>
      ) : (
        <Card>
          <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-circle-info" />
            Không có dữ liệu AI cho từ này.
          </p>
        </Card>
      )}

      <div style={{ height: '3rem' }} />
    </div>
  );
};

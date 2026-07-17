import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useServices } from '../ServiceProvider';
import type { Chapter, WordEntry } from '../../core/domain';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const formatChapterId = (id: string): string => {
  if (id.length !== 8) return id;
  return `${id.slice(6, 8)}/${id.slice(4, 6)}/${id.slice(0, 4)}`;
};

// ─────────────────────────────────────────────
// Collapsible chapter section
// ─────────────────────────────────────────────
const ChapterSection: React.FC<{
  chapter: Chapter;
  words: WordEntry[];
  index: number;
}> = ({ chapter, words, index }) => {
  const [open, setOpen] = useState(true);

  return (
    <div
      className="animate-fade-in"
      style={{
        animationDelay: `${index * 0.06}s`,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          borderBottom: open ? '1px solid var(--border)' : 'none',
          padding: '1rem 1.25rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          transition: 'background 0.2s',
          fontFamily: 'inherit',
        }}
        onMouseOver={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
        onMouseOut={e => (e.currentTarget.style.background = 'none')}
      >
        <span style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '36px', height: '36px',
          background: 'var(--accent-light)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--accent)',
          fontSize: '0.85rem',
          flexShrink: 0,
        }}>
          <i className="fa-regular fa-calendar-days" />
        </span>

        <span style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '0.01em',
          fontFamily: "'Inter', sans-serif",
          fontVariantNumeric: 'tabular-nums',
        }}>
          {formatChapterId(chapter.id)}
        </span>

        <span style={{
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          padding: '0.2rem 0.65rem',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--bg-secondary)',
          fontWeight: 500,
          marginLeft: '0.25rem',
        }}>
          {words.length} từ
        </span>

        <span style={{
          marginLeft: 'auto',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.25s var(--ease)',
          display: 'flex',
          alignItems: 'center',
        }}>
          <i className="fa-solid fa-chevron-down" />
        </span>
      </button>

      {/* Word grid */}
      {open && (
        <div style={{
          padding: '1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))',
          gap: '0.875rem',
          background: 'var(--bg-primary)',
        }}>
          {words.map((word, wi) => (
            <Link key={word.id} to={`/word/${word.id}`} style={{ textDecoration: 'none' }}>
              <div
                className="word-card animate-fade-in"
                style={{
                  animationDelay: `${wi * 0.04}s`,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  height: '100%',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{
                    margin: 0,
                    color: 'var(--accent)',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    fontFamily: "'Playfair Display', serif",
                  }}>
                    {word.word}
                  </h3>
                  {word.createdAt && (
                    <span style={{
                      fontSize: '0.65rem',
                      color: 'var(--text-muted)',
                      fontFamily: 'monospace',
                      flexShrink: 0,
                      marginLeft: '0.4rem',
                    }}>
                      {new Date(word.createdAt).toLocaleTimeString('vi-VN', { hour12: false })}
                    </span>
                  )}
                </div>
                <p style={{
                  margin: 0,
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.5,
                }}>
                  {word.aiData?.vietnameseExplanation?.split('\n')[0]?.slice(0, 80) || (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
                      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '0.7rem' }} />
                      Đang xử lý...
                    </span>
                  )}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Home Page
// ─────────────────────────────────────────────
export const Home: React.FC = () => {
  const { learningService } = useServices();
  const [chapters, setChapters] = useState<{ chapter: Chapter; words: WordEntry[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadChapters = async () => {
      try {
        const allChapters = await learningService.getChapters();
        const chaptersWithWords = await Promise.all(
          allChapters.map(async (chapter) => {
            const words = await learningService.getWordsByChapter(chapter.id);
            return { chapter, words };
          })
        );
        setChapters(chaptersWithWords.filter(c => c.words.length > 0));
      } catch (error) {
        console.error('Failed to load chapters:', error);
      } finally {
        setLoading(false);
      }
    };
    loadChapters();
  }, [learningService]);

  const filteredChapters = chapters
    .map(({ chapter, words }) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return { chapter, words };
      const formattedDate = formatChapterId(chapter.id);
      if (formattedDate.includes(query)) return { chapter, words };
      return { chapter, words: words.filter(w => w.word.toLowerCase().includes(query)) };
    })
    .filter(c => c.words.length > 0);

  const totalWords = chapters.reduce((s, c) => s + c.words.length, 0);

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>

      {/* ── Hero header ── */}
      <header className="animate-fade-in" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: '44px', height: '44px',
                background: 'linear-gradient(135deg, var(--accent) 0%, #a0632a 100%)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '1.25rem',
                boxShadow: 'var(--shadow-accent)',
              }}>
                <i className="fa-solid fa-book-open" />
              </div>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '2.4rem',
                fontWeight: 800,
                color: 'var(--accent)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}>
                Statelish
              </h1>
            </div>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              fontWeight: 400,
              letterSpacing: '0.01em',
            }}>
              Understand English.{' '}
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Don't Translate It.</span>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {!loading && totalWords > 0 && (
              <div className="animate-scale-in" style={{
                padding: '0.5rem 1rem',
                background: 'var(--accent-light)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--accent)',
                fontSize: '0.85rem',
                color: 'var(--accent)',
                fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}>
                <i className="fa-solid fa-layer-group" />
                {totalWords} từ
              </div>
            )}
            <Link to="/add" style={{ textDecoration: 'none' }}>
              <Button style={{ gap: '0.5rem' }}>
                <i className="fa-solid fa-plus" />
                Thêm từ mới
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Search Bar ── */}
      <div className="animate-fade-in stagger-1" style={{ marginBottom: '2rem', position: 'relative' }}>
        <label htmlFor="search-input" style={{ display: 'none' }}>Tìm kiếm</label>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', fontSize: '0.95rem', pointerEvents: 'none',
          }}>
            <i className="fa-solid fa-magnifying-glass" />
          </span>
          <input
            id="search-input"
            name="search"
            type="text"
            placeholder="Tìm từ vựng hoặc ngày (VD: 16/07/2026)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.9rem 1rem 0.9rem 2.75rem',
              border: '1.5px solid var(--border-strong)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'var(--transition)',
              fontFamily: 'inherit',
              boxShadow: 'var(--shadow-sm)',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'var(--accent)';
              e.target.style.boxShadow = '0 0 0 3px var(--accent-glow), var(--shadow-sm)';
            }}
            onBlur={e => {
              e.target.style.borderColor = 'var(--border-strong)';
              e.target.style.boxShadow = 'var(--shadow-sm)';
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', padding: '0.25rem',
                transition: 'color 0.15s',
              }}
              onMouseOver={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseOut={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div className="skeleton" style={{ height: '60px', margin: 0, borderRadius: 0 }} />
              <div style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: '0.875rem', background: 'var(--bg-primary)' }}>
                {[1, 2, 3, 4].map(j => (
                  <div key={j} className="skeleton" style={{ height: '80px', borderRadius: 'var(--radius-md)' }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : chapters.length === 0 ? (
        <Card className="animate-scale-in" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3, color: 'var(--accent)' }}>
            <i className="fa-solid fa-book-open" />
          </div>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontFamily: "'Playfair Display', serif" }}>
            Cuốn sách của bạn đang trống
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Hãy bắt đầu thêm từ vựng đầu tiên của bạn!
          </p>
          <Link to="/add">
            <Button>
              <i className="fa-solid fa-plus" />
              Thêm từ đầu tiên
            </Button>
          </Link>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredChapters.length > 0 ? (
            filteredChapters.map(({ chapter, words }, i) => (
              <ChapterSection key={chapter.id} chapter={chapter} words={words} index={i} />
            ))
          ) : (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '1.75rem', marginBottom: '0.75rem', display: 'block', opacity: 0.4 }} />
              <p>Không tìm thấy kết quả cho <strong style={{ color: 'var(--text-secondary)' }}>"{searchQuery}"</strong></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

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
  // id format: YYYYMMDD → DD/MM/YYYY
  if (id.length !== 8) return id;
  return `${id.slice(6, 8)}/${id.slice(4, 6)}/${id.slice(0, 4)}`;
};

// ─────────────────────────────────────────────
// Collapsible chapter header
// ─────────────────────────────────────────────
const ChapterSection: React.FC<{
  chapter: Chapter;
  words: WordEntry[];
}> = ({ chapter, words }) => {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
      {/* Clickable header / toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          borderBottom: open ? '1px solid rgba(255,255,255,0.1)' : 'none',
          padding: '1rem 1.25rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          transition: 'background 0.2s'
        }}
      >
        <span style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '0.03em',
        }}>
          {formatChapterId(chapter.id)}
        </span>
        <span style={{
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          opacity: 0.8,
          padding: '0.2rem 0.6rem',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '999px',
          backgroundColor: 'rgba(255,255,255,0.03)'
        }}>
          {words.length} từ
        </span>
        <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: '0.75rem', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          ▼
        </span>
      </button>

      {/* Word grid */}
      {open && (
        <div style={{
          padding: '1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
          backgroundColor: 'var(--bg-color)'
        }}>
          {words.map((word) => (
            <Link key={word.id} to={`/word/${word.id}`} style={{ textDecoration: 'none' }}>
              <Card
                className="word-card"
                style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', height: '100%', backgroundColor: 'rgba(255,255,255,0.02)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, color: 'var(--accent-color)', fontSize: '1.1rem' }}>{word.word}</h3>
                  {word.createdAt ? (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.6, fontFamily: 'monospace' }}>
                      {new Date(word.createdAt).toLocaleTimeString('vi-VN', { hour12: false })}
                    </span>
                  ) : null}
                </div>
                <p style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {word.aiData?.vietnameseExplanation?.split('\n')[0]?.slice(0, 80) || 'Processing...'}
                </p>
              </Card>
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

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '3rem 1.5rem', position: 'relative' }}>
      {/* Background glow effects */}
      <div style={{ position: 'absolute', top: '-100px', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(40px)', zIndex: -1, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '50px', right: '10%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(40px)', zIndex: -1, pointerEvents: 'none' }} />

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
        <div>
          <h1 style={{ 
            margin: '0 0 0.5rem', 
            fontSize: '3rem', 
            fontWeight: 800,
            background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em'
          }}>
            Statelish
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 500, letterSpacing: '0.01em' }}>
            Understand English. <span style={{ color: 'rgba(255,255,255,0.7)' }}>Don't Translate It.</span>
          </p>
        </div>
        <Link to="/add" style={{ textDecoration: 'none' }}>
          <Button style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 600,
            boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            + Add Word
          </Button>
        </Link>
      </header>

      {loading ? (
        <p>Loading your learning book...</p>
      ) : chapters.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>Your book is empty.</h3>
          <Link to="/add">
            <Button style={{ marginTop: '1rem' }}>Add your first word</Button>
          </Link>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {chapters.map(({ chapter, words }) => (
            <ChapterSection key={chapter.id} chapter={chapter} words={words} />
          ))}
        </div>
      )}
    </div>
  );
};

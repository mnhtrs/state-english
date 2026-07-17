import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useServices } from '../ServiceProvider';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export const AddWord: React.FC = () => {
  const navigate = useNavigate();
  const { learningService } = useServices();

  const [word, setWord] = useState('');
  const [sentence, setSentence] = useState('');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word || !sentence) {
      setError('Từ và câu gốc là bắt buộc.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newEntry = await learningService.addWord(word, sentence, source);
      navigate(`/word/${newEntry.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Đã có lỗi xảy ra khi phân tích từ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '580px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>

      {/* Back link */}
      <Link
        to="/"
        className="animate-fade-in"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          marginBottom: '1.75rem',
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
          fontWeight: 500,
          transition: 'color 0.2s',
        }}
        onMouseOver={e => (e.currentTarget.style.color = 'var(--accent)')}
        onMouseOut={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
      >
        <i className="fa-solid fa-arrow-left" />
        Quay về danh sách
      </Link>

      <Card className="animate-scale-in" style={{ padding: '2rem 2rem 2.5rem' }}>
        {/* Card header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '40px', height: '40px',
              background: 'linear-gradient(135deg, var(--accent) 0%, #a0632a 100%)',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '1rem',
              boxShadow: 'var(--shadow-accent)',
            }}>
              <i className="fa-solid fa-plus" />
            </div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.6rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
            }}>
              Thêm từ mới
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginLeft: '52px' }}>
            AI sẽ phân tích và tạo ngữ cảnh học tập cho bạn
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Input
            label="Từ vựng"
            placeholder="VD: delegate"
            value={word}
            onChange={e => setWord(e.target.value)}
            disabled={loading}
            icon="fa-solid fa-spell-check"
          />
          <Input
            label="Câu gốc (ngữ cảnh)"
            placeholder="VD: I had to delegate the task to my team."
            value={sentence}
            onChange={e => setSentence(e.target.value)}
            disabled={loading}
            icon="fa-solid fa-quote-left"
          />
          <Input
            label="Nguồn học (tuỳ chọn)"
            placeholder="VD: Head First Design Patterns"
            value={source}
            onChange={e => setSource(e.target.value)}
            disabled={loading}
            icon="fa-solid fa-bookmark"
          />

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              color: 'var(--danger)',
              marginTop: '0.5rem',
              padding: '0.875rem 1rem',
              background: 'var(--danger-light)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(192,57,43,0.2)',
              fontSize: '0.875rem',
              animation: 'fadeIn 0.25s ease',
            }}>
              <i className="fa-solid fa-circle-exclamation" />
              {error}
            </div>
          )}

          <div style={{ marginTop: '1.5rem' }}>
            <Button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '0.875rem', fontSize: '0.95rem', justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" />
                  Đang phân tích với Statelish AI...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-wand-magic-sparkles" />
                  Thêm &amp; Phân tích
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Tips section */}
      <div className="animate-fade-in stagger-3" style={{
        marginTop: '1.5rem',
        padding: '1.25rem',
        background: 'var(--accent-light)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--accent)',
        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
      }}>
        <i className="fa-solid fa-lightbulb" style={{ color: 'var(--accent)', marginTop: '2px', flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.3rem', fontWeight: 600 }}>
            Mẹo học hiệu quả
          </p>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
            Hãy nhập câu gốc mà bạn thực sự gặp từ này — ngữ cảnh thực sẽ giúp AI tạo giải thích chính xác hơn.
          </p>
        </div>
      </div>
    </div>
  );
};

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
      setError('Word and Original Sentence are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newEntry = await learningService.addWord(word, sentence, source);
      navigate(`/word/${newEntry.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while analyzing the word.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <Link to="/" style={{ display: 'inline-block', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
        &larr; Back to Book
      </Link>
      
      <Card>
        <h2 style={{ margin: '0 0 1.5rem 0' }}>Add a New Word</h2>
        <form onSubmit={handleSubmit}>
          <Input 
            label="Word" 
            placeholder="e.g. delegate"
            value={word}
            onChange={e => setWord(e.target.value)}
            disabled={loading}
          />
          <Input 
            label="Original Sentence (Context)" 
            placeholder="e.g. I had to delegate the task to my team."
            value={sentence}
            onChange={e => setSentence(e.target.value)}
            disabled={loading}
          />
          <Input 
            label="Learning Source (Optional)" 
            placeholder="e.g. Head First Design Patterns"
            value={source}
            onChange={e => setSource(e.target.value)}
            disabled={loading}
          />
          
          {error && (
            <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--border-radius)' }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: '2rem' }}>
            <Button type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Analyzing with Statelish AI...' : 'Add Word'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

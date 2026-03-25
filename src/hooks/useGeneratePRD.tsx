import { useState, useCallback } from 'react';
import { toast } from 'sonner';

type PRDStatus = 'idle' | 'generating' | 'done' | 'error';

interface ProjectData {
  project: any;
  requirements: any[];
  meetings: any[];
  files: any[];
  tags: any[];
}

export function useGeneratePRD() {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<PRDStatus>('idle');

  const generate = useCallback(async (data: ProjectData) => {
    setContent('');
    setStatus('generating');

    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-prd`;

    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(data),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Erro ao gerar PRD' }));
        throw new Error(err.error || `Erro ${resp.status}`);
      }

      if (!resp.body) throw new Error('Stream não disponível');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const token = parsed.choices?.[0]?.delta?.content;
            if (token) {
              accumulated += token;
              setContent(accumulated);
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      setStatus('done');
    } catch (e: any) {
      console.error('PRD generation error:', e);
      setStatus('error');
      toast.error(e.message || 'Erro ao gerar PRD');
    }
  }, []);

  const reset = useCallback(() => {
    setContent('');
    setStatus('idle');
  }, []);

  return { content, status, generate, reset };
}

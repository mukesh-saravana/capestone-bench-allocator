import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Paper, Typography, TextField, IconButton, Chip, Divider,
  CircularProgress, Card, CardContent,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import type { ChatMessage, Recommendation } from '../../types';
import { getBenchMetrics, getProjectNeeds, getUtilizationMetrics, queryChat } from '../../lib/api';
import { useToast } from '../../store/ToastContext';
import { tokens } from '../../theme';
import { CandidateCard } from '../recommendations/CandidateCard';

const SUGGESTED_PROMPTS = [
  "Who's available on the bench?",
  'Best match for a React project?',
  'Show underutilized team members',
  'Find a DevOps engineer',
];

function MessageBubble({ msg, onAssign }: { msg: ChatMessage; onAssign?: (r: Recommendation) => void }) {
  const isUser = msg.role === 'user';
  return (
    <Box sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', mb: 2 }}>
      <Box
        sx={{
          maxWidth: '70%',
          bgcolor: isUser ? tokens.colors.primary : tokens.colors.neutral,
          color: isUser ? '#fff' : tokens.colors.text,
          borderRadius: 2, px: 2, py: 1.5,
        }}
      >
        <Typography variant="body1" sx={{ color: 'inherit', lineHeight: 1.6 }}>{msg.content}</Typography>
        {msg.recommendations && (
          <Box sx={{ mt: 2 }}>
            {msg.recommendations.map((r) => (
              <CandidateCard key={r.id} recommendation={r} compact onAssign={onAssign} />
            ))}
          </Box>
        )}
        <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.65, fontSize: '0.7rem' }}>
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      </Box>
    </Box>
  );
}

function TypingIndicator() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
      <Box sx={{ bgcolor: tokens.colors.neutral, borderRadius: 2, px: 2, py: 1.5, display: 'flex', gap: 0.5 }}>
        {[0, 1, 2].map((i) => (
          <Box key={i} sx={{
            width: 7, height: 7, borderRadius: '50%', bgcolor: tokens.colors.textTertiary,
            animation: 'bounce 1.2s infinite',
            animationDelay: `${i * 0.2}s`,
            '@keyframes bounce': {
              '0%, 80%, 100%': { transform: 'scale(0.7)', opacity: 0.5 },
              '40%': { transform: 'scale(1)', opacity: 1 },
            },
          }} />
        ))}
      </Box>
    </Box>
  );
}

export function ChatPage({ onAssign }: { onAssign?: (r: Recommendation) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState('All');
  const { showToast } = useToast();
  const benchQuery = useQuery({ queryKey: ['dashboard', 'bench'], queryFn: getBenchMetrics });
  const utilizationQuery = useQuery({ queryKey: ['dashboard', 'utilization'], queryFn: getUtilizationMetrics });
  const projectNeedsQuery = useQuery({ queryKey: ['project-needs'], queryFn: getProjectNeeds });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`, role: 'user', content: text, timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await queryChat({
        query: text,
        strategy: 'hybrid',
        filters: department === 'All' ? undefined : { department },
      });
      const reply: ChatMessage = {
        id: response.messageId,
        role: 'assistant',
        content: response.answer,
        recommendations: response.recommendations,
        evidenceSnippets: response.evidenceSnippets,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, reply]);
    } catch {
      showToast('Unable to fetch assistant response. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2.5, height: 'calc(100vh - 120px)', minHeight: 500 }}>
      {/* Chat Panel (65%) */}
      <Paper sx={{ flex: '0 0 65%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Typography variant="h3">Staffing Assistant</Typography>
        </Box>

        {/* Messages */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {messages.length === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 1 }}>
              <Typography sx={{ fontSize: 40 }}>💬</Typography>
              <Typography variant="h3" color="text.secondary">Ask a staffing question to get started.</Typography>
            </Box>
          )}
          {messages.map((m) => <MessageBubble key={m.id} msg={m} onAssign={onAssign} />)}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </Box>

        <Divider />

        {/* Suggested prompts */}
        <Box sx={{ px: 2, pt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {SUGGESTED_PROMPTS.map((p) => (
            <Chip key={p} label={p} size="small" variant="outlined" clickable onClick={() => send(p)}
              sx={{ borderColor: tokens.colors.primary, color: tokens.colors.primary, fontSize: '0.75rem' }} />
          ))}
        </Box>

        {/* Input */}
        <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
          <TextField
            fullWidth multiline maxRows={3} value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Ask for resource recommendations… e.g., 'Find a React developer for Q3'"
            disabled={loading}
          />
          <IconButton
            color="primary" onClick={() => send(input)} disabled={!input.trim() || loading}
            sx={{ bgcolor: tokens.colors.primary, color: '#fff', borderRadius: 1, '&:hover': { bgcolor: '#1565C0' }, '&:disabled': { bgcolor: tokens.colors.neutral } }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          </IconButton>
        </Box>
      </Paper>

      {/* Context Panel (35%) */}
      <Box sx={{ flex: '0 0 35%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h3" sx={{ mb: 1.5 }}>Relevant Data</Typography>
          {[
            { label: 'Currently on Bench', value: `${benchQuery.data?.totalOnBench ?? '—'} engineers` },
            { label: 'Open Project Needs', value: `${projectNeedsQuery.data?.length ?? '—'} roles` },
            { label: 'Average Utilization', value: `${utilizationQuery.data?.averagePct ?? '—'}%` },
          ].map(({ label, value }) => (
            <Card key={label} sx={{ mb: 1, bgcolor: tokens.colors.neutral }}>
              <CardContent sx={{ py: '10px !important', px: 2 }}>
                <Typography variant="body2">{label}</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: tokens.colors.primary }}>{value}</Typography>
              </CardContent>
            </Card>
          ))}
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h3" sx={{ mb: 1.5 }}>Quick Filters</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>Department</Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {['All', 'Frontend', 'Backend', 'Platform', 'Data'].map((d) => (
              <Chip key={d} label={d} size="small" variant={d === department ? 'filled' : 'outlined'}
                color={d === department ? 'primary' : 'default'} clickable onClick={() => setDepartment(d)} />
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Paper, Typography, TextField, IconButton, Chip, Divider,
  CircularProgress, Avatar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { motion, AnimatePresence } from 'framer-motion';
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

const MotionBox = motion(Box);

function AiAvatar() {
  return (
    <Box sx={{
      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
      background: tokens.gradients.primary,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: tokens.shadows.colored(tokens.colors.primary),
      mt: 0.25,
    }}>
      <SmartToyOutlinedIcon sx={{ fontSize: 16, color: '#fff' }} />
    </Box>
  );
}

function MessageBubble({ msg, onAssign }: { msg: ChatMessage; onAssign?: (r: Recommendation) => void }) {
  const isUser = msg.role === 'user';
  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <MotionBox
      layout
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', mb: 2.5, gap: 1.25, alignItems: 'flex-start' }}
    >
      {!isUser && <AiAvatar />}

      <Box sx={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        {/* Sender label */}
        <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: tokens.colors.textTertiary, mb: 0.5, px: 0.5 }}>
          {isUser ? 'You' : 'Bench Allocator AI'}
        </Typography>

        {/* Bubble */}
        <Box
          sx={{
            px: 2, py: 1.5,
            borderRadius: isUser
              ? `${tokens.borderRadius.bubble}px ${tokens.borderRadius.bubble}px 6px ${tokens.borderRadius.bubble}px`
              : `${tokens.borderRadius.bubble}px ${tokens.borderRadius.bubble}px ${tokens.borderRadius.bubble}px 6px`,
            background: isUser
              ? tokens.gradients.primary
              : tokens.gradients.aiMessage,
            color: isUser ? '#fff' : tokens.colors.text,
            boxShadow: isUser ? tokens.shadows.colored(tokens.colors.primary) : tokens.shadows.sm,
            border: isUser ? 'none' : `1px solid ${tokens.colors.border}`,
          }}
        >
          <Typography variant="body1" sx={{ color: 'inherit', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
            {msg.content}
          </Typography>

          {msg.recommendations && msg.recommendations.length > 0 && (
            <Box sx={{ mt: 2 }}>
              {msg.recommendations.map((r) => (
                <CandidateCard key={r.id} recommendation={r} compact onAssign={onAssign} />
              ))}
            </Box>
          )}
        </Box>

        {/* Timestamp */}
        <Typography variant="body2" sx={{ mt: 0.5, px: 0.5, fontSize: '0.65rem', opacity: 0.7 }}>
          {time}
        </Typography>
      </Box>

      {isUser && (
        <Avatar sx={{
          width: 32, height: 32, flexShrink: 0, mt: 0.25,
          background: tokens.gradients.primary,
          fontSize: '0.7rem', fontWeight: 700,
          boxShadow: tokens.shadows.colored(tokens.colors.primary),
        }}>
          Me
        </Avatar>
      )}
    </MotionBox>
  );
}

function TypingIndicator() {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, mb: 2.5 }}
    >
      <AiAvatar />
      <Box sx={{ bgcolor: tokens.gradients.aiMessage, border: `1px solid ${tokens.colors.border}`, borderRadius: `${tokens.borderRadius.bubble}px ${tokens.borderRadius.bubble}px ${tokens.borderRadius.bubble}px 6px`, px: 2, py: 1.5, display: 'flex', gap: 0.5, alignItems: 'center' }}>
        {[0, 1, 2].map((i) => (
          <Box key={i} sx={{
            width: 7, height: 7, borderRadius: '50%',
            bgcolor: tokens.colors.primary,
            opacity: 0.6,
            animation: 'dotBounce 1.4s infinite ease-in-out',
            animationDelay: `${i * 0.16}s`,
            '@keyframes dotBounce': {
              '0%, 80%, 100%': { transform: 'scale(0.65)', opacity: 0.4 },
              '40%': { transform: 'scale(1)', opacity: 1 },
            },
          }} />
        ))}
      </Box>
    </MotionBox>
  );
}

function EmptyChatState({ onPrompt }: { onPrompt: (p: string) => void }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2.5, px: 3 }}>
      <Box sx={{
        width: 72, height: 72, borderRadius: '50%',
        background: tokens.gradients.primary,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: tokens.shadows.colored(tokens.colors.primary),
        animation: 'floatPulse 3s ease-in-out infinite',
        '@keyframes floatPulse': {
          '0%, 100%': { transform: 'translateY(0px)', boxShadow: tokens.shadows.colored(tokens.colors.primary) },
          '50%': { transform: 'translateY(-6px)', boxShadow: `0 16px 40px -4px ${tokens.colors.primary}50` },
        },
      }}>
        <AutoAwesomeIcon sx={{ color: '#fff', fontSize: 32 }} />
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: tokens.colors.text, mb: 0.75 }}>
          Your AI Staffing Assistant
        </Typography>
        <Typography variant="body1" sx={{ color: tokens.colors.textTertiary, maxWidth: 340 }}>
          Ask about bench availability, skill matches, or get ranked candidates for your open roles.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 400 }}>
        {SUGGESTED_PROMPTS.map((p) => (
          <Chip key={p} label={p} size="small" clickable onClick={() => onPrompt(p)}
            sx={{
              borderColor: `${tokens.colors.primary}40`, color: tokens.colors.primary,
              bgcolor: `${tokens.colors.primary}08`, fontWeight: 500,
              '&:hover': { bgcolor: `${tokens.colors.primary}15`, borderColor: `${tokens.colors.primary}60` },
            }}
            variant="outlined"
          />
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

  const contextItems = [
    { label: 'Engineers on Bench', value: `${benchQuery.data?.totalOnBench ?? '—'}`, color: tokens.colors.primary, gradient: tokens.gradients.primarySoft },
    { label: 'Open Roles', value: `${projectNeedsQuery.data?.length ?? '—'}`, color: tokens.colors.danger, gradient: tokens.gradients.dangerSoft },
    { label: 'Avg Utilization', value: `${utilizationQuery.data?.averagePct ?? '—'}%`, color: tokens.colors.success, gradient: tokens.gradients.successSoft },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 2.5, height: 'calc(100vh - 120px)', minHeight: 500 }}>

      {/* ── Chat Panel (65%) ── */}
      <Paper sx={{ flex: '0 0 65%', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: `1px solid ${tokens.colors.border}` }}>

        {/* Header */}
        <Box sx={{
          px: 2.5, py: 1.75, borderBottom: `1px solid ${tokens.colors.border}`,
          display: 'flex', alignItems: 'center', gap: 1.5,
          background: `linear-gradient(135deg, ${tokens.colors.neutral} 0%, #fff 100%)`,
        }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 2,
            background: tokens.gradients.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: tokens.shadows.colored(tokens.colors.primary),
          }}>
            <AutoAwesomeIcon sx={{ color: '#fff', fontSize: 18 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: tokens.colors.text, lineHeight: 1.2 }}>
              Staffing Assistant
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.2 }}>RAG-powered · Hybrid retrieval</Typography>
          </Box>
          <Chip
            label="● Live"
            size="small"
            sx={{
              bgcolor: `${tokens.colors.success}12`, color: tokens.colors.success,
              fontWeight: 600, fontSize: '0.7rem',
              border: `1px solid ${tokens.colors.success}30`,
            }}
          />
        </Box>

        {/* Messages */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2.5,
          backgroundImage: `radial-gradient(${tokens.colors.primary}06 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}>
          {messages.length === 0 ? (
            <EmptyChatState onPrompt={send} />
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((m) => <MessageBubble key={m.id} msg={m} onAssign={onAssign} />)}
              {loading && <TypingIndicator key="typing" />}
            </AnimatePresence>
          )}
          <div ref={bottomRef} />
        </Box>

        <Divider />

        {/* Quick prompts — only shown once there are messages */}
        {messages.length > 0 && (
          <Box sx={{ px: 2, pt: 1.25, pb: 0.5, display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            {SUGGESTED_PROMPTS.map((p) => (
              <Chip key={p} label={p} size="small" variant="outlined" clickable onClick={() => void send(p)}
                sx={{ borderColor: `${tokens.colors.primary}40`, color: tokens.colors.primary, fontSize: '0.72rem', fontWeight: 500,
                  '&:hover': { bgcolor: `${tokens.colors.primary}08` } }} />
            ))}
          </Box>
        )}

        {/* Input row */}
        <Box sx={{ p: 2, display: 'flex', gap: 1.25, alignItems: 'flex-end' }}>
          <TextField
            fullWidth multiline maxRows={4} value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(input); } }}
            placeholder="Ask for resource recommendations… e.g., 'Find a React developer for Q3'"
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: tokens.colors.neutral,
                '&.Mui-focused': { bgcolor: '#fff' },
              },
            }}
          />
          <IconButton
            onClick={() => void send(input)}
            disabled={!input.trim() || loading}
            sx={{
              width: 42, height: 42, flexShrink: 0,
              background: !input.trim() || loading ? tokens.colors.neutralDark : tokens.gradients.primary,
              color: !input.trim() || loading ? tokens.colors.textTertiary : '#fff',
              borderRadius: 2,
              boxShadow: !input.trim() || loading ? 'none' : tokens.shadows.colored(tokens.colors.primary),
              transition: 'all 200ms ease',
              '&:hover': { transform: !input.trim() || loading ? 'none' : 'translateY(-1px)', opacity: 0.9 },
              '&:disabled': { background: tokens.colors.neutralDark, color: tokens.colors.textTertiary },
            }}
          >
            {loading ? <CircularProgress size={18} sx={{ color: tokens.colors.primary }} /> : <SendIcon sx={{ fontSize: 18 }} />}
          </IconButton>
        </Box>
      </Paper>

      {/* ── Context Panel (35%) ── */}
      <Box sx={{ flex: '0 0 35%', display: 'flex', flexDirection: 'column', gap: 2 }}>

        {/* Live Metrics */}
        <Paper sx={{ p: 2.5, border: `1px solid ${tokens.colors.border}` }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: tokens.colors.text, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: tokens.colors.success, display: 'inline-block', boxShadow: `0 0 6px ${tokens.colors.success}80` }} />
            Live Snapshot
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {contextItems.map(({ label, value, color, gradient }) => (
              <Box key={label} sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                p: 1.5, borderRadius: 2, background: gradient,
                border: `1px solid ${color}20`,
              }}>
                <Typography sx={{ fontSize: '0.8rem', color: tokens.colors.textSecondary, fontWeight: 500 }}>{label}</Typography>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.03em' }}>{value}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Department Filter */}
        <Paper sx={{ p: 2.5, border: `1px solid ${tokens.colors.border}` }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: tokens.colors.text, mb: 0.5 }}>
            Filter by Department
          </Typography>
          <Typography variant="body2" sx={{ mb: 1.5 }}>Narrow AI responses to a specific team</Typography>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            {['All', 'Frontend', 'Backend', 'Platform', 'Data'].map((d) => (
              <Chip key={d} label={d} size="small"
                variant={d === department ? 'filled' : 'outlined'}
                clickable onClick={() => setDepartment(d)}
                sx={d === department ? {
                  background: tokens.gradients.primary, color: '#fff', fontWeight: 600, border: 'none',
                  boxShadow: tokens.shadows.colored(tokens.colors.primary),
                } : {
                  borderColor: tokens.colors.border, color: tokens.colors.textSecondary,
                  '&:hover': { bgcolor: tokens.colors.neutral, borderColor: tokens.colors.primary, color: tokens.colors.primary },
                }}
              />
            ))}
          </Box>
        </Paper>

        {/* Tips */}
        <Paper sx={{
          p: 2.5, border: `1px solid ${tokens.colors.primary}20`,
          background: tokens.gradients.primarySoft,
        }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: tokens.colors.primary, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AutoAwesomeIcon sx={{ fontSize: 14 }} />
            Pro Tips
          </Typography>
          {[
            'Mention specific skills for better matches',
            'Add project timeline for availability check',
            'Ask for "top 3" to get ranked candidates',
          ].map((tip) => (
            <Typography key={tip} variant="body2" sx={{ display: 'flex', gap: 0.75, mb: 0.5, color: tokens.colors.textSecondary, '&::before': { content: '"→"', color: tokens.colors.primary, flexShrink: 0 } }}>
              {tip}
            </Typography>
          ))}
        </Paper>
      </Box>
    </Box>
  );
}

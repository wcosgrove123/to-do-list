import type { CategorizationResult } from '@/lib/ai/ollama';
import type { ChatMessage as DBChatMessage } from '@/lib/db/supabase';

export type { CategorizationResult, DBChatMessage };

export interface ChatMessageUI extends Omit<DBChatMessage, 'action_payload'> {
  action_payload?: CategorizationResult;
  isLoading?: boolean;
}

export interface ChatState {
  messages: ChatMessageUI[];
  isProcessing: boolean;
  error: string | null;
}

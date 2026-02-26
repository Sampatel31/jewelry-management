import { Request, Response } from 'express';
import db from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import {
  SYSTEM_PROMPT,
  fetchRoleContext,
  sanitizeResponse,
  ruleFallback,
} from '../utils/aiSafety';
import logger from '../utils/logger';

export const aiChat = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ message: 'message is required' });
  }

  const logId = uuidv4();
  let response = '';
  let usedFallback = true;

  try {
    const roleCtx = await fetchRoleContext(user.id, user.role);
    const contextStr = JSON.stringify(roleCtx.context, null, 2);

    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      try {
        const { default: OpenAI } = await import('openai');
        const openai = new OpenAI({ apiKey: openaiKey });
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: `${SYSTEM_PROMPT}\n\nBusiness context:\n${contextStr}` },
            { role: 'user', content: message },
          ],
          max_tokens: 500,
          temperature: 0.3,
        });
        response = sanitizeResponse(
          completion.choices[0]?.message?.content || ruleFallback(message, roleCtx),
        );
        usedFallback = false;
      } catch (aiErr: any) {
        logger.warn('openai_error', { message: aiErr.message });
        response = ruleFallback(message, roleCtx);
      }
    } else {
      response = ruleFallback(message, roleCtx);
    }

    // Log to ai_interaction_logs
    try {
      await db('ai_interaction_logs').insert({
        id: logId,
        user_id: user.id,
        user_role: user.role,
        user_message: message,
        ai_response: response,
        used_fallback: usedFallback,
        context_snapshot: JSON.stringify(roleCtx.context),
        created_at: new Date(),
      });
    } catch (logErr) {
      logger.warn('ai_log_error', { logErr });
    }

    res.json({ response, disclaimer: 'Read-only AI assistant. Data shown is a system summary.' });
  } catch (err: any) {
    logger.error('ai_chat_error', { err });
    res.status(500).json({ message: 'AI service temporarily unavailable' });
  }
};

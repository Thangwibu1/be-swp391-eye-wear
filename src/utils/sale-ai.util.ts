import { model } from '../config/google-gemini-ai.config';
import { buildAnswerPrompt, buildAskSlotPrompt, buildIntentPrompt } from './prompt.util';
export function isAISessionExpired(lastInteractionAt: Date): boolean {
    const now = Date.now();
    const last = new Date(lastInteractionAt).getTime();

    return now - last > 30 * 60 * 1000;
}
export function resetSession(session: any) {
    session.intent = {};
    session.stage = 'DISCOVERY';
}

export async function extractIntentByLLM(message: string) {
    const prompt = buildIntentPrompt(message);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    try {
        // clean markdown nếu Gemini bọc ```json
        const cleaned = text.replace(/```json|```/g, '').trim();
        console.log('>>>> cleaned text::', cleaned);
        return JSON.parse(cleaned);
    } catch (err) {
        console.error('AI JSON parse failed:', text);
        return {}; // fallback để tránh crash
    }
}
export function isReadyToRecommend(intent: any) {
    return intent.type && intent.gender;
}
export function getMissingRequiredSlots(
  intent: Record<string, any>,
  required: readonly string[]
): string[] {
  return required.filter((slot) => {
    const value = intent[slot];
    return value === undefined || value === null;
  });
}
export function mergeIntent(oldIntent: any, patch: any) {
  const newIntent = { ...oldIntent };

  for (const key of Object.keys(patch)) {
    const value = patch[key];

    if (value === undefined) continue;

    newIntent[key] = value;
  }

  return newIntent;
}
export async function askForMissingSlots(
  missingSlot: string,
  intent: any,
  userMessage: string
): Promise<string> {
  const prompt = buildAskSlotPrompt(missingSlot, intent, userMessage);

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
export function cleanAIResponse(rawText: string): string {
    if (!rawText) return "";
    let cleaned = rawText.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
}
export async function getAnswerByLLM(message: string, products: any[]) {
    const prompt = buildAnswerPrompt(message, products);
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Dọn dẹp HTML trước khi gửi xuống Frontend
    const finalHTML = cleanAIResponse(text);
    return finalHTML;
}
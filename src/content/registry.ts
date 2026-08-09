import type { LessonContent } from '../types/lessonContent'
import { rustBeginnerContent } from './rustBeginner.content'
import { rustIntermediateContent } from './rustIntermediate.content'
import { rustAdvancedContent } from './rustAdvanced.content'
import { tauriBeginnerContent } from './tauriBeginner.content'
import { tauriIntermediateContent } from './tauriIntermediate.content'
import { tauriAdvancedContent } from './tauriAdvanced.content'
import { productionContent } from './production.content'

export const CONTENT_REGISTRY: Record<string, LessonContent> = {
  ...rustBeginnerContent,
  ...rustIntermediateContent,
  ...rustAdvancedContent,
  ...tauriBeginnerContent,
  ...tauriIntermediateContent,
  ...tauriAdvancedContent,
  ...productionContent,
}

export function getLessonContent(lessonId: string): LessonContent | undefined {
  return CONTENT_REGISTRY[lessonId]
}

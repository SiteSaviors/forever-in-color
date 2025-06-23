
import { IDENTITY_PRESERVATION_RULES } from './config.ts';

export class PromptEnhancer {
  static enhanceForIdentityPreservation(originalPrompt: string): string {
    return `${originalPrompt}${IDENTITY_PRESERVATION_RULES}`;
  }
}

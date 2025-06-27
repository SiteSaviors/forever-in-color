
export const REPLICATE_CONFIG = {
  baseUrl: "https://api.replicate.com/v1",
  model: "openai/gpt-image-1",
  defaultOutputFormat: "jpg",
  maxPollAttempts: 30,
  pollIntervalMs: 2000,
  timeoutMinutes: 2
} as const;

export const IDENTITY_PRESERVATION_RULES = `

IMPORTANT IDENTITY PRESERVATION RULES:
- Keep the EXACT same facial structure and bone structure
- Maintain IDENTICAL eye color and eye shape
- Preserve the EXACT same nose, mouth, and jawline
- Do not change hair color, length, or style
- Keep the EXACT same skin tone and complexion
- Maintain identical body posture and positioning
- Preserve all clothing and accessories exactly as shown
- Do not add, remove, or modify any person's features
- This is the SAME PERSON, just in a different artistic style`;

// Simple hash function - can be used in both server and client
// NOT SECURE FOR PRODUCTION - Use bcrypt in production
export function simpleHash(password: string): string {
  // Simple base64 encoding for demo
  return Buffer.from(password + "energeez-salt").toString("base64");
}

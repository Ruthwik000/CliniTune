import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    geminiKeyLength: process.env.GEMINI_API_KEY?.length,
    geminiKeyStart: process.env.GEMINI_API_KEY?.substring(0, 10),
    hasMongoUri: !!process.env.MONGODB_URI,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    allEnvKeys: Object.keys(process.env).filter(key => 
      key.includes('GEMINI') || 
      key.includes('MONGO') || 
      key.includes('NEXTAUTH')
    )
  });
}
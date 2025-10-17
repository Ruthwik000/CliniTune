import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'GEMINI_API_KEY not configured',
        apiKeyConfigured: false,
      });
    }

    // Test Gemini API
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const result = await model.generateContent('Say "Hello, I am working!" in a friendly way.');
    const response = result.response.text();

    return NextResponse.json({
      success: true,
      message: 'Gemini API working correctly',
      testResponse: response,
      apiKeyConfigured: true,
    });

  } catch (error: any) {
    console.error('Gemini Test Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Connection failed',
      apiKeyConfigured: !!process.env.GEMINI_API_KEY,
    });
  }
}
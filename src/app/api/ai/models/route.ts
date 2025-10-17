import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== Listing Available Models ===');
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'No API key configured'
      });
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    console.log('Fetching models from Gemini API...');
    const models = await genAI.listModels();
    console.log(`Found ${models.length} models`);
    
    const modelList = models.map(model => ({
      name: model.name,
      displayName: model.displayName,
      description: model.description,
      supportedGenerationMethods: model.supportedGenerationMethods,
      inputTokenLimit: model.inputTokenLimit,
      outputTokenLimit: model.outputTokenLimit
    }));
    
    console.log('Available models:', modelList.map(m => m.name));
    
    return NextResponse.json({
      success: true,
      count: models.length,
      models: modelList,
      apiKeyValid: true
    });

  } catch (error: any) {
    console.error('Models list error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      errorType: error.name,
      apiKeyExists: !!process.env.GEMINI_API_KEY,
      suggestion: 'Check if your API key has proper permissions'
    });
  }
}
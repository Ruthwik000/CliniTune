import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== Simple AI Test Starting ===');
    
    // Check environment
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey?.length);
    console.log('API Key starts with:', apiKey?.substring(0, 10));
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'No API key found',
        env: process.env.NODE_ENV
      });
    }

    // Try to import and use Gemini
    console.log('Importing GoogleGenerativeAI...');
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    console.log('Import successful');
    
    console.log('Creating GenAI instance...');
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('GenAI instance created');
    
    console.log('Testing models...');
    
    const modelsToTry = [
      'gemini-2.0-flash-exp',      // Latest Flash 2.0 - Fastest
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash', 
      'gemini-1.5-pro-latest',
      'gemini-1.5-pro',
      'gemini-pro'
    ];
    
    let workingModel = null;
    let response = null;
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            maxOutputTokens: 50,
            temperature: 0.7,
          }
        });
        
        const result = await model.generateContent('Hello, respond with just "AI is working"');
        response = result.response.text();
        workingModel = modelName;
        console.log(`✅ Success with model: ${modelName}`);
        break;
      } catch (error: any) {
        console.log(`❌ Model ${modelName} failed:`, error.message);
        continue;
      }
    }
    
    if (!workingModel) {
      throw new Error('No working models found');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Gemini API is working',
      workingModel: workingModel,
      response: response,
      apiKeyLength: apiKey.length
    });

  } catch (error: any) {
    console.error('=== Simple AI Test Error ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      errorName: error.name,
      apiKeyExists: !!process.env.GEMINI_API_KEY
    }, { status: 500 });
  }
}
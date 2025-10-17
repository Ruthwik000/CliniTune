import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'No API key configured',
        steps: ['Add GEMINI_API_KEY to .env.local']
      });
    }

    console.log('=== Gemini API Diagnosis ===');
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey.length);
    console.log('API Key format:', apiKey.startsWith('AIza') ? 'Valid format' : 'Invalid format');

    // Test 1: Check if API key is valid by listing models
    console.log('Testing API key validity...');
    const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    
    if (!modelsResponse.ok) {
      const errorText = await modelsResponse.text();
      return NextResponse.json({
        success: false,
        error: `API key invalid: ${modelsResponse.status}`,
        details: errorText,
        steps: [
          'Get a new API key from https://makersuite.google.com/app/apikey',
          'Make sure the API key has Generative Language API enabled',
          'Check if your region supports Gemini API'
        ]
      });
    }

    const modelsData = await modelsResponse.json();
    const availableModels = modelsData.models || [];
    
    console.log('Available models:', availableModels.length);
    
    if (availableModels.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No models available with this API key',
        steps: [
          'Your API key is valid but has no model access',
          'This often happens with restricted free tier keys',
          'Try creating a new API key',
          'Make sure Generative Language API is enabled'
        ]
      });
    }

    // Test 2: Try Gemini Flash 2.0 first, then fallback to available models
    let testModel = availableModels.find((m: any) => m.name.includes('gemini-2.0-flash')) || availableModels[0];
    console.log('Testing content generation with Flash 2.0:', testModel.name);
    
    const generateResponse = await fetch(`https://generativelanguage.googleapis.com/v1/${testModel.name}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Say "Hello, I am working!" in a friendly way.' }]
        }]
      })
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      return NextResponse.json({
        success: false,
        error: `Content generation failed: ${generateResponse.status}`,
        details: errorText,
        availableModels: availableModels.map((m: any) => m.name),
        steps: [
          'API key is valid but content generation failed',
          'Try using a different model',
          'Check if you have quota remaining'
        ]
      });
    }

    const generateData = await generateResponse.json();
    const responseText = generateData.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({
      success: true,
      message: 'Gemini API is working perfectly!',
      testResponse: responseText,
      availableModels: availableModels.map((m: any) => ({
        name: m.name,
        displayName: m.displayName
      })),
      recommendedModel: testModel.name,
      apiKeyValid: true
    });

  } catch (error: any) {
    console.error('Diagnosis error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      steps: [
        'Check your internet connection',
        'Verify API key is correct',
        'Try generating a new API key'
      ]
    });
  }
}
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'No API key' });
    }

    console.log('🚀 Testing Gemini Flash 2.0...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-goog-api-client': 'genai-js/0.21.0'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Say "Hello! Gemini Flash 2.0 is working perfectly!" in a friendly way.' }]
        }],
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 0.7
        }
      })
    });

    console.log('Flash 2.0 Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Flash 2.0 Error:', errorText);
      return NextResponse.json({ 
        success: false, 
        error: `${response.status}: ${errorText}`,
        model: 'gemini-2.0-flash-exp'
      });
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({
      success: true,
      model: 'gemini-2.0-flash-exp',
      response: responseText,
      message: '✅ Gemini Flash 2.0 is working!'
    });

  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    });
  }
}
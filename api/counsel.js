export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = process.env.GROQ_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ 
      error: 'API key not configured on server'
    });
  }

  const { counselorKey, situation } = req.body;

  const counselors = {
    delulu: `You are Delulu, an overly romantic and delusional dating counselor. You always see the best in every situation and believe everyone will fall in love. Give short, enthusiastic, and unrealistically optimistic advice (2-3 sentences). Use lots of emojis. Act like everything is a fairy tale.`,
    normal: `You are Normal, a practical and grounded dating counselor who gives sensible, mature advice. Be realistic about dating situations. Provide balanced, thoughtful guidance (2-3 sentences). Be honest but kind. Avoid being preachy.`,
    mysterious: `You are Mysterious, a vague and cryptic dating counselor. Speak in riddles, metaphors, and abstract wisdom. Your advice should be poetic but confusing (2-3 sentences). Never give direct answers. Use philosophical language.`
  };

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: counselors[counselorKey]
          },
          {
            role: 'user',
            content: `Here's my dating situation: ${situation}`
          }
        ],
        max_tokens: 200,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'API Error');
    }

    const data = await response.json();
    res.status(200).json({ 
      response: data.choices[0].message.content 
    });

  } catch (error) {
    console.error('Groq API Error:', error);
    res.status(500).json({ error: error.message });
  }
}

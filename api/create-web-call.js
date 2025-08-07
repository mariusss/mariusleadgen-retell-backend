// Retell AI Serverless Function for mariusleadgen.com
const fetch = require('node-fetch');

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
    return;
  }

  try {
    const apiKey = process.env.RETELL_API_KEY;
    
    if (!apiKey) {
      res.status(500).json({ 
        error: 'Server configuration error',
        message: 'API key not configured'
      });
      return;
    }

    const agentId = 'agent_cba0fc552244cab6de8f98a2ae';
    const { metadata, retell_llm_dynamic_variables } = req.body || {};

    const payload = { agent_id: agentId };
    if (metadata) payload.metadata = metadata;
    if (retell_llm_dynamic_variables) payload.retell_llm_dynamic_variables = retell_llm_dynamic_variables;

    const response = await fetch('https://api.retellai.com/v2/create-web-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload )
    });

    if (!response.ok) {
      const errorData = await response.text();
      res.status(response.status).json({ 
        error: 'Retell AI API error',
        details: errorData 
      });
      return;
    }

    const data = await response.json();
    
    res.status(200).json({
      success: true,
      access_token: data.access_token,
      call_id: data.call_id,
      call_status: data.call_status,
      agent_id: data.agent_id
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

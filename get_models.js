const https = require('https');
https.get('https://openrouter.ai/api/v1/models', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const models = JSON.parse(data).data;
    const claudeModels = models.filter(m => m.id.includes('claude'));
    console.log(claudeModels.map(m => m.id).join('\n'));
  });
});

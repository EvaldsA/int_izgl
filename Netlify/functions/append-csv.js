const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Datus sagaida JSON formā
  const { newRow } = JSON.parse(event.body);

  // Šos datus glabā Netlify ENV mainīgajos, nevis kodā!
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = 'EvaldsA';
  const REPO_NAME = 'int_izgl';
  const BRANCH = 'main';
  const FILE_PATH = 'atbildes.csv';

  // 1. Nolasām esošo failu
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`;
  const headers = { Authorization: `token ${GITHUB_TOKEN}` };
  const res = await fetch(url, { headers });
  const data = await res.json();
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  const sha = data.sha;

  // 2. Pievienojam jaunu rindu
  const updatedContent = content + '\n' + newRow;

  // 3. Augšupielādējam atpakaļ
  const putRes = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Pievienota jauna atbilde',
      content: Buffer.from(updatedContent, 'utf-8').toString('base64'),
      sha: sha,
      branch: BRANCH
    })
  });

  if (putRes.ok) {
    return { statusCode: 200, body: 'OK' };
  } else {
    return { statusCode: 500, body: 'Kļūda saglabājot atbildi!' };
  }
};

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { newRow } = JSON.parse(event.body);

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = 'EvaldsA';
  const REPO_NAME = 'int_izgl';
  const BRANCH = 'main';
  const FILE_PATH = 'atbildes.csv';

  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`;
  const headers = { Authorization: `token ${GITHUB_TOKEN}` };
  const res = await fetch(url, { headers });
  const data = await res.json();

  // LOGO API atbildi kļūdu diagnosticēšanai
  console.log('GitHub API response:', JSON.stringify(data));

  // Ja nav content, atgriež kļūdu ar pilnu API atbildi
  if (!data.content) {
    return {
      statusCode: 500,
      body: 'GitHub API error: ' + JSON.stringify(data)
    };
  }

  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  const sha = data.sha;
  const updatedContent = content + '\n' + newRow;

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
    const errorText = await putRes.text();
    return { statusCode: 500, body: 'GitHub PUT error: ' + errorText };
  }
};

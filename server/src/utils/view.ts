const fs = require('fs');
const path = require('path');

const resolveServerRoot = (): string => {
  const candidates = [
    path.resolve(__dirname, '../..'),
    process.cwd(),
    path.join(process.cwd(), 'server'),
  ];

  const match = candidates.find((dir) =>
    fs.existsSync(path.join(dir, 'templates', 'pages'))
  );

  if (!match) {
    throw new Error('Page templates directory not found');
  }

  return match;
};

const serverRoot = resolveServerRoot();
const pagesDir = path.join(serverRoot, 'templates', 'pages');

const renderPage = (filename: string, variables: Record<string, string>): string => {
  let html = fs.readFileSync(path.join(pagesDir, filename), 'utf-8');

  Object.entries(variables).forEach(([key, value]) => {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });

  return html;
};

module.exports = {
  renderPage,
};

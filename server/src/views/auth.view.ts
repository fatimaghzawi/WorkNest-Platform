const { renderPage } = require('../utils/view');

const renderEmailVerificationResultPage = ({
  title,
  message,
  success,
}: {
  title: string;
  message: string;
  success: boolean;
}) =>
  renderPage('email-verification-result.html', {
    title,
    message,
    icon: success ? '✅' : '❌',
    titleClass: success ? 'success' : 'error',
  });

module.exports = {
  renderEmailVerificationResultPage,
};

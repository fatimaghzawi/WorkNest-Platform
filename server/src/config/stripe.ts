const Stripe = require('stripe');
const env = require('./env');

const isConfigured = Boolean(env.stripe.secretKey);

const stripe = isConfigured ? new Stripe(env.stripe.secretKey) : null;

module.exports = {
  stripe,
  isConfigured,
};

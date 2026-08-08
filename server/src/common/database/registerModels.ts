/** Ensure all Mongoose models are registered before any populate/query runs. */
const load = (path: string) => {
  const mod = require(path);
  return mod.default || mod;
};

load('../../modules/users/user.model');
load('../../modules/categories/category.model');
load('../../modules/jobs/job.model');
load('../../modules/proposals/proposal.model');
load('../../modules/projects/project.model');
load('../../modules/interviews/interview.model');
load('../../modules/workspace/task.model');
load('../../modules/workspace/workspaceAttachment.model');
load('../../modules/logs/log.model');
load('../../modules/payments/payment.model');
load('../../modules/notifications/notification.model');
load('../../modules/auth/refreshToken.model');

module.exports = {};

const projectRoutes = require('./project.routes');
const projectController = require('./project.controller');
const projectService = require('./project.service');
const projectRepository = require('./project.repository');
const Project = require('./project.model').default;
const { PROJECT_STATUSES } = require('./project.model');

module.exports = {
  projectRoutes,
  projectController,
  projectService,
  projectRepository,
  Project,
  PROJECT_STATUSES,
};

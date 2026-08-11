/**
 * Pure skill-match helpers. Suggestions only — never starts projects or accepts proposals.
 */

const normalizeSkill = (skill: string) =>
  String(skill || '')
    .trim()
    .toLowerCase()
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ');

/** Light alias map so React ≈ React.js, etc. */
const SKILL_ALIASES: Record<string, string> = {
  reactjs: 'react',
  'react js': 'react',
  'react.js': 'react',
  nodejs: 'node',
  'node js': 'node',
  'node.js': 'node',
  typescript: 'typescript',
  ts: 'typescript',
  javascript: 'javascript',
  js: 'javascript',
  mongodb: 'mongo',
  mongo: 'mongo',
  postgresql: 'postgres',
  'postgres sql': 'postgres',
  'c#': 'csharp',
  'c++': 'cpp',
};

const canonicalSkill = (skill: string) => {
  const n = normalizeSkill(skill);
  return SKILL_ALIASES[n] || n;
};

const toSkillSet = (skills: unknown): Set<string> => {
  if (!Array.isArray(skills)) return new Set();
  return new Set(
    skills
      .map((s) => canonicalSkill(String(s)))
      .filter((s) => s.length > 0)
  );
};

export type MatchBreakdown = {
  skillScore: number;
  categoryScore: number;
  overlapCount: number;
  jobSkillCount: number;
  matchedSkills: string[];
  missingSkills: string[];
};

/**
 * Score a freelancer against a job (0–100).
 * Weights: skills 80, category 20. No side effects.
 */
const scoreFreelancerForJob = (
  job: { skills?: string[]; category?: string },
  freelancer: { skills?: string[]; bio?: string }
): { score: number; breakdown: MatchBreakdown } => {
  const jobSkills = toSkillSet(job.skills);
  const userSkills = toSkillSet(freelancer.skills);
  const jobSkillCount = jobSkills.size;

  const matched: string[] = [];
  const missing: string[] = [];
  jobSkills.forEach((s) => {
    if (userSkills.has(s)) matched.push(s);
    else missing.push(s);
  });

  const overlapRatio = jobSkillCount > 0 ? matched.length / jobSkillCount : 0;
  const skillScore = Math.round(overlapRatio * 80);

  const jobCat = normalizeSkill(job.category || '');
  let categoryScore = 0;
  if (jobCat) {
    const bio = normalizeSkill(freelancer.bio || '');
    const inSkills = [...userSkills].some((s) => s.includes(jobCat) || jobCat.includes(s));
    const inBio = bio.includes(jobCat);
    if (inSkills || inBio) categoryScore = 20;
    else if (overlapRatio >= 0.5) categoryScore = 10;
  }

  const score = Math.min(100, skillScore + categoryScore);

  return {
    score,
    breakdown: {
      skillScore,
      categoryScore,
      overlapCount: matched.length,
      jobSkillCount,
      matchedSkills: matched.slice(0, 8),
      missingSkills: missing.slice(0, 8),
    },
  };
};

module.exports = {
  normalizeSkill,
  canonicalSkill,
  toSkillSet,
  scoreFreelancerForJob,
};

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findProjects } from '../src/lib/project-finder';
import { DEMO } from '../src/lib/demo';
test('finder preserves canonical plot indices through combined search and visit filters', () => {
  const projects = DEMO.projects;
  const result = findProjects(projects, '  MOSS  ', 'TypeScript', true, []);
  assert.equal(result.length, 1);
  assert.equal(result[0].project.name, 'moss-ui');
  assert.equal(result[0].index, 0);
  assert.equal(findProjects(projects, 'moss', 'TypeScript', true, [0]).length, 0);
  assert.equal(findProjects(projects, 'moss', 'Python', false, []).length, 0);
  assert.equal(findProjects(projects, 'zznotfound', '', false, []).length, 0);
  assert.equal(findProjects([], '', '', false, []).length, 0);
  assert.equal(findProjects(projects, '', '', false, [0, 1]).length, projects.length);
});

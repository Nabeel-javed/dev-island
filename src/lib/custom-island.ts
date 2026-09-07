import type { Island } from './island';
import { GitHubError } from './github';
import { getProject } from './project-data';
import { customizeIsland } from './customization';
export async function getCustomIsland(island: Island, params: URLSearchParams) {
  try {
    return await customizeIsland(island, params, getProject);
  } catch (error) {
    if (error instanceof GitHubError) throw error;
    throw new GitHubError(
      error instanceof Error ? error.message : 'This custom island could not load.',
      400,
    );
  }
}

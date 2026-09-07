import type { RepositoryOverview } from './repository-overview';
import type { ProjectStory } from './story';
export type Availability = 'available' | 'missing' | 'unavailable';
export type ProjectDetails = {
  owner: string;
  name: string;
  description: string;
  url: string;
  homepage?: string;
  stars: number;
  license: string | null;
  updatedAt: string;
  fetchedAt: string;
  topics: string[];
  languages: { name: string; bytes: number }[];
  languageStatus: Availability;
  readme: {
    status: Availability;
    html: string;
    introduction: string;
    story?: ProjectStory;
    features: string;
    images: { src: string; alt: string }[];
    url: string;
    truncated: boolean;
  };
  source: 'github' | 'demo';
  overview?: RepositoryOverview;
  notice?: string;
};
export function validRepository(repo: string) {
  return /^(?!\.{1,2}$)[a-zA-Z0-9._-]{1,100}$/.test(repo);
}
export const projectKey = (owner: string, name: string) => `${owner}/${name}`.toLowerCase();

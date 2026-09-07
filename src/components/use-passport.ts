'use client';
import { useCallback, useEffect, useState } from 'react';
import type { Island } from '@/lib/island';
import { projectKey } from '@/lib/project';
import { restoreStamps, stampProject } from '@/lib/passport';
export function usePassport(island: Island) {
  const [stamps, setStamps] = useState<string[]>([]),
    [hydratedKey, setHydratedKey] = useState(''),
    [persistent, setPersistent] = useState(true);
  const storageKey = 'dev-island:passport:v1:' + island.login.toLowerCase();
  useEffect(() => {
    try {
      setStamps(restoreStamps(localStorage.getItem(storageKey), island.projects, true));
      setPersistent(true);
    } catch {
      setStamps([]);
      setPersistent(false);
    }
    setHydratedKey(storageKey);
  }, [storageKey, island.projects]);
  useEffect(() => {
    if (hydratedKey !== storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ version: 1, stamps }));
    } catch {
      setPersistent(false);
    }
  }, [storageKey, hydratedKey, stamps]);
  const collect = useCallback(
    (index: number) => {
      const project = island.projects[index];
      if (project) setStamps((previous) => stampProject(previous, project));
    },
    [island.projects],
  );
  const visited = island.projects.flatMap((p, index) =>
    stamps.includes(projectKey(p.owner, p.name)) ? [index] : [],
  );
  return { visited, collect, persistent };
}

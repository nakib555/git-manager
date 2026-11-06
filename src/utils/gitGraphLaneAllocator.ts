export function assignCommitLanes(sorted: any[]): {
  commitLaneMap: Map<string, number>;
  lanesCount: number;
} {
  const activeLanes: (string | null)[] = [];
  const commitLaneMap = new Map<string, number>();

  sorted.forEach((commit, index) => {
    const hash = commit.hash;
    const parents: string[] = Array.isArray(commit.parents)
      ? commit.parents.map((p: any) => (typeof p === 'string' ? p.substring(0, 7) : p?.sha?.substring(0, 7) || ''))
      : [];

    if (parents.length === 0 && index < sorted.length - 1) {
      parents.push(sorted[index + 1].hash);
    }

    let assignedLane = -1;
    for (let l = 0; l < activeLanes.length; l++) {
      if (activeLanes[l] === hash) {
        assignedLane = l;
        activeLanes[l] = null;
        break;
      }
    }

    if (assignedLane === -1) {
      const freeLane = activeLanes.indexOf(null);
      if (freeLane !== -1) {
        assignedLane = freeLane;
      } else {
        assignedLane = activeLanes.length;
        activeLanes.push(null);
      }
    }

    commitLaneMap.set(hash, assignedLane);

    if (parents.length > 0) {
      activeLanes[assignedLane] = parents[0];
      for (let pIdx = 1; pIdx < parents.length; pIdx++) {
        const secondaryParent = parents[pIdx];
        const nextFree = activeLanes.indexOf(null);
        if (nextFree !== -1) activeLanes[nextFree] = secondaryParent;
        else activeLanes.push(secondaryParent);
      }
    } else {
      activeLanes[assignedLane] = null;
    }
  });

  const lanesCount = Math.max(1, activeLanes.length, ...Array.from(commitLaneMap.values()).map(l => l + 1));
  return { commitLaneMap, lanesCount };
}

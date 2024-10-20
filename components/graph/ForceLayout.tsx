'use client';

import { useWorkerLayoutForce } from '@/lib/graphology-force-v2';
import { useStore } from '@/lib/store';
// import { useWorkerLayoutForce } from '@react-sigma/layout-force';
// import { useWorkerLayoutForceAtlas2 } from '@react-sigma/layout-forceatlas2';
import { useEffect } from 'react';

export function ForceLayout() {
  const settings = useStore(state => state.forceSettings);

  // const hook = useWorkerLayoutForce({
  //   settings: {
  //     attraction: 0.0001,
  //     gravity: 0.00001,
  //     inertia: 0.95,
  //     repulsion: 0.001,
  //   },
  // });

  // const hook = useWorkerLayoutForceAtlas2({
  //   getEdgeWeight: 'score',
  //   settings: {
  //     barnesHutOptimize: true,
  //     // linLogMode: true,
  //     adjustSizes: true,
  //     slowDown: 0.01,
  //     // outboundAttractionDistribution: true,
  //     // edgeWeightInfluence: 1,
  //     barnesHutTheta: 0.8,
  //     scalingRatio: 2,
  //   }
  // });

  const hook = useWorkerLayoutForce({
    attraction: 0.0001,
    gravity: 0.00001,
    inertia: 0.95,
    repulsion: 0.001,
  });

  useEffect(() => {
    useStore.setState({ forceWorker: hook });
  }, [hook]);

  useEffect(() => {
    if (!hook.updateSettings) return;
    hook.updateSettings({
      ...settings,
    });
  }, [settings, hook.updateSettings]);

  return null;
}

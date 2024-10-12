import { create } from 'zustand';
import type { GraphStore } from './interface';

export const useStore = create<GraphStore>(set => ({
  projectTitle: 'Untitled',
  nodeSearchQuery: '',
  setNodeSearchQuery: val => set({ nodeSearchQuery: val }),
  forceWorker: {
    start() {
      throw new Error('GraphologyWorkerLayout not initialized');
    },
    stop() {
      throw new Error('GraphologyWorkerLayout not initialized');
    },
    kill() {
      throw new Error('GraphologyWorkerLayout not initialized');
    },
  },
  defaultNodeColor: 'blue',
  // Select defaultValue best for viewing the graph
  forceSettings: {
    repulsion: -5,
    attraction: 1,
    gravity: 10,
  },
  defaultNodeSize: 5,
  defaultLabelRenderedSizeThreshold: 3,
  defaultEdgeColor: 'red',
  selectedNodes: [],
  selectedRadioNodeColor: 'None',
  selectedRadioNodeSize: 'None',
  showEdgeLabel: true,
  totalNodes: 0,
  totalEdges: 0,
  radialAnalysis: {
    edgeWeightCutOff: 0.4,
    nodeDegreeCutOff: 0,
    hubGeneEdgeCount: 0,
  },
  exportFormat: null,
  geneIDs: [],
}));

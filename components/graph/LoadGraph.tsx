'use client';

import { GENE_GRAPH_QUERY } from '@/lib/gql';
import type { EdgeAttributes, GeneGraphData, GeneGraphVariables, NodeAttributes } from '@/lib/interface';
import { useStore } from '@/lib/store';
import { useQuery } from '@apollo/client';
/******** only for testing with sample graph **************/
// import data from '@/lib/data/sample-graph.json';
import { useLoadGraph } from '@react-sigma/core';
import Graph from 'graphology';
import { circular } from 'graphology-layout';
import type { SerializedGraph } from 'graphology-types';
import React from 'react';
import { Spinner } from '../ui/spinner';

export function LoadGraph() {
  const loadGraph = useLoadGraph();
  const variable = JSON.parse(localStorage.getItem('graphConfig') || '{}');
  const { data, loading, error } = useQuery<GeneGraphData, GeneGraphVariables>(GENE_GRAPH_QUERY, {
    variables: {
      geneIDs: variable.geneIDs as string[],
      interactionType: variable.interactionType as string,
      minScore: Number.parseFloat(variable.minScore),
      order: Number.parseInt(variable.order),
    },
  });

  React.useEffect(() => {
    const graph = new Graph<NodeAttributes, EdgeAttributes>({
      multi: true,
      type: 'directed',
    });
    if (error) {
      console.error(error);
      alert('Error loading graph');
      return;
    }
    if (!loading && data) {
      const { genes, links } = data.getGeneInteractions;
      const transformedData: Partial<SerializedGraph<NodeAttributes, EdgeAttributes>> = {
        nodes: genes.map(gene => ({
          key: gene.ID,
          attributes: {
            label: gene.Gene_name,
            ID: gene.ID,
            description: gene.Description,
          },
        })),
        edges: links.map(link => ({
          key: `${link.gene1.index}-${link.gene2.index}`,
          source: genes[link.gene1.index].ID,
          target: genes[link.gene2.index].ID,
          attributes: {
            score: link.score,
            label: link.score.toString(),
          },
        })),
      };
      useStore.setState({
        totalNodes: transformedData.nodes?.length || 0,
        totalEdges: transformedData.edges?.length || 0,
      });
      graph.import(transformedData);
      circular.assign(graph);
      loadGraph(graph);
    }
  }, [loadGraph, data, loading, error]);

  return (
    <>
      {loading ? (
        <div className='w-full h-full grid place-items-center'>
          <div className='flex flex-col items-center'>
            <Spinner size={'medium'} />
            Loading...
          </div>
        </div>
      ) : null}
    </>
  );
}

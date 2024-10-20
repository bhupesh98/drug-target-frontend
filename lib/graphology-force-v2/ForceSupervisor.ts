import type AbstractGraph from 'graphology-types';
import type { EdgeAttributes, NodeAttributes } from '../interface';
import type { WorkerLayoutForceSettings } from './hook';
import { forceIterate } from './iterate';

export type State = {
  index?: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
};
export type NodeStates = Record<string, State>;

export const DEFAULT_FORCE_SETTINGS: Required<WorkerLayoutForceSettings> = {
  // simulation
  alpha: 1,
  alphaMin: 0.0001,
  alphaDecay: 0.02276277,
  alphaTarget: 0,
  velocityDecay: 0.1,

  // Centering force
  centeringForce: 1,

  // Collide force
  collideRadius: 10,
  collideForce: 1,

  // Link force
  linkDistance: 10,
  // Many body force
  chargeStrength: -200,
  distanceMin2: 1,
  distanceMax2: Number.POSITIVE_INFINITY,
  theta2: 0.81,

  // Radial force
  radialRadius: 100,
  radialStrength: 0.1,

  // sigmaJS copy
  inertia: 0.95,
  gravity: 0.00001,
  attraction: 0.0001,
  repulsion: 0.001,
};

export class ForceSupervisor {
  isRunning = false;
  #nodeStates: NodeStates = {};
  #frameID: number | null = null;
  #killed = false;
  #graph: AbstractGraph<NodeAttributes, EdgeAttributes>;
  #settings: Required<WorkerLayoutForceSettings>;

  constructor(graph: AbstractGraph<NodeAttributes, EdgeAttributes>, settings: WorkerLayoutForceSettings) {
    this.#graph = graph;
    this.#settings = {
      // main simulation
      alpha: settings.alpha ?? DEFAULT_FORCE_SETTINGS.alpha,
      alphaMin: settings.alphaMin ?? DEFAULT_FORCE_SETTINGS.alphaMin,
      alphaDecay: settings.alphaDecay ?? 1 - (settings.alphaMin ?? DEFAULT_FORCE_SETTINGS.alphaMin) ** (1 / 300),
      alphaTarget: settings.alphaTarget ?? DEFAULT_FORCE_SETTINGS.alphaTarget,
      velocityDecay: 1 - (settings.velocityDecay ?? DEFAULT_FORCE_SETTINGS.velocityDecay),

      // Centering force
      centeringForce: settings.centeringForce ?? DEFAULT_FORCE_SETTINGS.centeringForce,

      // Collide force
      collideRadius: settings.collideRadius ?? DEFAULT_FORCE_SETTINGS.collideRadius,
      collideForce: settings.collideForce ?? DEFAULT_FORCE_SETTINGS.collideForce,

      // Link force
      linkDistance: settings.linkDistance ?? DEFAULT_FORCE_SETTINGS.linkDistance,

      // Many body force
      chargeStrength: settings.chargeStrength ?? DEFAULT_FORCE_SETTINGS.chargeStrength,
      distanceMin2: settings.distanceMin2
        ? settings.distanceMin2 * settings.distanceMin2
        : DEFAULT_FORCE_SETTINGS.distanceMin2,
      distanceMax2: settings.distanceMax2
        ? settings.distanceMax2 * settings.distanceMax2
        : DEFAULT_FORCE_SETTINGS.distanceMax2,
      theta2: settings.theta2 ? settings.theta2 * settings.theta2 : DEFAULT_FORCE_SETTINGS.theta2,

      // Radial force
      radialRadius: settings.radialRadius ?? DEFAULT_FORCE_SETTINGS.radialRadius,
      radialStrength: settings.radialStrength ?? DEFAULT_FORCE_SETTINGS.radialStrength,

      inertia: settings.inertia ?? DEFAULT_FORCE_SETTINGS.inertia,
      gravity: settings.gravity ?? DEFAULT_FORCE_SETTINGS.gravity,
      attraction: settings.attraction ?? DEFAULT_FORCE_SETTINGS.attraction,
      repulsion: settings.repulsion ?? DEFAULT_FORCE_SETTINGS.repulsion,
    };
  }

  #runFrame = () => {
    if (!this.isRunning) return;

    forceIterate(this.#graph, this.#settings, this.#nodeStates);

    this.#graph.updateEachNodeAttributes((node, attr) => {
      const state = this.#nodeStates[node];
      attr.x = state.x += state.vx;
      attr.y = state.y += state.vy;
      return attr;
    });

    // if (
    //   (this.#settings.alpha ?? DEFAULT_FORCE_SETTINGS.alpha) <
    //   (this.#settings.alphaMin ?? DEFAULT_FORCE_SETTINGS.alphaMin)
    // ) {
    //   this.stop();
    //   return;
    // }

    this.#frameID = requestAnimationFrame(() => this.#runFrame());
  };

  start() {
    if (this.#killed) throw new Error('Force Layout has been killed');
    this.#settings.alpha = 1;
    if (this.isRunning) return;
    this.isRunning = true;
    this.#runFrame();
  }
  stop() {
    this.isRunning = false;
    if (this.#frameID !== null) {
      cancelAnimationFrame(this.#frameID);
      this.#frameID = null;
    }
  }

  kill() {
    this.stop();
    this.#nodeStates = {};
    this.#killed = true;
  }

  updateSettings(settings: WorkerLayoutForceSettings) {
    this.#settings = {
      ...this.#settings,
      ...settings,
    };
    if (this.#killed) throw new Error('Force Layout has been killed');
    this.start();
  }
}

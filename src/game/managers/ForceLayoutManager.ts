import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
  type Simulation,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import type Organism from "../entities/organism";
import type { Connection } from "../types/Connection";
import { organismDataMap } from "../data/organisms";
import {
  DEFAULT_FORCE_CONFIG,
  type ForceLayoutConfig,
} from "../config/forceConfig";

interface ForceNode extends SimulationNodeDatum {
  id: string;
  organism: Organism;
  x: number;
  y: number;
}

interface ForceLink extends SimulationLinkDatum<ForceNode> {
  source: string | ForceNode;
  target: string | ForceNode;
}

export default class ForceLayoutManager {
  private config: ForceLayoutConfig;
  private simulation: Simulation<ForceNode, ForceLink>;
  private linkForce = forceLink<ForceNode, ForceLink>([]).id((d) => d.id);
  private nodes: ForceNode[] = [];
  private links: ForceLink[] = [];

  constructor(
    worldWidth: number,
    worldHeight: number,
    initialConfig: Partial<ForceLayoutConfig> = {},
  ) {
    this.simulation = forceSimulation<ForceNode, ForceLink>([]).stop();
    this.config = {
      ...DEFAULT_FORCE_CONFIG,
      worldWidth,
      worldHeight,
      centerX: worldWidth / 2,
      centerY: worldHeight / 2,
      ...initialConfig,
    };
  }

  public getConfig(): ForceLayoutConfig {
    return { ...this.config };
  }

  public setConfig(
    newConfig: Partial<ForceLayoutConfig>,
    organisms: Organism[],
    interactions: Connection[],
  ): void {
    this.config = { ...this.config, ...newConfig };
    this.recalculate(organisms, interactions);
  }

  public getSpawnPosition(id: string): { x: number; y: number } {
    const { centerX, centerY } = this.config;
    const data = organismDataMap.get(id);
    if (!data) return { x: centerX, y: centerY };

    return {
      x: centerX + data.offsetX,
      y: centerY + data.offsetY,
    };
  }

  public recalculate(organisms: Organism[], interactions: Connection[]): void {
    const cfg = this.config;

    this.nodes = this.syncNodes(organisms);
    this.links = this.buildLinks(interactions);

    this.simulation.nodes(this.nodes);
    this.linkForce
      .links(this.links)
      .distance(cfg.linkDistance)
      .strength(cfg.linkStrength);

    const isWide = cfg.centerX > cfg.centerY;
    this.simulation
      .force(
        "x",
        forceX<ForceNode>(cfg.centerX).strength(
          isWide ? cfg.centerStrength * 0.25 : cfg.centerStrength,
        ),
      )
      .force(
        "y",
        forceY<ForceNode>(cfg.centerY).strength(
          isWide ? cfg.centerStrength : cfg.centerStrength * 0.25,
        ),
      )
      .force("link", this.linkForce)
      .force(
        "charge",
        forceManyBody<ForceNode>()
          .strength(cfg.chargeStrength)
          .distanceMax(cfg.chargeDistanceMax),
      )
      .force(
        "center",
        forceCenter<ForceNode>(cfg.centerX, cfg.centerY).strength(
          cfg.centerStrength,
        ),
      )
      .force(
        "collide",
        forceCollide<ForceNode>(cfg.collideRadius).strength(
          cfg.collideStrength,
        ),
      )
      .alphaDecay(cfg.alphaDecay)
      .alpha(cfg.reheatAlpha);
  }

  public step(): void {
    if (this.simulation.alpha() <= this.simulation.alphaMin()) return;

    this.simulation.tick();

    const { padding, worldWidth, worldHeight } = this.config;
    for (const node of this.nodes) {
      const clampedX = Math.min(Math.max(node.x, padding), worldWidth - padding);
      const clampedY = Math.min(Math.max(node.y, padding), worldHeight - padding);

      node.x = clampedX;
      node.y = clampedY;
      node.organism.setPosition(clampedX, clampedY);
    }
  }

  private syncNodes(organisms: Organism[]): ForceNode[] {
    const existingById = new Map(this.nodes.map((n) => [n.id, n]));

    return organisms.map((organism) => {
      const id = organism.organismData.id;
      const existing = existingById.get(id);

      return existing
        ? Object.assign(existing, { organism, x: organism.x, y: organism.y })
        : { id, organism, x: organism.x, y: organism.y };
    });
  }

  private buildLinks(interactions: Connection[]): ForceLink[] {
    const links: ForceLink[] = [];

    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const idA = this.nodes[i].id;
        const idB = this.nodes[j].id;

        const hasRelation = interactions.some(
          (c) =>
            (c.from === idA && c.to === idB) ||
            (c.from === idB && c.to === idA),
        );

        if (hasRelation) {
          links.push({ source: idA, target: idB });
        }
      }
    }

    return links;
  }
}
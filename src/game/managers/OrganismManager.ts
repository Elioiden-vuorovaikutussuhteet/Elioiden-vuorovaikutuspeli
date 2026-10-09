import Phaser from "phaser";
import Organism from "../entities/organism";
import { relations } from "../data/relations"
import type { organismsRelations } from "../data/relations";
import type { Connection } from "../types/Connection";

// creates organisms and creates correct connections 
export default class OrganismManager {
    private scene: Phaser.Scene;
    private uiCamera: Phaser.Cameras.Scene2D.Camera;

    private organisms: Organism[] = [];
    private organismMap = new Map<string, Organism>();
    private rightConnections: Connection[];

    private onOrganismSelected: (organism: Organism) => void;

    constructor(
        scene: Phaser.Scene,
        uiCamera: Phaser.Cameras.Scene2D.Camera,
        organismMap = new Map<string, Organism>(),
        rightConnections: Connection[],
        onOrganismSelected: (organism: Organism) => void,
    ){
        this.scene = scene;
        this.uiCamera = uiCamera;
        this.organismMap = organismMap;
        this.rightConnections = rightConnections;
        this.onOrganismSelected = onOrganismSelected;
    }

    public createOrganism(x: number, y: number, type: string) {
        const organism = new Organism(this.scene, x, y, type);

        organism.on("organismSelected", this.onOrganismSelected, this);

        this.organisms.push(organism);
        this.organismMap.set(organism.organismData.id, organism);
        this.createRightConnections();
        this.uiCamera.ignore(organism);
        this.uiCamera.ignore(organism.nameText);

        return organism;
    }
    private createRightConnections() {
        this.rightConnections.length = 0;
        const ids = this.organisms.map((organism) => organism.organismData.id);
        for (const organism of this.organisms) {
            const sourceRelations: organismsRelations[] = relations.filter(
            (relation) => relation.source === organism.organismData.id,
            );
            //(source = { source: "tree", target: "shroom" })
            for (const relation of sourceRelations) {

            if (ids.some((x) => x === relation.target)) {
                this.rightConnections.push({
                from: relation.source,
                to: relation.target,
                });
            }
            }
        }
    }

    public getOrganismMap() {
        return this.organismMap;
    }

    public getRightConnections() {
        return this.rightConnections;
    }

    public getOrganisms()  {
        return this.organisms;
    }
}
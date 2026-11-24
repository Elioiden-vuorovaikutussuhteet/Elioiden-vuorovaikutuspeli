import Phaser from "phaser";
import BaseButtonSprite from "./basebuttonsprite";
import { pulseButtonUIConfig, type PulseButtonUIConfig } from "../config";

export default class PulseButton extends BaseButtonSprite {
    private config: PulseButtonUIConfig;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        pulseSpeed: number,
        config: PulseButtonUIConfig = pulseButtonUIConfig,
    ) {
        super(
            scene,
            x,
            y,
            config.texture,
            config.clickEvent,
            config.scale,
            config.hoverAlpha,
            config.defaultAlpha,
        );
        this.config = config;
        this.pulseSpeed = pulseSpeed;
    }

    protected override handlePointerOver(): void {
        this.setTint(this.config.hoverTint);
    }

    protected override handlePointerOut(): void {
        this.clearTint();
    }
}

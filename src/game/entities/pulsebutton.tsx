import Phaser from "phaser";
import BaseButtonSprite from "./basebuttonsprite";
import { pulseButtonUIConfig, type PulseButtonUIConfig } from "../config";

export default class PulseButton extends BaseButtonSprite {
    private config: PulseButtonUIConfig;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
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
    }

    public resetTint(): void {
        this.clearTint();
    }

    public setSelected(): void {
        this.setTint(this.config.activeTint)
    }
}

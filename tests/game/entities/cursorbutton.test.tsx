import "vitest-canvas-mock";
import { describe, expect, it, vi } from "vitest";
import type Phaser from "phaser";
import { cursorButtonUIConfig } from "../../../src/game/config";

vi.mock("../../../src/game/entities/basebuttonsprite", () => ({
  default: class {
    setTint = vi.fn();
    clearTint = vi.fn();
  },
}));

import CursorButton from "../../../src/game/entities/cursorbutton";

describe("CursorButton", () => {
  const createButton = () => {
    const button = new CursorButton({} as Phaser.Scene, 100, 40, "cursor");
    return button as CursorButton & {
      handlePointerOver: () => void;
      handlePointerOut: () => void;
    };
  };

  it("dims on hover and clears tint on pointer out when unselected", () => {
    const button = createButton();

    button.handlePointerOver();
    expect(button.setTint).toHaveBeenCalledWith(cursorButtonUIConfig.hoverTint);

    button.handlePointerOut();
    expect(button.clearTint).toHaveBeenCalledOnce();
  });

  it("stays dimmed with selectedTint while selected and clears when deselected", () => {
    const button = createButton();

    button.setSelected(true);
    expect(button.setTint).toHaveBeenCalledWith(
      cursorButtonUIConfig.selectedTint,
    );

    button.handlePointerOver();
    button.handlePointerOut();
    expect(button.setTint).toHaveBeenLastCalledWith(
      cursorButtonUIConfig.selectedTint,
    );
    expect(button.clearTint).not.toHaveBeenCalled();

    button.setSelected(false);
    expect(button.clearTint).toHaveBeenCalledOnce();
  });
});

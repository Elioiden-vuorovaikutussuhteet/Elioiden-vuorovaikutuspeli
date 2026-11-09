import "vitest-canvas-mock";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type Phaser from "phaser";
import { ScoreManager } from "../../../src/game/managers/ScoreManager";
import { scoreConfig } from "../../../src/game/config/scoreConfig";

describe("ScoreManager", () => {
  let mockScene: Phaser.Scene;
  let mockMoneyText: {
    x: number;
    width: number;
    setText: ReturnType<typeof vi.fn>;
    destroy: ReturnType<typeof vi.fn>;
  };
  let mockChangeText: {
    destroy: ReturnType<typeof vi.fn>;
  };
  let mockCoinIcon: {
    setOrigin: ReturnType<typeof vi.fn>;
    setScale: ReturnType<typeof vi.fn>;
    setX: ReturnType<typeof vi.fn>;
  };
  let mockTweensAdd: ReturnType<typeof vi.fn>;
  let mockCameraIgnore: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockMoneyText = {
      x: scoreConfig.textX,
      width: 80,
      setText: vi.fn(),
      destroy: vi.fn(),
    };

    mockChangeText = {
      destroy: vi.fn(),
    };

    mockCoinIcon = {
      setOrigin: vi.fn().mockReturnThis(),
      setScale: vi.fn().mockReturnThis(),
      setX: vi.fn().mockReturnThis(),
    };

    mockTweensAdd = vi.fn();
    mockCameraIgnore = vi.fn();

    let textCallCount = 0;
    mockScene = {
      add: {
        text: vi.fn(() => {
          textCallCount += 1;
          return textCallCount === 1 ? mockMoneyText : mockChangeText;
        }),
        image: vi.fn(() => mockCoinIcon),
      },
      cameras: {
        main: {
          ignore: mockCameraIgnore,
        },
      },
      tweens: {
        add: mockTweensAdd,
      },
    } as unknown as Phaser.Scene;
  });

  it("initializes score text and coin icon on the UI camera", () => {
    const manager = new ScoreManager(mockScene, 1000);

    expect(manager.money).toBe(1000);
    expect(mockScene.add.text).toHaveBeenCalledWith(
      scoreConfig.textX,
      scoreConfig.textY,
      "1000",
      {
        fontSize: scoreConfig.fontSize,
        color: scoreConfig.fontColor,
        fontStyle: scoreConfig.fontStyle,
      },
    );
    expect(mockScene.add.image).toHaveBeenCalledWith(
      0,
      scoreConfig.textY + 15,
      "coin",
    );
    expect(mockCoinIcon.setOrigin).toHaveBeenCalledWith(0, 0.5);
    expect(mockCoinIcon.setScale).toHaveBeenCalledWith(0.65);
    expect(mockCoinIcon.setX).toHaveBeenCalledWith(scoreConfig.textX + 80 + 8);
    expect(mockCameraIgnore).toHaveBeenCalledWith(mockMoneyText);
    expect(mockCameraIgnore).toHaveBeenCalledWith(mockCoinIcon);
  });

  it("adds money, updates text and coin position, and shows floating gain text", () => {
    const manager = new ScoreManager(mockScene, 1000);

    manager.getMoney();

    expect(manager.money).toBe(1000 + scoreConfig.gainAmount);
    expect(mockMoneyText.setText).toHaveBeenCalledWith("1010");
    expect(mockScene.add.text).toHaveBeenLastCalledWith(
      scoreConfig.textX + 10,
      scoreConfig.textY + 35,
      `+${scoreConfig.gainAmount}`,
      {
        fontSize: "24px",
        color: "#067d1d",
        fontStyle: "bold",
      },
    );
    expect(mockTweensAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        targets: mockChangeText,
        y: scoreConfig.textY + 20,
        alpha: 0,
        duration: 900,
      }),
    );

    const tweenConfig = mockTweensAdd.mock.calls[0][0];
    tweenConfig.onComplete();
    expect(mockChangeText.destroy).toHaveBeenCalledOnce();
  });

  it("deducts money, shows floating loss text, and triggers outOfMoney at 0", () => {
    const manager = new ScoreManager(mockScene, 50);
    const outOfMoneySpy = vi.fn();
    manager.outOfMoney = outOfMoneySpy;

    manager.loseMoney();
    expect(manager.money).toBe(30);
    expect(outOfMoneySpy).not.toHaveBeenCalled();
    expect(mockScene.add.text).toHaveBeenLastCalledWith(
      scoreConfig.textX + 10,
      scoreConfig.textY + 35,
      `-${scoreConfig.defaultLoseAmount}`,
      {
        fontSize: "24px",
        color: "#d91616",
        fontStyle: "bold",
      },
    );

    manager.loseMoney(100);
    expect(manager.money).toBe(0);
    expect(outOfMoneySpy).toHaveBeenCalledOnce();
    expect(mockMoneyText.setText).toHaveBeenLastCalledWith("0");
  });
});

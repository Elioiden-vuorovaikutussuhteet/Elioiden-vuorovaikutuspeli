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
      scoreConfig.textX,
      scoreConfig.textY + scoreConfig.coin.yOffset,
      scoreConfig.coin.texture,
    );

    expect(mockCoinIcon.setOrigin).toHaveBeenCalledWith(
      scoreConfig.coin.originX,
      scoreConfig.coin.originY,
    );

    expect(mockCoinIcon.setScale).toHaveBeenCalledWith(scoreConfig.coin.scale);

    expect(mockCoinIcon.setX).toHaveBeenCalledWith(
      scoreConfig.textX + 80 + scoreConfig.coin.gap,
    );

    expect(mockCameraIgnore).toHaveBeenCalledWith(mockMoneyText);
    expect(mockCameraIgnore).toHaveBeenCalledWith(mockCoinIcon);
  });

  it("adds money, updates text and coin position, and shows floating gain text", () => {
    const manager = new ScoreManager(mockScene, 1000);

    manager.getMoney();

    expect(manager.money).toBe(1000 + scoreConfig.gainAmount);

    expect(mockMoneyText.setText).toHaveBeenCalledWith(
      manager.money.toString(),
    );

    expect(mockCoinIcon.setX).toHaveBeenLastCalledWith(
      scoreConfig.textX + 80 + scoreConfig.coin.gap,
    );

    expect(mockScene.add.text).toHaveBeenLastCalledWith(
      scoreConfig.textX + scoreConfig.change.xOffset,
      scoreConfig.textY + scoreConfig.change.startYOffset,
      `${scoreConfig.change.positivePrefix}${scoreConfig.gainAmount}`,
      {
        fontSize: scoreConfig.change.fontSize,
        color: scoreConfig.change.gainColor,
        fontStyle: scoreConfig.change.fontStyle,
      },
    );

    expect(mockTweensAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        targets: mockChangeText,
        y: scoreConfig.textY + scoreConfig.change.gainEndYOffset,
        alpha: scoreConfig.change.endAlpha,
        duration: scoreConfig.change.duration,
        ease: scoreConfig.change.ease,
      }),
    );

    const tweenConfig = mockTweensAdd.mock.calls[0][0];
    tweenConfig.onComplete();

    expect(mockChangeText.destroy).toHaveBeenCalledOnce();
  });

  it("deducts money, shows floating loss text, and triggers outOfMoney at 0", () => {
    const startingMoney =
      scoreConfig.minMoney + 20 + scoreConfig.defaultLoseAmount;

    const manager = new ScoreManager(mockScene, startingMoney);
    const outOfMoneySpy = vi.fn();

    manager.outOfMoney = outOfMoneySpy;

    manager.loseMoney(20);

    expect(manager.money).toBe(
      scoreConfig.minMoney + scoreConfig.defaultLoseAmount,
    );
  });
});

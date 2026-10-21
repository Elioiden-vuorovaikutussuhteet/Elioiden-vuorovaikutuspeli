import Phaser from "phaser";

export class ScoreManager {
    private scene: Phaser.Scene;
    public money: number;
    private moneyText: Phaser.GameObjects.Text;


    constructor(scene: Phaser.Scene, startingMoney: number) {
        this.scene = scene;
        this.money = startingMoney;

        this.moneyText = scene.add.text(
            100,
            25,
            this.money.toString(),
            {
                fontSize: "30px",
                color: "#000000",
                fontStyle: "bold"
            }
        )
        this.scene.cameras.main.ignore(this.moneyText);
    }

    getMoney(): void {
        this.money += 10;
        this.updateText();
    }

    loseMoney(): void{
        this.money -= 20;
        this.updateText();
    }

    private updateText(): void {
        this.moneyText.setText(this.money.toString())
    }
}

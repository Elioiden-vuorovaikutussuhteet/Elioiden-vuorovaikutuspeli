export class ScoreManager {
    public money: number;

    constructor(startingMoney: number = 1000) {
        this.money = startingMoney;
    }

    getMoney(): void {
        this.money += 10;
    }

    loseMoney(): void{
        this.money -= 20;
    }

}

const score = new ScoreManager();

console.log(score.money)
score.getMoney()
console.log(score.money)
score.getMoney()
console.log(score.money)
score.loseMoney()
console.log(score.money)
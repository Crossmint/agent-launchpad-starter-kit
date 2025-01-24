export class MockAgent {
    id: string;
    name: string;
    balance: number;
    timeStarted: string;

    constructor(id: string, name: string, balance: number, timeStarted: string) {
        this.id = id;
        this.name = name;
        this.balance = balance;
        this.timeStarted = timeStarted;
    }

    getBalance() {
        return "$" + this.balance.toFixed(2) + " USDC";
    }
}

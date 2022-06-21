class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`); //定义了新的HTML类

        // this.hide();
        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width(); //领域的宽度
        this.height = this.$playground.height(); //领域的高度
        //创建地图（canvas）
        this.game_map = new GameMap(this);
        //创建玩家
        this.players = [];
        //创建自己 玩家默认白色
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));
        //创建AI AI随机颜色
        for (let i = 0; i < 5; i++) {
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.15, false));
        }
        this.start();
    }

    get_random_color() { // 产生随机颜色
        let colors = ["blue", "red", "pink", "grey", "green"];
        return colors[Math.floor(Math.random() * 5)];
    }

    start() {}

    show() { // 打开playground界面
        this.$playground.show();
    }

    hide() { // 关闭playground界面
        this.$playground.hide();
    }
}
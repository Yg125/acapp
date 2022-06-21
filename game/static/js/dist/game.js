class AcGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
        <div class="ac-game-menu">
            <div class="ac-game-menu-field">
                <div class="ac-game-menu-field-item ac-game-menu-field-item-single-mode">
                    单人模式
                </div>
                <br>
                <div class="ac-game-menu-field-item ac-game-menu-field-item-multi-mode">
                    多人模式
                </div>
                <br>
                <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">
                    设置
                </div>  
            </div>
        </div>
        `);
        this.root.$ac_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings');

        this.start();
    }
    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function() {
            outer.hide();
            outer.root.playground.show();
        });
        this.$multi_mode.click(function() {
            console.log("click multi mode");
        });
        this.$settings.click(function() {
            console.log("click settings");
        });
    }

    show() { //显示menu界面
        this.$menu.show();
    }
    hide() { //关闭menu界面
        this.$menu.hide();
    }
}let AC_GAME_OBJECTS = []; // 存储所有可移动的对象

class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this); // 在构造函数中就将这个对象加入到储存动元素的全局数组里

        this.has_called_start = false; // 记录这个对象是否执行过start函数
        this.timedelta = 0; // 当前距离上一帧的时间间隔
    }

    start() { // 只会在第一帧执行一次
    }

    update() { // 每一帧均会执行一次
    }

    on_destroy() { // 在被销毁前执行一次
    }

    destroy() { // 删掉该物体

        this.on_destroy();

        for (let i = 0; i < AC_GAME_OBJECTS.length; i++) {
            if (AC_GAME_OBJECTS[i] === this) {
                AC_GAME_OBJECTS.splice(i, 1); // js中从数组中删除元素的函数splice()
                break;
            }
        }
    }
}

let last_timestamp; // 上一帧的时间
let AC_GAME_ANIMATION = function(timestamp) { // timestamp 是传入的一个参数，就是当前调用的时间
    for (let i = 0; i < AC_GAME_OBJECTS.length; i++) // 所有动的元素都进行更新。
    {
        let obj = AC_GAME_OBJECTS[i];
        if (!obj.has_called_start) //如果还没有执行过start那么执行
        {
            obj.start();
            obj.has_called_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp; // 更新上一帧变量时间戳

    requestAnimationFrame(AC_GAME_ANIMATION); // 不断递归调用
}

requestAnimationFrame(AC_GAME_ANIMATION); // JS的API，可以调用1帧里面的函数。//GameMap是由基类AcGameObject扩展的，类似于继承
class GameMap extends AcGameObject {
    constructor(playground) {
        super(); // 调用基类的构造函数

        this.playground = playground; // 这个Map是属于传入的playground的

        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d'); // 用ctx操作画布canvas

        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height; //设置画布的高度及宽度

        this.playground.$playground.append(this.$canvas); // 将这个画布加入到这个playground
    }

    start() {}

    update() {
        this.render(); // 这个地图要一直画一直画（动画的基本原理）
    }

    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // 填充颜色设置为黑色
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height); // 画上给定的坐标的矩形
    }
}class Particle extends AcGameObject {
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.friction = 0.9;
        this.eps = 1;
    }

    start() {}

    update() {
        if (this.move_length < this.eps || this.speed < this.eps) {
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;
        this.render();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();
        this.playground = playground; //所属 playground
        this.ctx = this.playground.game_map.ctx; // 操作的画笔
        //由传入的参数设置坐标半径颜色速度身份等信息
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;

        this.vx = 0;
        this.vy = 0;
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.move_length = 0;
        this.eps = 0.1; //精度
        this.friction = 0.9;
        this.spent_time = 0;

        this.cur_skill = null; //当前选中的技能
    }

    start() {
        if (this.is_me) {
            this.add_listening_events(); // 只有这个玩家是自己的时候才能加入监听
        } else {
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }
    }

    add_listening_events() { //加入监听
        let outer = this; // 设置正确的this指针，因为接下来的后面的function内的this不是对象本身的this
        this.playground.game_map.$canvas.on("contextmenu", function() { // 关闭画布上的鼠标监听右键
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function(e) { // 鼠标监听
            if (e.which === 3) { // e.which就是canvas中的鼠标右键，详情查看canvas
                outer.move_to(e.clientX, e.clientY); // e.clientX是鼠标的x坐标，e.clientY同理
            } else if (e.which === 1) {
                if (outer.cur_skill === "fireball") { //当前技能是火球就发射
                    outer.shoot_fireball(e.clientX, e.clientY);
                }
                outer.cur_skill = null; //使用之后就需要清空
            }
        });

        $(window).keydown(function(e) {
            if (e.which === 81) { // q
                outer.cur_skill = "fireball";
                return false;
            }
        });
    }

    shoot_fireball(tx, ty) { //发射火球
        let x = this.x,
            y = this.y;
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle),
            vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.height * 0.5;
        let move_length = this.playground.height * 1;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, this.playground.height * 0.01);
    }

    get_dist(x1, y1, x2, y2) { //获取两点之间的距离
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty); // 跟目的地的距离
        let angle = Math.atan2(ty - this.y, tx - this.x); // 计算角度，这里Math.atan2(y, x)相当于求arctan(y / x);
        this.vx = Math.cos(angle); // vx是这个速度的x方向上的速度
        this.vy = Math.sin(angle); // vy是这个速度的y方向上的速度
    }

    is_attacked(angle, damage) {
        for (let i = 0; i < 20 + Math.random() * 10; i++) { //粒子数
            let x = this.x,
                y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random(); //随机方向
            let vx = Math.cos(angle),
                vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 5;
            //创建粒子对象
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }
        this.radius -= damage;
        if (this.radius < 10) {
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
        this.speed *= 0.8;
    }

    update() {
        this.spent_time += this.timedelta / 1000; //冷静期 AI不能攻击
        if (!this.is_me && this.spent_time > 4 && Math.random() < 1 / 300.0) { //过了冷静期每隔一段时间发射一次
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;
            this.shoot_fireball(tx, ty);
        }

        if (this.damage_speed > 10) {
            this.vx = this.vy = 0;
            this.move_length = 0; //不能自己动
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000; //被击退的移动
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        } else {
            if (this.move_length < this.eps) { // 移动距离小于精度
                this.move_length = 0; //停止
                this.vx = this.vy = 0;
                if (!this.is_me) { //如果是AI，那么随机移动
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            } else { // 如果是玩家自己并且移动距离有效，继续移动
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000); // 每个时间微分里该走的距离和到目的地的距离的最小值
                // 注意：this.timedelta 的单位是毫秒，所以要 / 1000 转换单位为秒
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
        this.render(); //一直画圆
    }

    render() { //画圆
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_destroy() { //销毁之前在保存玩家的数组中删去这个player
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
            }
        }
    }
}class FireBall extends AcGameObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = vx; //移动方向
        this.vy = vy;
        this.radius = radius; //半径
        this.color = color;
        this.speed = speed; //速度
        this.move_length = move_length; //射程
        this.damage = damage;
        this.eps = 0.1;
    }

    start() {}

    update() {
        if (this.move_length < this.eps) { //如果走完了射程就消失
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;

        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player)) {
                this.attack(player);
            }
        }

        this.render();
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision(player) { //两圆相交判断是否碰撞
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        if (distance < this.radius + player.radius)
            return true;
        return false;
    }

    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);
        this.destroy();
    }

    render() { //画圆
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class AcGamePlayground {
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
}export class AcGame {
    constructor(id) {
        this.id = id;
        this.$ac_game = $('#' + id);
        // this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);

        this.start();
    }

    start() {}
}
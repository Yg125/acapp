class Player extends AcGameObject {
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
        if (this.is_me) // 如果这是自己
        {
            this.img = new Image(); // 头像的图片
            this.img.src = this.playground.root.settings.photo; // 头像的图片的URL
        }

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
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 3) { // e.which就是canvas中的鼠标右键，详情查看canvas
                outer.move_to(e.clientX - rect.left, e.clientY - rect.top); // e.clientX是鼠标的x坐标，e.clientY同理
            } else if (e.which === 1) {
                if (outer.cur_skill === "fireball") { //当前技能是火球就发射
                    outer.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);
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
        if (this.is_me) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }

    on_destroy() { //销毁之前在保存玩家的数组中删去这个player
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
            }
        }
    }
}
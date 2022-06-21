//GameMap是由基类AcGameObject扩展的，类似于继承
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
}
let AC_GAME_OBJECTS = []; // 存储所有可移动的对象

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

requestAnimationFrame(AC_GAME_ANIMATION); // JS的API，可以调用1帧里面的函数。
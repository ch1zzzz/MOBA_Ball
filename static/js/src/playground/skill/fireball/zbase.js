class FireBall extends AcGameObject {

    // 传入参数：游戏界面、(所属)玩家、火球坐标x, y、火球横纵速度vx, vy、火球半径、颜色、移动速度、射程最大距离
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        // 基本属性
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.player = player;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.damage = damage;

        this.eps = 0.001;
    }

    start() {

    }

    update() {
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;

        // 遍历整个玩家数组，并判断火球与玩家球心距离
        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (player !== this.player && this.is_collision(player)) {  // player 不是自己时
                this.attack(player);
            }
        }
        this.render();
    }

    // 球心距
    get_dist(x1, y1, x2, y2) {
        let dx = x2 - x1;
        let dy = y2 - y1;

        return Math.sqrt(dx * dx + dy * dy);
    }

    // 碰撞检测(是否击中敌人)
    is_collision(player) {
        if (this.get_dist(this.x, this.y, player.x, player.y) < this.radius + player.radius) {
            return true;
        } else {
            return false;
        }
    }

    // 火球碰撞后击中敌人
    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);  // 火球碰撞角度 y / x
        player.is_attacked(angle, this.damage);
        this.destroy();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}

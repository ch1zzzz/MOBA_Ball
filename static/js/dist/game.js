class AcGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="ac-game-menu">
    <div class="ac-game-menu-field">
        <div class="ac-game-menu-field-item ac-game-menu-field-item-single-mode">
            Singleplayer
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-multi-mode">
            Multiplayer
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">
            Log Out
        </div>
    </div>
</div>
`);
        this.$menu.hide();
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
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show();
        });
        this.$multi_mode.click(function(){
            console.log("click multi mode");
        });
        this.$settings.click(function(){
            console.log("click settings");
            outer.root.settings.logout_remote();
        });
    }

    show() {  // show menu
        this.$menu.show();
    }

    hide() {  // close menu
        this.$menu.hide();
    }
}//store objs
let AC_GAME_OBJECTS = [];

//Father class for player, fire
class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);

        this.has_called_start = false;  // if start() has been called
        // time interval from last frame(we render the web each frame)
        this.timedelta = 0;  
        //if the obj can be hurt --default false
    }

    start()
    {
        // only perform once when starts
    }

    update()
    {
        // perform every frame
    }

    destroy()
    {
        this.on_destroy();
        // delete obj from list
        for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ )
        {
            if (AC_GAME_OBJECTS[i] === this)
             {
                 AC_GAME_OBJECTS.splice(i, 1);
                 break;
             }
        }
    }

    on_destroy()
    {
        // call before destroy
    }

}

//last frame time
let last_timestamp;

//start or update objs in AC_GAME_OBJECTS
let AC_GAME_ANIMATION = function (timestamp) {
    for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ ) {
        let obj = AC_GAME_OBJECTS[i];
        if (!obj.has_called_start) {
            obj.start();
            obj.has_called_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;

    requestAnimationFrame(AC_GAME_ANIMATION);
}

//call AC_GAME_ANIMATION every frame
requestAnimationFrame(AC_GAME_ANIMATION);class GameMap extends AcGameObject
{
    constructor(playground)
    {
        super(); // call AcGameObject()

        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`); // Html canvas
        this.ctx = this.$canvas[0].getContext('2d'); // ctxto manipulate canvas

        this.ctx.canvas.width = this.playground.width; // canvas width
        this.ctx.canvas.height = this.playground.height; // canvas height

        this.playground.$playground.append(this.$canvas); // add canvas to playground
    }

    render()
    {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // background color(default black)
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height); // paint rectangle
    }

    start()
    {

    }

    update()
    {
        this.render();
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
        this.eps = 3;
    }

    start() {

    }

    update() {
        if(this.move_length < this.eps || this.speed < this.eps) {
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed*this.timedelta/1000);
        this.x += this.vx*moved;
        this.y += this.vy*moved;
        this.move_length -= moved;
        this.speed *= this.friction;
        this.render();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

}class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1;
        this.friction = 0.9;
        this.spent_time = 0;

        this.cur_skill = null;
        this.fireballs = [];
        this.unbinded_funcs = []

        if (this.is_me) {
            this.img = new Image();
            this.img.src = this.playground.root.settings.photo;
        }else{
            this.img = new Image();
            this.img.src = "https://app4881.acapp.acwing.com.cn/static/image/settings/cat.png";
        }
    }

    start() {
        if (this.is_me) {
            this.add_listening_events();
        } else {
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }
    }

    add_listening_events() {
        let outer = this;
        //ban right click to show menu
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false;
        });
        const rect = outer.ctx.canvas.getBoundingClientRect();
        this.playground.game_map.$canvas.mousedown(function (e) {
            //e.which === 3，right click
            //e.which === 1，left click
            if (e.which === 3) {
                outer.move_to(e.clientX - rect.left, e.clientY - rect.top);

            }else if(e.which === 1) {
                if(outer.cur_skill === "fireball") {
                    outer.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);
                }
                outer.cur_skill = null;
            }
        });

        $(window).keydown(function(e) {
            if(e.which === 81) {
                outer.cur_skill = "fireball";
                return false;
            }
        });

    }

    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.01;
        let color = "orange";
        let damage = this.playground.height * 0.01;

        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle); // direction
        let speed = this.playground.height * 0.5; 
        let move_dist = this.playground.height * 1;
        let fireball = new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_dist, damage);
        this.fireballs.push(fireball);
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    is_attacked(angle, damage) {
        for (let i = 0; i < 20 + Math.random() * 10; i++) {
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 10;
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
        this.spent_time += this.timedelta / 1000;
        //AI
        if (!this.is_me && this.spent_time > 4 && Math.random() < 1 / 150.0) {
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;
            this.shoot_fireball(tx, ty);
        }

        // was attacked
        if (this.damage_speed > 10) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        } else {
            //regular move
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (!this.is_me) {
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            } else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
        this.render();
    }

    render() {
        if (this.is_me) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2); 
            this.ctx.restore();
        }else{
            // for colored circle
            // this.ctx.beginPath();
            // this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            // this.ctx.fillStyle = this.color;
            // this.ctx.fill();
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2); 
            this.ctx.restore();
        }
    }

    on_destroy() {
        for (let i = 0; i < this.unbinded_funcs.length; i ++) {
            this.unbinded_funcs[i]()
        }
        this.unbinded_funcs = []

        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
            }
        }
    }
}class FireBall extends AcGameObject {

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
class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);

        this.hide();
        
        this.start();
    }

    get_random_color() {
        let colors = ["blue", "red", "pink", "grey", "green", "yellow", "purple"];
        return colors[Math.floor(Math.random() * 7)];
    }


    // add_listening_events()
    // {
    //     let outer = this;
    //     this.$back.click(function(){
    //         outer.hide();
    //         outer.root.$menu.show();
    //     });
    // }

    start()
    {
        //this.hide();
        //this.add_listening_events();
    }

    show() {  // show playground
        this.$playground.show();
        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();

        this.game_map = new GameMap(this); // map
        this.players = []; // list of players
        this.fireballs = []; // list of fireballs
        //Player for me 
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));
        //Players for AI
        for (let i = 0; i < 5; ++ i){
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, false));    
        }
        //this.$back = this.$playground.find('.ac-game-playground-item-back')
    }

    hide() {  // close playground
        this.$playground.hide();
    }

    update()
    {

    }
}class Settings {
    constructor(root) {
        this.root = root;
        this.platform = 'WEB';
        if (this.root.OS) this.platform = 'ACAPP';
        this.username = '';
        this.photo = '';
        this.$settings = $(`
            <div class='ac-game-settings'>
                <div class='ac-game-settings-login'>
                    <div class='ac-game-settings-title'>
                        Log In
                    </div>
                    <div class='ac-game-settings-username'>
                        <div class='ac-game-settings-item'>
                            <input type="text" placeholder="Username">
                        </div>
                    </div>
                    <div class='ac-game-settings-password'>
                        <div class='ac-game-settings-item'>
                            <input type="password" placeholder="Password">
                        </div>
                    </div>
                    <div class='ac-game-settings-submit'>
                        <div class='ac-game-settings-item'>
                            <button>Log In</button>
                        </div>
                    </div>
                    <div class='ac-game-settings-error-messages'>
                    </div>
                    <div class='ac-game-settings-option'>
                        Register
                    </div>
                    <br>
                    <br>
                    <div class='ac-game-settings-wechat'>
                        <img width="30" src="https://app4881.acapp.acwing.com.cn/static/image/settings/wechat.png">
                        <br>
                        <br>
                        <div>
                            Log in with WeChat
                        </div>
                    </div>
                </div>
                <div class='ac-game-settings-register'>

                    <div class='ac-game-settings-title'>
                        Register
                    </div>
                    <div class='ac-game-settings-username'>
                        <div class='ac-game-settings-item'>
                            <input type="text" placeholder="Username">
                        </div>
                    </div>
                    <div class='ac-game-settings-password ac-game-settings-password-first'>
                        <div class='ac-game-settings-item'>
                            <input type="password" placeholder="Password">
                        </div>
                    </div>
                    <div class='ac-game-settings-password ac-game-settings-password-second'>
                        <div class='ac-game-settings-item'>
                            <input type="password" placeholder="Confirm Password">
                        </div>
                    </div>
                    <div class='ac-game-settings-submit'>
                        <div class='ac-game-settings-item'>
                            <button>Register</button>
                        </div>
                    </div>
                    <div class='ac-game-settings-error-messages'>
                    </div>
                    <div class='ac-game-settings-option'>
                        Log In
                    </div>
                    <br>
                    <br>
                    <div class='ac-game-settings-wechat'>
                        <img width="30" src="https://app4881.acapp.acwing.com.cn/static/image/settings/wechat.png">
                        <br>
                        <br>
                        <div>
                            Log in with WeChat
                        </div>
                    </div>

                </div>
            </div>
        `);

        this.$login = this.$settings.find(".ac-game-settings-login");
        this.$login_username = this.$login.find(".ac-game-settings-username input");
        this.$login_password = this.$login.find(".ac-game-settings-password input");
        this.$login_subtmit = this.$login.find(".ac-game-settings-submit button");
        this.$login_error_message = this.$login.find(".ac-game-settings-error-messages");
        this.$login_register = this.$login.find(".ac-game-settings-option");
        this.$login.hide();

        this.$register = this.$settings.find(".ac-game-settings-register");
        this.$register_username = this.$register.find(".ac-game-settings-username input");
        this.$register_password = this.$register.find(".ac-game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".ac-game-settings-password-second input");
        this.$register_subtmit = this.$register.find(".ac-game-settings-submit button");
        this.$register_error_message = this.$register.find(".ac-game-settings-error-messages");
        this.$register_login = this.$register.find(".ac-game-settings-option");
        this.$register.hide();

        this.$acwing_login = this.$settings.find('.ac-game-settings-wechat img');

        this.root.$ac_game.append(this.$settings);
        this.start();
    }

    start() {
        this.getinfo();
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.add_listening_events_login();
        this.add_listening_events_register();
        this.$acwing_login.click(function() {
            outer.acwing_login();
        });
    }

    add_listening_events_login() {
        let outer = this;
        this.$login_register.click(function() {
            outer.register();
        });
        this.$login_subtmit.click(function() {
            outer.login_remote();
        });
    }

    add_listening_events_register() {
        let outer = this;
        this.$register_login.click(function() {
            outer.login();
        });
        this.$register_subtmit.click(function() {
            outer.register_remote();
        });
    }

    acwing_login() {
        $.ajax({
            url: 'https://app4881.acapp.acwing.com.cn/settings/acwing/web/apply_code/',
            type: 'GET',
            success: function(resp) {
                if(resp.result === 'success') {
                    // redirect
                    window.location.replace(resp.apply_code_url);
                }
            }
        });
    }

    login_remote(){
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_message.empty();

        $.ajax({
            url: 'https://app4881.acapp.acwing.com.cn/settings/login/',
            type: 'GET',
            data: {
                username: username,
                password: password,
            },
            success: function(resp) {
                if(resp.result === 'success') {
                    location.reload();
                }else{
                    outer.$login_error_message.html(resp.result);
                }
            }
        });
    }

    logout_remote(){
        if(this.platform === 'ACAPP') return false;
        $.ajax({
            url: 'https://app4881.acapp.acwing.com.cn/settings/logout/',
            type: 'GET',
            success: function(resp) {
                if(resp.result === 'success') {
                    location.reload();
                }
            }
        });
    }

    register_remote(){
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();

        $.ajax({
            url: 'https://app4881.acapp.acwing.com.cn/settings/register/',
            type: 'GET',
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: function(resp) {
                if(resp.result === 'success') {
                    location.reload();
                }else{
                    outer.$register_error_message.html(resp.result);
                }
            }
        });
    }

    login() {
        //open login page
        this.$register.hide();
        this.$login.show();
    }

    register() {
        ////open register page
        this.$login.hide();
        this.$register.show();
    }

    getinfo() {

        let outer = this;
        $.ajax({
            url: 'https://app4881.acapp.acwing.com.cn/settings/getinfo/',
            type: 'GET',
            data: {
                platform: outer.platform,
            },
            success: function(resp) {
                if(resp.result === 'success') {
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                }else{
                    outer.login();
                }
            }
        })
    }

    hide() {
        this.$settings.hide();
    }

    show() {
        this.$settings.show();
    }
}export class AcGame {
    constructor(id, OS) {
        this.id = id;
        this.$ac_game = $('#' + id);
        this.OS = OS;

        this.settings = new Settings(this);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);
        this.start();
    }

    start() {
    }
}
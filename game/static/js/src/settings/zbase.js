class Settings {
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
        if(this.platform ==='ACAPP') {
            this.get_info_acapp();
        }else{
            if(this.root.access) {
                this.getinfo_web();
                this.refresh_jwt_token();
            }else{
                this.login();
            }
            this.add_listening_events();
        }
    }

    refresh_jwt_token() {
        setInterval(() => {
            $.ajax({
                url: "https://app4881.acapp.acwing.com.cn/settings/api/token/refresh/",
                type: "post",
                data: {
                    refresh: this.root.refresh,
                },
                success: resp => {
                    this.root.access = resp.access;
                }
            });
        }, 4.5 * 60 * 1000);

        setTimeout(() => {
            $.ajax({
                url: "https://app4881.acapp.acwing.com.cn/settings/ranklist/",
                type: "get",
                headers: {
                    'Authorization': "Bearer " + this.root.access,
                },
                success: resp => {
                    console.log(resp);
                }
            });
        }, 5000);

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

    login_remote(username, password){
        username = username || this.$login_username.val();
        password = password || this.$login_password.val();
        this.$login_error_message.empty();

        $.ajax({
            url: 'https://app4881.acapp.acwing.com.cn/settings/api/token/',
            type: 'post',
            data: {
                username: username,
                password: password,
            },
            success: resp => {
                this.root.access = resp.access;
                this.root.refresh = resp.refresh;
                this.refresh_jwt_token();
                this.getinfo_web();
            },
            error: () => {
                this.$login_error_message.html("username or password is wrong");
            }
        });
    }

    logout_remote(){
        if(this.platform === 'ACAPP') {
            this.root.OS.api.window.close();
        }else{
            this.root.access = "";
            this.root.refresh = "";
            location.href = "/";
        }
    }

    register_remote(){
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();

        $.ajax({
            url: 'https://app4881.acapp.acwing.com.cn/settings/register/',
            type: 'post',
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: function(resp) {
                if(resp.result === 'success') {
                    outer.login_remote(username, password);
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

    acapp_login(appid, redirect_uri, scope, state) {
        let outer = this;
        this.root.OS.api.oauth2.authorize(appid, redirect_uri, scope, state, function(resp) {
            if(resp.result === 'success') {
                outer.username = resp.username;
                outer.photo = resp.photo;
                outer.hide();
                outer.root.menu.show();
                outer.root.access = resp.access;
                outer.root.refresh = resp.refresh;
                outer.refresh_jwt_token();
            }
        });
    }

    get_info_acapp() {
        let outer = this;
        $.ajax({
            url: 'https://app4881.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/',
            type: 'GET',
            success: function(resp) {
                if (resp.result === 'success') {
                    outer.acapp_login(resp.appid, resp.redirect_uri, resp.scope, resp.state);
                }
            }
        })
    }

    getinfo_web() {

        let outer = this;
        $.ajax({
            url: 'https://app4881.acapp.acwing.com.cn/settings/getinfo/',
            type: 'get',
            data: {
                platform: outer.platform,
            },
            headers:{
                'Authorization': 'Bearer ' + this.root.access,
            },
            success: function(resp) {
                if(resp.result === 'success') {
                    console.log(resp);
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
}
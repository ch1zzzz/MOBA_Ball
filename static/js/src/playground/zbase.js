class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);

        this.hide();
        this.root.$ac_game.append(this.$playground);
        this.start();
    }

    get_random_color() {
        let colors = ["blue", "red", "pink", "grey", "green", "yellow", "purple"];
        return colors[Math.floor(Math.random() * 7)];
    }

    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;
        if(this.game_map){
            this.game_map.resize();
        }
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
        let outer = this;
        $(window).resize(function() {
            outer.resize();
        });
        //this.hide();
        //this.add_listening_events();
    }

    show(mode) {  // show playground
        let outer = this;
        this.$playground.show();
        
        this.width = this.$playground.width();
        this.height = this.$playground.height();

        this.game_map = new GameMap(this); // map
        this.resize();

        this.players = []; // list of players
        this.fireballs = []; // list of fireballs
        //Player for me 
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, 'me', this.root.settings.username, this.root.settings.photo));
        //Players for AI
        if(mode === 'single mode') {
            for (let i = 0; i < 5; ++ i){
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, 'robot'));    
            }
        }else if(mode === 'multi mode') {
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;
            this.mps.ws.onopen = function() {
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            };
        }
        
        //this.$back = this.$playground.find('.ac-game-playground-item-back')
    }

    hide() {  // close playground
        this.$playground.hide();
    }

    update()
    {

    }
}
class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div>game start!</div>`);

        this.hide();
        this.root.$ac_game.append(this.$playground);

        this.start();
    }

    start() {
    }

    show() {  // show playground
        this.$playground.show();
    }

    hide() {  // close playground
        this.$playground.hide();
    }
}
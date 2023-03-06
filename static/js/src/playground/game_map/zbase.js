class GameMap extends AcGameObject
{
    constructor(playground)
    {
        super(); // call AcGameObject()

        this.playground = playground;
        this.$canvas = $(`<canvas tabindex=0></canvas>`); // Html canvas
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
        this.$canvas.focus();
    }

    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)"; // background color(default black)
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height); // paint rectangle
    }

    update()
    {
        this.render();
    }

}
//store objs
let AC_GAME_OBJECTS = [];

//Father class for player, fire
class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);

        this.has_called_start = false;  // if start() has been called
        // time interval from last frame(we render the web each frame)
        this.timedelta = 0;  
        //if the obj can be hurt --default false

        this.uuid = this.create_uuid();

    }

    create_uuid() {
        let res = '';
        for(let i = 0; i < 15; i++) {
            let x = parseInt(Math.floor(Math.random() * 10));
            res += x;
        }
        return res;
    }

    start()
    {
        // only perform once when starts
    }

    update()
    {
        // perform every frame
    }

    late_update() {
        //update on the last frame
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
    for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ ){
        let obj = AC_GAME_OBJECTS[i];
        obj.late_update();
    }

    last_timestamp = timestamp;

    requestAnimationFrame(AC_GAME_ANIMATION);
}

//call AC_GAME_ANIMATION every frame
requestAnimationFrame(AC_GAME_ANIMATION);
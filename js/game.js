var $window = $(window),
    canvasWidth = $window.width() - 4,
    canvasHeight = $window.height() - 4,
    FPS = 4 * 12;

var now, prevTime, delta;
   

var colors = {
        "red": "#ff0000",
        "yellow": "#ffff00",
        "green": "#21421E",
        "blue": "#0000ff"
    },
    colors_names = Object.keys(colors);

var Vector2d = (function () {
    function Vector2d(x, y) {
        this.x = x;
        this.y = y;
    }

    Vector2d.prototype.copy = function () {
        return new Vector2d(this.x, this.y);
    };
    Vector2d.prototype.len = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    Vector2d.prototype.is_null = function () {
        return this.x == 0 && this.y == 0;
    };
    Vector2d.prototype.add_vector = function (v) {
        return new Vector2d(this.x + v.x, this.y + v.y);
    };
    Vector2d.prototype.add_vector2 = function (v) {
        this.x += v.x;
        this.y += v.y;
    };
    Vector2d.prototype.mul_scalar = function (v) {
        return this.x * v.x + this.y * v.y;
    };
    Vector2d.prototype.mul = function (n) {
        return new Vector2d(this.x * n, this.y * n);
    };
    Vector2d.prototype.mul2 = function (n) {
        this.x *= n;
        this.y *= n;
    };
    Vector2d.prototype.d = function (v) {
        return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
    };
    Vector2d.prototype.dima = function (v) {
        return v.add_vector(this.mul(-1));
    };
    Vector2d.prototype.normalize = function () {
        if (!this.is_null()) {
            var len = this.len();
            this.x /= len;
            this.y /= len;
        }
    };
    return Vector2d;
})();

function toVector2d(e, c) {
    return new Vector2d(e.pageX - c.left, e.pageY - c.top);
}

//=====================================

//=====================================

var Blob = (function () {
    function Blob(position, radius, velocity, color) {
        this._position = position;
        this._radius = radius;
        this._velocity = velocity;
        this._color = color;
    }

    Blob.prototype.getPosition = function(){
        return this._position;
    };

    Blob.prototype.getRadius = function(){
        return this._radius;
    }

    Blob.prototype.move = function (dt) {
        this._position.add_vector2(this._velocity.mul(dt/1000));

    };

    Blob.prototype.setVelocity = function(v){
        this._velocity = v;
    }

    Blob.prototype.draw = function (ctx) {
        ctx.fillStyle = this._color;

        ctx.beginPath();
        ctx.arc(this._position.x, this._position.y, this._radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
    };

    return Blob;
})();

var utils = {
    genSign : function(){
        if(Math.random()>0.5) return 1; else return -1;
    },
    genVelo : function(){
        var x = utils.genSign()*(1 + Math.random()*10);
        var y = utils.genSign()*(1 + Math.random()*10);
        return new Vector2d(x,y);
    },

    genPos : function(){
        var x = 100 + Math.random()*400;
        var y = 100 + Math.random()*400;
        return new Vector2d(x,y);
    },

    sign : function (n) {
        return n ? (n < 0 ? -1 : 1) : 0;
    },

    distance : function (p, p0, p1) {
        var v = p1.add_vector(p0.mul(-1));
        var w = p.add_vector(p0.mul(-1));
        var c1 = w.mul_scalar(v);
        if (c1 <= 0) return p.d(p0);
        var c2 = v.mul_scalar(v);
        if (c2 <= c1) return p.d(p1);
        var b = c1 / c2;
        var pb = p0.add_vector(v.mul(b));
        return p.d(pb);
    }
};


var Box = (function () {
    function Box(ctx, width, height) {
        this._ctx = ctx;
        this._width = width;
        this._height = height;
        this._prev;
        this._flagDown = false;
        this.init();
    }

    Box.prototype.init = function () {
        window.requestAnimationFrame = function() {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                function(f) {
                    window.setTimeout(f,1000/FPS);
                }
        }();

        this._blobs = [];

        this._isOver = false;
        prevTime = new Date().getTime();
    };

    Box.prototype.handleClick = function(p){
        this.addBlob(p);
    };

    Box.prototype.handleDown = function(p){

    };

    Box.prototype.handleMove = function(p){


    };

    Box.prototype.handleUp = function(){
       
    };        

    Box.prototype.addBlob = function(pos){
        
        var rnd = Math.floor(Math.random() * (colors_names.length));
        var color = colors[colors_names[rnd]];

        var vel = utils.genVelo();
        var r = 16 + Math.random()*32;
        var b = new Blob(pos,r,vel,color);
        this._blobs.push(b);
    };


    Box.prototype.start = function () {
        this._paused = false;
        this._gameLoop();

    };

    Box.prototype.pause = function () {
        this._paused = true;
    };

    Box.prototype._gameLoop = function () {
        requestAnimationFrame(this._gameLoop.bind(this));
        if (!this._paused) {
            this._updateObjects();
            this._paused || this._redraw();
        }
    };

    Box.prototype._updateObjects = function () {
        //вычисление FPS
        now = new Date().getTime();
        dt = now - prevTime;
        FPS = 1000/dt;



        function blobIsOut(b) {
            var pos = b.getPosition(),
                r = b.getRadius();
            return pos.x + r < 0 || pos.y + r < 0 || pos.x - r > canvasWidth || pos.y + r > canvasHeight;
        }

        //фильтруем список шаров по признаку присутствия их на экране
        this._blobs = this._blobs.filter(function (b) {
            b.move(dt);
            return !blobIsOut(b);
        });

        //сохраняем текущее время
        prevTime = now;
    };


    Box.prototype._redraw = function () {
        this._clear();

        this._blobs.forEach(function (b) {
            b.draw(this._ctx);
        }, this);
    };

    Box.prototype._clear = function () {
        this._ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    };

    Box.prototype.isOver = function () {
        return this._isOver;
    };

    return Box;
})();

var start = true, down = false, tn = 0;

function handleClick(p){

}

function handleMove(p){
    
}

function handleDown(p){
        
}

function handleUp(p){
    
}

// Application start.
$window.load(function () {
    var $canvas = $('#pole').focus(),
        canvas = $canvas[0],
        canvasPosition = $canvas.offset(),
        pixelRatio = window.devicePixelRatio || 1;

    canvas.width = canvasWidth * pixelRatio;
    canvas.height = canvasHeight * pixelRatio;

    $canvas.css({ width : canvasWidth, height : canvasHeight });

    var ctx = canvas.getContext('2d');
    ctx.scale(pixelRatio, pixelRatio);

    var box = new Box(ctx, canvasWidth, canvasHeight);
    box.init();
    box.start();

   $(document)
        .on('mousedown', function (e) {
            box.handleDown(toVector2d(e, canvasPosition));
        })
        .on('mousemove', function (e) {
            box.handleMove(toVector2d(e, canvasPosition));
        })
        .on('mouseup', box.handleUp)
        .on('click', function (e) {
            box.handleClick(toVector2d(e, canvasPosition));
        });

});

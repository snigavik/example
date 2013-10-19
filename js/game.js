var $window = $(window),
    canvasWidth = $window.width() - 4,
    canvasHeight = $window.height() - 4,
    FPS = 4 * 12;

var now, prevTime;

var colors = {
        "red": "#ff0000",
        "yellow": "#ffff00",
        "green": "#21421E",
        "blue": "#0000ff"
    },
    colors_names = Object.keys(colors);

//=====================================

var Blob = (function () {
    function Blob(position, radius, velocity, color) {
        this._position = position;
        this._radius = radius;
        this._velocity = velocity;
        this._color = color;
    }

    Blob.prototype.getPosition = function () {
        return this._position;
    };

    Blob.prototype.getRadius = function () {
        return this._radius;
    };

    Blob.prototype.move = function (dt) {
        this._position.add_vector2(this._velocity.mul(dt / 1000));

    };

    Blob.prototype.setVelocity = function (v) {
        this._velocity = v;
    };

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
    genSign: function () {
        if (Math.random() > 0.5) return 1; else return -1;
    },
    genVelo: function () {
        var x = utils.genSign() * (1 + Math.random() * 10);
        var y = utils.genSign() * (1 + Math.random() * 10);
        return new Vector2d(x, y);
    },

    genPos: function () {
        var x = 100 + Math.random() * 400;
        var y = 100 + Math.random() * 400;
        return new Vector2d(x, y);
    },

    sign: function (n) {
        return n ? (n < 0 ? -1 : 1) : 0;
    },

    distance: function (p, p0, p1) {
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
    function Box(ctx) {
        this._ctx = ctx;
        this.init();
    }

    Box.prototype.init = function () {
        window.requestAnimationFrame = function () {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                function (f) {
                    window.setTimeout(f, 1000 / FPS);
                }
        }();

        this._blobs = [];
        prevTime = new Date().getTime();
    };

    Box.prototype.handleClick = function (p) {
        this.addBlob(p);
    };

    Box.prototype.addBlob = function (pos) {

        var rnd = Math.floor(Math.random() * (colors_names.length));
        var color = colors[colors_names[rnd]];

        var vel = utils.genVelo();
        var r = 16 + Math.random() * 32;
        var b = new Blob(pos, r, vel, color);
        this._blobs.push(b);
    };


    Box.prototype.start = function () {
        this._paused = false;
        this._gameLoop();

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
        FPS = 1000 / dt;


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


    return Box;
})();

// Application start.
$window.load(function () {
    var $canvas = $('#pole').focus(),
        canvas = $canvas[0],
        canvasPosition = $canvas.offset(),
        pixelRatio = window.devicePixelRatio || 1;

    canvas.width = canvasWidth - 100 * pixelRatio;
    canvas.height = canvasHeight - 100 * pixelRatio;

    $canvas.css({ width: canvasWidth - 100, height: canvasHeight - 100 });

    var ctx = canvas.getContext('2d');
    ctx.scale(pixelRatio, pixelRatio);

    var box = new Box(ctx, canvasWidth, canvasHeight);

    box.init();
    box.start();

    $canvas.on('click', function (e) {
        box.handleClick(toVector2d(e, canvasPosition));
    });

    $('#capture').on('click', function(e) {
        ctx.globalCompositeOperation = "destination-over";
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        window.open(document.getElementById('pole').toDataURL(), '');
    })

});

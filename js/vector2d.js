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
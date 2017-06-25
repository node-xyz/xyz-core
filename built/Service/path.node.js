Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("./../Util/Util");
var SerializedNode = (function () {
    function SerializedNode(name, path) {
        this.name = name;
        this.path = path;
        this.children = [];
    }
    SerializedNode.prototype.getChild = function (name) {
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var node = _a[_i];
            if (node.name === name) {
                return node;
            }
        }
    };
    SerializedNode.prototype.hasChild = function (name) {
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var node = _a[_i];
            if (node.name === name) {
                return true;
            }
        }
        return false;
    };
    return SerializedNode;
}());
exports.SerializedNode = SerializedNode;
var PathNode = (function () {
    function PathNode(name, path, depth, fn) {
        this.name = name;
        this.depth = depth;
        this.path = path;
        this.children = [];
        this.fn = fn;
    }
    PathNode.prototype._inspect = function () {
        var indent = '';
        for (var i = 0; i < this.depth - 1; i++)
            indent += '|  ';
        return "" + indent + Util_1.bold(this.name) + " @ " + this.depth + " [" + this.path + "] [fn: " + (this.fn ? this.fn['name'] || 'anonymousFN' : Util_1.wrapper('yellow', 'null')) + "]\n";
    };
    PathNode.prototype.inspect = function () {
        return this._inspect();
    };
    PathNode.prototype.getChild = function (name) {
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var node = _a[_i];
            if (node.name === name) {
                return node;
            }
        }
        return false;
    };
    PathNode.prototype.hasChild = function (name) {
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var node = _a[_i];
            if (node.name === name) {
                return true;
            }
        }
        return false;
    };
    PathNode.prototype.addChild = function (name, fn) {
        if (fn === void 0) { fn = null; }
        var newNode = new PathNode(name, this.path + "/" + name, this.depth + 1, fn);
        this.children.push(newNode);
    };
    PathNode.prototype.setFunction = function (fn) {
        this.fn = fn;
    };
    return PathNode;
}());
exports.PathNode = PathNode;

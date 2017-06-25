Object.defineProperty(exports, "__esModule", { value: true });
var path_node_1 = require("./path.node");
var TRAVERSE_RESULT;
(function (TRAVERSE_RESULT) {
    TRAVERSE_RESULT[TRAVERSE_RESULT["understep"] = 0] = "understep";
    TRAVERSE_RESULT[TRAVERSE_RESULT["fit"] = 1] = "fit";
    TRAVERSE_RESULT[TRAVERSE_RESULT["overstep"] = 2] = "overstep";
})(TRAVERSE_RESULT || (TRAVERSE_RESULT = {}));
var PathTree = (function () {
    function PathTree() {
        this.root = new path_node_1.PathNode('', '', 0, null);
        this.sRoot = new path_node_1.SerializedNode('', '');
        // TODO: this is only to avoid refactoring
        this.serializedTree = this.sRoot;
        this.plainTree = [];
    }
    PathTree.prototype.inspect = function () {
        return this._inspect(this.root, '');
    };
    PathTree.prototype._inspect = function (node, indent) {
        if (node === void 0) { node = this.root; }
        if (indent === void 0) { indent = '|  '; }
        var consoleValue = '';
        for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
            var child = _a[_i];
            consoleValue += (indent + child._inspect());
            if (child.children.length) {
                consoleValue += this._inspect(child, indent);
            }
        }
        return consoleValue;
    };
    PathTree.prototype.createPathSubtree = function (path, fn) {
        if (this.isRoot(path)) {
            this.root.fn = fn;
            return true;
        }
        var tokens = this.tokenize(path);
        var currentNode = this.root;
        var currentSNode = this.sRoot;
        var last = tokens[tokens.length - 1];
        for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
            var token = tokens_1[_i];
            if (!currentNode.hasChild(token)) {
                // add child to main tree
                currentNode.addChild(token, token === last ? fn : null);
                // add child to serialized tree
                currentSNode.children.push(new path_node_1.SerializedNode(token, currentSNode.path + "/" + token));
            }
            currentSNode = currentSNode.getChild(token);
            currentNode = currentNode.getChild(token);
        }
        this.plainTree.push({ path: path, name: fn['name'] || 'anonymousFN' });
        return true;
    };
    PathTree.prototype.getPathFunction = function (path) {
        if (this.isRoot(path))
            return this.root.fn;
        var tokes = this.tokenize(path);
        var currentNode = this.root;
        for (var _i = 0, tokes_1 = tokes; _i < tokes_1.length; _i++) {
            var token = tokes_1[_i];
            if (currentNode.hasChild(token)) {
                currentNode = currentNode.getChild(token);
            }
            else {
                return false;
            }
        }
        return currentNode.fn;
    };
    PathTree.prototype.isRoot = function (path) {
        if (path === '/')
            return true;
    };
    // deprecated
    PathTree.prototype.traverse = function (path) {
        var tokens = this.tokenize(path);
        var currentNode = this.root;
        var currentIndex = 0;
        var currentToken = tokens[currentIndex];
        var maxIndex = tokens.length - 1;
        while (currentNode.getChild(currentToken)) {
            currentIndex++;
            currentToken = tokens[currentIndex];
        }
        if (currentIndex === currentNode.depth) {
            return { status: TRAVERSE_RESULT.fit, node: currentNode };
        }
        if (currentIndex > currentNode.depth) {
            return { status: TRAVERSE_RESULT.overstep, node: currentNode };
        }
        if (currentIndex < currentNode.depth) {
            return { status: TRAVERSE_RESULT.understep, node: currentNode };
        }
    };
    PathTree.prototype.tokenize = function (path) {
        return path.split('/').slice(1);
    };
    return PathTree;
}());
exports.PathTree = PathTree;

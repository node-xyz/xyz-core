Object.defineProperty(exports, "__esModule", { value: true });
exports.Path = {
    validate: function (path) {
        if (path === '/') {
            return true;
        }
        return /^(\/((\*)|([a-zA-Z]|[1-9])+))*$/.test(path);
    },
    format: function (path) {
        /**
         * If it doesn't start with '/', append to it
         */
        if (path.slice(0, 1) !== '/') {
            path = '/' + path;
        }
        /**
         * If it ends with a '/', remove it
         */
        if (path.slice(-1) === '/') {
            path = path.slice(0, -1);
        }
        /**
         * Replace (/)* with a single slash
         */
        while (path !== path.replace(/\/{2,}/, '/')) {
            path = path.replace(/\/{2,}/, '/');
        }
        return path;
    },
    merge: function (src, dest, prefix, child) {
        return src.concat(dest.map(function (obj) {
            return prefix.slice(1) + "/" + child + "/" + obj;
        }));
    },
    match: function (path, serializeTree, partial) {
        if (partial === void 0) { partial = false; }
        var matches = [];
        var tokens = path.split('/').slice(1);
        var currentNode = serializeTree;
        var index = 0;
        for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
            var token = tokens_1[_i];
            // wildcard
            if (token === '*') {
                for (var _a = 0, _b = currentNode.children; _a < _b.length; _a++) {
                    var candidate = _b[_a];
                    var candidateResult = exports.Path.match(tokens.slice(index).join('/'), candidate, false);
                    matches = matches.concat(candidateResult);
                }
                return matches;
            }
            else {
                if (exports.Path.hasChild(currentNode, token)) {
                    currentNode = exports.Path.getChild(currentNode, token);
                }
                else {
                    return [];
                }
            }
            index++;
        }
        if (path !== '/')
            matches.push(currentNode.path);
        return matches;
    },
    hasChild: function (node, token) {
        for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
            var child = _a[_i];
            if (child.name === token)
                return true;
        }
        return false;
    },
    getChild: function (node, token) {
        for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
            var child = _a[_i];
            if (child.name === token)
                return child;
        }
    }
};

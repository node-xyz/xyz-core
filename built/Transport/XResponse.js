module.exports = function (resposenObject) {
    resposenObject['jsonify'] = function (data) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        resposenObject.end.apply(resposenObject, [JSON.stringify(data)].concat(args));
    };
};

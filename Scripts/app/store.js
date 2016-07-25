define('store',
    ['jquery', 'amplify', 'config'],
    function ($, amplify, config) {
        var
            expires = { expires: config.storeExpirationMs },
            clear = function (key) {
                return amplify.store(key, null);
            },
            fetch = function (key) {
                return amplify.store(key);
            },
            save = function (key, value) {
                amplify.store(key, value, expires);

            },
        clearall = function () {
            var key, data = amplify.store();
            for (key in data) {
                clear(key);
                console.log("cleared :",key, " is ", data[key]);
            }
        };
        return {
            clear: clear,
            fetch: fetch,
            save: save,
            clearall:clearall
        };
    });
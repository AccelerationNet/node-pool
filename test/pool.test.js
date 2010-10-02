var poolModule = require('pool');

module.exports = {

    'expands to max limit' : function (assert, beforeExit) {
        var createCount  = 0;
        var destroyCount = 0;

        var pool = poolModule.Pool({
            name     : 'test1',
            create   : function(callback) {
                createCount++;
                callback(createCount);
            },
            destroy  : function(client) { destroyCount++; },
            max : 2,
            idleTimeoutMillis : 100
        });

        for (var i = 0; i < 10; i++) {
            pool.borrow(function(obj) {
                setTimeout(function() {
                    pool.returnToPool(obj);
                }, 100);
            });
        }

        beforeExit(function() {
            assert.equal(2, createCount);
            assert.equal(2, destroyCount);
        });
    }
    
};

# About

  Generic resource pool.  Can be used to reuse or throttle expensive resources such as
  database connections.

## Installation

    $ npm install generic-pool

## Example

    // Create a MySQL connection pool with
    // a max of 10 connections and a 30 second max idle time
    var poolModule = require('generic-pool');
    var pool = poolModule.Pool({
        name     : 'mysql',
        create   : function(callback) {
            var Client = require('mysql').Client;
            var c = new Client();
            c.user     = 'scott';
            c.password = 'tiger';
            c.database = 'mydb';
            c.connect();
            callback(c);
        },
        destroy  : function(client) { client.end(); },
        max      : 10,
        idleTimeoutMillis : 30000,
        log : false
    });

    // borrow connection - callback function is called
    // once a resource becomes available
    pool.borrow(function(client) {
        client.query("select * from foo", [], function() {
            // return object back to pool
            pool.returnToPool(client);
        });
    });
    
    
## Priority Queueing

The pool now supports optional priority queueing.  This becomes relevant when no resources 
are available and the caller has to wait. borrow() accepts an optional priority int which 
specifies the caller's relative position in the queue.

    // create pool with priorityRange of 3
    // borrowers can specify a priority 0 to 2
    var pool = poolModule.Pool({
        name     : 'mysql',
        create   : function(callback) {
            // do something
        },
        destroy  : function(client) { 
            // cleanup.  omitted for this example
        },
        max      : 10,
        idleTimeoutMillis : 30000,
        priorityRange : 3
    });

    // borrow connection - no priority - will go at end of line
    pool.borrow(function(client) {
        pool.returnToPool(client);
    });
    
    // borrow connection - high priority - will go into front slot
    pool.borrow(function(client) {
        pool.returnToPool(client);
    }, 0);
    
    // borrow connection - medium priority - will go into middle slot
    pool.borrow(function(client) {
        pool.returnToPool(client);
    }, 1);
    
    // etc..

## Documentation

    Pool() accepts an object with these slots:

                  name : name of pool (string, optional)
                create : function that returns a new resource
                           should call callback() with the created resource
               destroy : function that accepts a resource and destroys it
                   max : maximum number of resources to create at any given time
     idleTimeoutMillis : max milliseconds a resource can go unused before it should be destroyed
                         (default 30000)
    reapIntervalMillis : frequency to check for idle resources (default 1000),
         priorityRange : int between 1 and x - if set, borrowers can specify their
                         relative priority in the queue if no resources are available.
                         see example.  (default 1)
                   log : true/false  - if true, verbose log info will be sent to console.log()
                         (default false)


## Run Tests

    $ npm install expresso
    $ expresso -I lib test/*.js



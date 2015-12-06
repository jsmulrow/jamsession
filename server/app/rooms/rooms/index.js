'use strict';
var router = require('express').Router();
module.exports = router;
var _ = require('lodash');

var path = require('path');


var ensureAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).end();
    }
};

router.get('/:roomName', ensureAuthenticated, function (req, res) {
    console.log('got a req', req.params.roomName);

    res.send("hey");
});
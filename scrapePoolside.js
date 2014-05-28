#! /usr/bin/env node

var request = require('request'); // need this: npm install request
var fs = require('fs');
var http = require('http');

// NOTE: you have to create this dir - this script won'd do it for you
var downloadDir = './tracks/';

request({
    url: 'http://poolsideapi2.herokuapp.com/tracks?p=1',
    json: true
}, function( e, r, b ) {
    if ( !e && r.statusCode === 200 ) {
        var i = 0;
        // set interval to avoid flooding with requests
        var interval = setInterval(function() {
            var sanitizedArtist = sanitizeString( b[i].artist );
            var sanitizedTrack = sanitizeString( b[i].title );
            getStreampocket( encodeURIComponent( b[i].scUrl ), sanitizedArtist + ' - ' + sanitizedTrack );

            i++;
	    if ( i >= b.length ) {
		clearInterval( interval );
		console.log( i + ' tracks processed' );
	    }
        }, 3000);
    }
});

function getStreampocket(url, track) {
    url = 'http://streampocket.com/json?stream=' + url;

    console.log( 'requesting ' + track );
    request({
        url: url,
        json: true
    }, function( e, r, b ) {
        if ( !e && r.statusCode === 200 && typeof b !== 'undefined' && b.hasOwnProperty( 'recorded' ) ) {
            downloadMp3( b.recorded, track );
        } else {
	    console.log( 'issue with ' + track );
	}
    });
}

function downloadMp3( url, track ) {
    console.log( '... downloading ' + track );
    request( url ).pipe( fs.createWriteStream( downloadDir + track + '.mp3' ) );
}

function sanitizeString( string ) {
    return string.replace(/"/g, '').replace(/'/g, '').replace(/\?/g, '').replace(/\//g, '');
}
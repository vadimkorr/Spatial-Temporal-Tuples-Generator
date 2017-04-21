
var fs = require('fs');

var numberOfTuples = process.argv[2] || 5;  //number of rows
var fileName = process.argv[3] || "";       //name of file toFixed save in

var linesPortion = process.argv[4] || 0;    //
var seedPoint = process.argv[5];            //
var areaRadius = process.argv[6];           //

var gen = {
    genRnd: function(border) {
        var num = (Math.random()*border).toFixed(5);
        var posorneg = Math.floor(Math.random());
        if (posorneg == 0) {
            num = num * -1;
        }
        return num;
    },

    // Lattitude -90 to +90
    genLat: function() {
        return this.genRnd(90);
    },

    // Longitude -180 to + 180
    genLng: function() {
        return this.genRnd(180);
    },

    //[lattitude, longitude]
    genCoord: function() {
        return {
            "lat": this.genLat(), 
            "lng": this.genLng()
        };
    },

    getStr: function(id, coordWkt, timeInterval, payload, s) {
        var str = id + s + coordWkt + s + timeInterval + s + payload;
        return str;
    },

    getLineWkt: function(coords) {
        var str = "LINE (";
        coord.forEach((point) => {
            str += point.lat + " " + point.lng + ", "
        });
        str += ")";
        return str;
    },

    getCoordWkt: function(coord) {
        var str = "POINT (" + coord.lat + " " + coord.lng + ")";
        return str;
    }
    
};

function writeToFile(fileName) {
    console.log("Start gen\n");
    var file = fs.createWriteStream(fileName);
    file.on('error', function(err) {
        console.log("ERROR", err);
    });

    for (i = 0; i < numberOfTuples; i++) {
        var coordWkt = gen.getCoordWkt(gen.genCoord());
        var str = gen.getStr(i, coordWkt, i, "", ";");
        
        //console.log(str);
        file.write(str + '\n');
    }

    file.end();

    console.log(numberOfTuples + "\n tuples were created\n");
}

writeToFile(fileName);
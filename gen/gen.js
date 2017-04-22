var fs = require('fs');

var fileName 		= process.argv[2] || "";       			//name of file toFixed save in
var numberOfTuples 	= process.argv[3] || 5;  				//number of rows

var linesPortion 	= process.argv[4] || 0;    				//portion of lines in generated rows 0..1
var latRange 		= process.argv[5] || [-90,90];			//range of lat where events will be generated
var lngRange 		= process.argv[6] || [-180,180];		//range of lng where events will be generated
var segRangeInLine 	= process.argv[7] || [3, 10];     		//number of segments in line
var latOffsetRange 	= process.argv[8] || [-10000, 70000];	//offset range for each next line segment
var lngOffsetRange 	= process.argv[9] || [-10000, 70000];	//offset range for each next line segment


var gen = {
    genRnd: function(range) {
		var num = (Math.random() * (range[1] - range[0] + 1) + range[0]).toFixed(15);
        var posOrNeg = Math.round(Math.random());
        if (posOrNeg == 0) {
            num = num * -1;
        }
        return num;
    },

    // Lattitude -90 to +90  //0Y
    genLat: function(range) {
        return this.genRnd(range);
    },

    // Longitude -180 to + 180 //0X
    genLng: function(range) {
        return this.genRnd(range);
    },

    //[lattitude, longitude]
    genCoord: function() {
        return [this.genLat(latRange), this.genLng(lngRange)];
    },

    getStr: function(id, coordWkt, timeInterval, payload, s) {
        var str = id + s + coordWkt + s + timeInterval + s + payload;
        return str;
    },
	
	getRandomIntInRange: function(range) {
		return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
	},

    getLineWkt: function(initCoord, numberOfSegments, latOffsetRange, lngOffsetRange) {
        var str = "LINESTRING (";
		var newCoord = initCoord;
		str += initCoord[0] + " " + initCoord[1]; 
		for (var i=0; i<numberOfSegments; i++) {
			newCoord = this.addOffset(newCoord,  [this.getRandomIntInRange(latOffsetRange), this.getRandomIntInRange(lngOffsetRange)], 15);	
			if (newCoord[0] < -90) 	{ newCoord[0] = -90 }
			if (newCoord[0] > 90) 	{ newCoord[0] = 90  }
			if (newCoord[1] < -180) { newCoord[1] = -180}
			if (newCoord[1] > 180) 	{ newCoord[1] = 180	}	
			str += ", " + newCoord[0] + " " + newCoord[1];
		}
        str += ")";
        return str;
    },

    getPointWkt: function(coord) {
        var str = "POINT (" + coord[0] + " " + coord[1] + ")";
        return str;
    },
	
	addOffset: function(coords, offset, toFixedNumber) {
		const rEarth = 6378100;
		var newLat  = parseFloat(coords[0]) + (offset[0] / rEarth) * (180 / Math.PI);
		var newLng =  parseFloat(coords[1]) + (offset[1] / rEarth) * (180 / Math.PI) / Math.cos(parseFloat(coords[0]) * Math.PI/180);
		var res = [parseFloat(newLat).toFixed(toFixedNumber), parseFloat(newLng).toFixed(toFixedNumber)];
		return res;
	}
};

function genAndSave(fileName, numberOfTuples, linesPortion, segRangeInLine, latOffsetRange, lngOffsetRange) {
    console.log("Start gen\n");
	var file = fs.createWriteStream(fileName);
		file.on('error', function(err) {
		console.log("ERROR", err);
	});

    for (i = 0; i < numberOfTuples; i++) {
		var str = "";
		if (Math.random() <= linesPortion) {
			var lineWkt = gen.getLineWkt(gen.genCoord(), gen.getRandomIntInRange(segRangeInLine), latOffsetRange, lngOffsetRange);		
			str = gen.getStr(i, lineWkt, i, "", ";");
		} else {
			var coordWkt = gen.getPointWkt(gen.genCoord());
			str = gen.getStr(i, coordWkt, i, "", ";");
		}
        file.write(str + '\n');
    }
    file.end();
    console.log(numberOfTuples + "\n tuples were created\n");
}

function initRanges(range, type) {//type "int", "float"
	if (range instanceof Array) {
		return range;
	} else {
		var arr = range.split(",");
		for (r in arr) {
			arr[r] = type == "int"   ? parseInt(arr[r]) 
				   : type == "float" ? parseFloat(arr[r]) 
				   : "";
		}
		return arr;
	}	
}

latRange 		= initRanges(latRange		, "float");
lngRange 		= initRanges(lngRange		, "float");
segRangeInLine 	= initRanges(segRangeInLine	, "int");
latOffsetRange 	= initRanges(latOffsetRange	, "int");
lngOffsetRange 	= initRanges(lngOffsetRange	, "int");
genAndSave(fileName, numberOfTuples, linesPortion, segRangeInLine, latOffsetRange, lngOffsetRange);
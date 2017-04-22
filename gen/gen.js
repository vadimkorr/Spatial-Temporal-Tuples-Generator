var fs 			= require('fs');
var parseArgs 	= require('./js/minimist.js')

var args = parseArgs(process.argv, {});

var fileName 		= args.output 	 || "";       			//--output="" 				name of file toFixed save in
var numberOfTuples 	= args.tuples 	 || 5;  				//--tuples=5 				number of rows
var linesPortion 	= args.lines	 || 0;    				//--lines=0.5 				portion of lines in generated rows 0..1
var latRange 		= args.latRange	 || [-90,90];			//--latRange="-90,90" 		range of lat where events will be generated
var lngRange 		= args.lngRange	 || [-180,180];			//--lngRange="-180,180" 	range of lng where events will be generated
var segRangeInLine 	= args.seg		 || [3, 10];     		//--seg="3,10"				number of segments in line
var latOffsetRange 	= args.latOffset || [-10000, 70000];	//--latOffset="-100,1000"	offset range for each next line segment in meters
var lngOffsetRange 	= args.lngOffset || [-10000, 70000];	//--lngOffset="0,5000"		offset range for each next line segment in meters
var radiusRange		= args.radius    || [1000, 5000];		//--radius="1000,5000"		uncertain radius
var clusterIdRange	= args.clIdRange || [1,100];			//--clIdRange="1,100"		range for generating cluster ids
const toFixed = 7;

var gen = {
    genRnd: function(range, toFixed) {
		var num = (Math.random() * (range[1] - range[0] + 1) + range[0]).toFixed(toFixed);
        var posOrNeg = Math.round(Math.random());
        if (posOrNeg == 0) {
            num = num * -1;
        }
        return num;
    },

    // Lattitude -90 to +90  //0Y
    genLat: function(range, toFixed) {
        return this.genRnd(range, toFixed);
    },

    // Longitude -180 to + 180 //0X
    genLng: function(range) {
        return this.genRnd(range, toFixed);
    },

    //[lattitude, longitude]
    genCoord: function(toFixed) {
        return [this.genLat(latRange, toFixed), this.genLng(lngRange, toFixed)];
    },

    getStr: function(id, coordWkt, radius, timeInterval, payload, clusterIdRange, s) {
        var str = id + s + coordWkt + s + radius + s + timeInterval + s + payload + s + clusterIdRange;
        return str;
    },
	
	getRandomIntInRange: function(range) {
		return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
	},

    getLineWkt: function(initCoord, numberOfSegments, latOffsetRange, lngOffsetRange, toFixed) {
        var str = "LINESTRING (";
		var newCoord = initCoord;
		str += initCoord[0] + " " + initCoord[1]; 
		for (var i=0; i<numberOfSegments; i++) {
			newCoord = this.addOffset(newCoord,  [this.getRandomIntInRange(latOffsetRange), this.getRandomIntInRange(lngOffsetRange)], toFixed);	
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

function genAndSave(fileName, numberOfTuples, linesPortion, segRangeInLine, latOffsetRange, lngOffsetRange, radiusRange, clusterIdRange, toFixed) {
    console.log("Start gen\n");
	var file = fs.createWriteStream(fileName);
		file.on('error', function(err) {
		console.log("ERROR", err);
	});

    for (i = 0; i < numberOfTuples; i++) {
		var str = "";
		if (Math.random() <= linesPortion) {
			var lineWkt = gen.getLineWkt(gen.genCoord(toFixed), gen.getRandomIntInRange(segRangeInLine), latOffsetRange, lngOffsetRange, toFixed);	
			var uncRadius = gen.getRandomIntInRange(radiusRange);
			var clusterId = gen.getRandomIntInRange(clusterIdRange);
			str = gen.getStr(i, lineWkt, uncRadius, i, "", clusterId, ";");
		} else {
			var coordWkt = gen.getPointWkt(gen.genCoord(toFixed));
			var uncRadius = gen.getRandomIntInRange(radiusRange);
			var clusterId = gen.getRandomIntInRange(clusterIdRange);
			str = gen.getStr(i, coordWkt, uncRadius, i, "", clusterId, ";");
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

function init() {
	latRange 		= initRanges(latRange		, "float");
	lngRange 		= initRanges(lngRange		, "float");
	segRangeInLine 	= initRanges(segRangeInLine	, "int");
	latOffsetRange 	= initRanges(latOffsetRange	, "int");
	lngOffsetRange 	= initRanges(lngOffsetRange	, "int");
	radiusRange 	= initRanges(radiusRange	, "int");
	clusterIdRange  = initRanges(clusterIdRange	, "int");
}

init();
genAndSave(fileName, numberOfTuples, linesPortion, segRangeInLine, latOffsetRange, lngOffsetRange, radiusRange, clusterIdRange, toFixed);
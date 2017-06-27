var fs          = require('fs');
var parseArgs   = require('./node_modules/minimist/index.js')
var time        = require("./scripts/time.js")
var geo         = require("./scripts/geo.js")
var conv        = require("./scripts/converters.js")

var args = parseArgs(process.argv, {});

var fileName         = args.output        || "";                 //--output=""               name of file toFixed save in
var numberOfTuples   = args.tuples        || 5;                  //--tuples=5                number of rows
var linesPortion     = args.lines         || 0;                  //--lines=0.5               portion of lines in generated rows 0..1
var latRange         = args.latRange      || [-90,90];           //--latRange="-90,90"       range of lat where events will be generated
var lngRange         = args.lngRange      || [-180,180];         //--lngRange="-180,180"     range of lng where events will be generated
var segRangeInLine   = args.seg           || [3, 10];            //--seg="3,10"              number of segments in line
var latOffsetRange   = args.latOffset     || [-10000, 70000];    //--latOffset="-100,1000"   offset range for each next line segment in meters
var lngOffsetRange   = args.lngOffset     || [-10000, 70000];    //--lngOffset="0,5000"      offset range for each next line segment in meters
var radiusRange      = args.radius        || [1000, 5000];       //--radius="1000,5000"      uncertain radius
var clusterIdRange   = args.clIdRange     || [1,100];            //--clIdRange="1,100"       range for generating cluster ids
var clusterIdRange   = args.clIdRange     || [1,100];            //--clIdRange="1,100"       range for generating cluster ids
var minTime          = args.minTime       || "1/1/2000";         //--minTime="1/1/2000"      min time to generate time interval
var maxTime          = args.maxTime       || "1/1/2017";         //--maxTime="1/1/2017"      max time to generate time interval
var daysInterval     = args.daysInterval  || 30;                 //--daysInterval=30         max size of generated interval in days
var withClusterId    = args.withClusterId || true;               //--withClusterId=true      is cluster id needed

const toFixed = 7;

function genAndSave(fileName, numberOfTuples, linesPortion, segRangeInLine, latRange, lngRange, latOffsetRange, lngOffsetRange, radiusRange, clusterIdRange, toFixed, minTime, maxTime, daysInterval, withClusterId) {
    console.log("Generating...\n");
	var file = fs.createWriteStream(fileName);
		file.on('error', function(err) {
		console.log("ERROR", err);
	});

    for (i = 0; i < numberOfTuples; i++) {
		var wkt;
		if (Math.random() <= linesPortion) {
			wkt = geo.getLineWkt(geo.genCoord(latRange, lngRange, toFixed), geo.getRandomIntInRange(segRangeInLine), latOffsetRange, lngOffsetRange, toFixed);	
		} else {
			wkt = geo.getPointWkt(geo.genCoord(latRange, lngRange, toFixed));
		}
		
		var uncRadius = geo.getRandomIntInRange(radiusRange);
		var clusterId = (withClusterId==='true') ? geo.getRandomIntInRange(clusterIdRange) : "";
		var timeInterval = time.getRndTimeInterval(new Date(minTime), new Date(maxTime), conv.daysToMs(daysInterval), true)
		var str = geo.getStr(i, wkt, uncRadius, timeInterval[0], timeInterval[1], "payload", clusterId, ";");

        file.write(str + '\n');
    }
    file.end();
    console.log(numberOfTuples + " tuples were generated\n");
}

function initRanges(range, type) {//type = "int", "float"
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
genAndSave(fileName, numberOfTuples, linesPortion, segRangeInLine, latRange, lngRange, latOffsetRange, lngOffsetRange, radiusRange, clusterIdRange, toFixed, minTime, maxTime, daysInterval, withClusterId);
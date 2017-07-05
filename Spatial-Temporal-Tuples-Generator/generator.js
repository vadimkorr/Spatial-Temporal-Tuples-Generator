var fs = require('fs');
var parseArgs = require('./node_modules/minimist/index.js');
var time = require("./scripts/time.js");
var geo = require("./scripts/geo.js");
var conv = require("./scripts/converters.js");
var cluster = require('cluster');
var concat = require("concat-files");
var rimraf = require("rimraf");
var child_process = require('child_process');
var os = require('os');

const NUM_CPUS = os.cpus().length;
const TO_FIXED = 7;
const TEMP_FOLDER = "temp";
const OS_PLATFORM = os.platform();

// concatenating result files
// lib - using 'concat-files', but it doesn't support merging large files
// os - using cmd commands, current version supports only windows commands :(
// no - preserves temp folder to be removed
const MERGING_LIB = 'lib';
const MERGING_OS = 'os';
const MERGING_NO = 'no';

var args = parseArgs(process.argv, {});
var fileName = args.output || "output.csv"; //--output="" : name of file toFixed save in
var numberOfTuples = args.tuples || 100; //--tuples=5 : number of rows
var linesPortion = args.lines || 0; //--lines=0.5 : portion of lines in generated rows 0..1
var latRange = args.latRange || [-90,90]; //--latRange="-90,90" : range of lat where events will be generated
var lngRange = args.lngRange || [-180,180]; //--lngRange="-180,180" : range of lng where events will be generated
var segRangeInLine = args.seg || [3, 10]; //--seg="3,10" : number of segments in line
var latOffsetRange = args.latOffset || [-10000, 70000]; //--latOffset="-100,1000" : offset range for each next line segment in meters
var lngOffsetRange = args.lngOffset || [-10000, 70000]; //--lngOffset="0,5000" : offset range for each next line segment in meters
var radiusRange = args.radius || [1000, 5000]; //--radius="1000,5000" : uncertain radius
var clusterIdRange = args.clIdRange || [1,100]; //--clIdRange="1,100" : range for generating cluster ids
var minTime = args.minTime || "1/1/2000"; //--minTime="1/1/2000" : min time to generate time interval
var maxTime = args.maxTime || "1/1/2017"; //--maxTime="1/1/2017" : max time to generate time interval
var daysInterval = args.daysInterval || 30; //--daysInterval=30 : max size of generated interval in days
var withClusterId = args.withClusterId || true; //--withClusterId=true : is cluster id needed
var numThreads = args.numThreads || NUM_CPUS; //--numThreads : number of threads to divide the task 
var merging = args.merging || MERGING_LIB; //--merging : what kind of tool to use for concatenating files 

//array of file names with generated events, created per each node 
let files = [];

function createTempFolder(callback) {
  fs.mkdir(TEMP_FOLDER, callback);
}

function removeTempFolder(callback) {
  rimraf(TEMP_FOLDER, function() {
    console.log("Removing temporary files finished");
    if (callback) callback();
  });
}

function genAndSave(fileName, numberOfTuples, linesPortion, segRangeInLine, latRange, lngRange, latOffsetRange, lngOffsetRange, radiusRange, clusterIdRange, toFixed, minTime, maxTime, daysInterval, withClusterId) {
  return new Promise(function(resolve, reject) {
    let file = fs.createWriteStream(fileName);
		
    file.on('error', function(err) {
      console.log("ERROR", err);
    });
		
    file.on('finish', function() {
      console.log(numberOfTuples + " tuples were generated\n");
      return resolve(fileName);
    });

    for (let i = 0; i < numberOfTuples; i++) {
      let wkt;
      if (Math.random() <= linesPortion) {
        wkt = geo.getLineWkt(geo.genCoord(latRange, lngRange, toFixed), geo.getRandomIntInRange(segRangeInLine), latOffsetRange, lngOffsetRange, toFixed);	
      } else {
        wkt = geo.getPointWkt(geo.genCoord(latRange, lngRange, toFixed));
      }
			
      let uncRadius = geo.getRandomIntInRange(radiusRange);
      let clusterId = (withClusterId==='true') ? geo.getRandomIntInRange(clusterIdRange) : "";
      let timeInterval = time.getRndTimeInterval(new Date(minTime), new Date(maxTime), conv.daysToMs(daysInterval), true)
      let str = geo.getStr(i, wkt, uncRadius, timeInterval[0], timeInterval[1], "This is a string with an examples of the payload. Here information about the actors, characteristics or a just a small description of the event can be written.", clusterId, ";");
      i == numberOfTuples - 1 ? file.write(str) : file.write(str + '\n');
	}
    file.end();		
  });
}

//points that all workers are finished their work
let finished = false;

function startGen(fileName, numberOfTuples, linesPortion, segRangeInLine, latRange, lngRange, latOffsetRange, lngOffsetRange, radiusRange, clusterIdRange, toFixed, minTime, maxTime, daysInterval, withClusterId, numThreads) {
  if (cluster.isMaster) {  
    createTempFolder(function() {
      var start = Date.now();
      for (let t = 0; t < numThreads; t++) {
        let worker = cluster.fork();
        worker.on('message', function(partialResultFileName) {	
          files.push(partialResultFileName);	
          console.log('Process ' + this.process.pid + '  has finished generating');
          this.destroy();
        });
        worker.send([TEMP_FOLDER + "//file_" + t + ".txt", parseInt(numberOfTuples/numThreads)]);
      }

      cluster.on('exit', function(worker) {
        if (!finished) {		
          if (Object.keys(cluster.workers).length === 0/* && cluster.isMaster*/) {
            finished = true;
            console.log('Every worker has finished its job.');
            console.log('Generating time: ' + (Date.now() - start) + 'ms');
            mergingFilesHubFunction(files, fileName);
          }
        }
      });
	}); 
  } else {
    process.on('message', function(params) {
      let fileName = params[0];
      let numberOfTuplesPerWorker = params[1];
      console.log('Process ' + process.pid + '  is starting to generate.');

      genAndSave(fileName, numberOfTuplesPerWorker, linesPortion, segRangeInLine, latRange, lngRange, latOffsetRange, lngOffsetRange, radiusRange, clusterIdRange, toFixed, minTime, maxTime, daysInterval, withClusterId)
        .then(function(fileName) {
          console.log(fileName + " saved");
          process.send(fileName);
        });
    });
  }		
}

function mergingFilesHubFunction(files, fileName) {
  switch (merging) {
	case MERGING_LIB: {
	  let startSaving = Date.now();
	  concat(files, fileName, function(err) {
		if (err) throw err
		console.log('saving time: ' + (Date.now() - startSaving) + 'ms');
		console.log('done');
		removeTempFolder(function() {
		  process.exit(1);
		});
	  });
	  break;
	}	
	case MERGING_OS: {
	  switch(OS_PLATFORM) {
		case 'win32': {
		  mergeFilesCmd(fileName, function() {		 
			removeTempFolder(function() {
			  process.exit(1);
			});
		  });
          break;		  
		}
		default: {
		  console.log("Unsupported os platform: " + OS_PLATFORM);
		  break;
		}
	  }
	  break;
	}
	case MERGING_NO: {
		console.log("No merging");
		process.exit(1);
		break;
	}
	default: {
	  console.log("Unsupported merging type: " + merging);
	  break;
	}
  }
}

function mergeFilesCmd(outputFileName, onClose) {
  child_process.exec("copy " + TEMP_FOLDER + "\\* " + outputFileName, function(error, stdout, stderr) {
    if (stdout) console.log("stdout", "\n", stdout);
	if (stderr) console.log("stderr", "\n", stderr);
	if (error) console.log("error", "\n", error);
  })
  .addListener('close', function() {
	  console.log(OS_PLATFORM + ": merging files finished");
	  onClose();
  });
}

function initRanges(range, type) {//type = "int", "float"
  if (range instanceof Array) {
    return range;
  } else {
    var arr = range.split(",");
    for (r in arr) {
      arr[r] = type == "int" ? parseInt(arr[r]) 
        : type == "float" ? parseFloat(arr[r]) 
        : "";
    }
    return arr;
  }	
}

function init() {
  latRange = initRanges(latRange, "float");
  lngRange = initRanges(lngRange, "float");
  segRangeInLine = initRanges(segRangeInLine, "int");
  latOffsetRange = initRanges(latOffsetRange, "int");
  lngOffsetRange = initRanges(lngOffsetRange, "int");
  radiusRange = initRanges(radiusRange, "int");
  clusterIdRange = initRanges(clusterIdRange, "int");
}

init();
startGen(fileName, numberOfTuples, linesPortion, segRangeInLine, latRange, lngRange, latOffsetRange, lngOffsetRange, radiusRange, clusterIdRange, TO_FIXED, minTime, maxTime, daysInterval, withClusterId, numThreads);
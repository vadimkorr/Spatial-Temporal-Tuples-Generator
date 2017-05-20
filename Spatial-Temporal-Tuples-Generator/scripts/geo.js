module.exports = {
    genRnd: function(range, toFixed) {
		var num = (Math.random() * (range[1] - range[0] + 1) + range[0]).toFixed(toFixed);
        /*var posOrNeg = Math.round(Math.random());
        if (posOrNeg == 0) {
            num = num * -1;
        }*/
        return num;
    },

    // Lattitude -90 to +90  //0Y
    genLat: function(range, toFixed) {
        return this.genRnd(range, toFixed);
    },

    // Longitude -180 to + 180 //0X
    genLng: function(range, toFixed) {
        return this.genRnd(range, toFixed);
    },

    //[lattitude, longitude]
    genCoord: function(latRange, lngRange, toFixed) {
        return [this.genLat(latRange, toFixed), this.genLng(lngRange, toFixed)];
    },

    getStr: function(id, coordWkt, radius, timeStart, timeFinish, payload, clusterId, s) {
        var str = id + s + coordWkt + s + radius + s + timeStart + s + timeFinish + s + payload + ((clusterId == "") ? "" : s + clusterId);
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
		const EARTH_RADIUS = 6378100;//meters
		var newLat  = parseFloat(coords[0]) + (offset[0] / EARTH_RADIUS) * (180 / Math.PI);
		var newLng =  parseFloat(coords[1]) + (offset[1] / EARTH_RADIUS) * (180 / Math.PI) / Math.cos(parseFloat(coords[0]) * Math.PI/180);
		var res = [parseFloat(newLat).toFixed(toFixedNumber), parseFloat(newLng).toFixed(toFixedNumber)];
		return res;
	}
}
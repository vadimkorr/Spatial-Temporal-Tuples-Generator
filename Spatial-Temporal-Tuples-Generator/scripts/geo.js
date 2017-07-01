module.exports = {
    genRnd: function(range, toFixed) {
		var num = (Math.random() * (range[1] - range[0]/* + 1*/) + range[0]).toFixed(toFixed);
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

    genCoord: function(latRange, lngRange, toFixed) {
        return [this.genLng(lngRange, toFixed), this.genLat(latRange, toFixed)];
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
			if (newCoord[1] < -90) 	{ newCoord[1] = -90 }
			if (newCoord[1] > 90) 	{ newCoord[1] = 90  }
			if (newCoord[0] < -180) { newCoord[0] = -180}
			if (newCoord[0] > 180) 	{ newCoord[0] = 180	}	
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
        let lng = coords[0];
        let lat = coords[1];   
        let lngOffset = offset[0];
        let latOffset = offset[1];  
		const EARTH_RADIUS = 6378100;//meters
		var newLat  = parseFloat(lat) + (latOffset / EARTH_RADIUS) * (180 / Math.PI);
		var newLng =  parseFloat(lng) + (lngOffset / EARTH_RADIUS) * (180 / Math.PI) / Math.cos(parseFloat(lng) * Math.PI/180);
		var res = [parseFloat(newLng).toFixed(toFixedNumber), parseFloat(newLat).toFixed(toFixedNumber)];
		return res;
	}
}
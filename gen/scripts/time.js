//require("./scripts/conv.js")

//time.getRndTimeInterval(new Date("1/1/2000"), new Date("1/1/2010"), conv.daysToMs(30), false)
module.exports = {
	//returns timestamp as day/month/year
	getTimestamp: function(timelong) {
		var d = new Date(timelong);
		return d.getDate() + '/' + (d.getMonth() + 1) + '/' +  d.getFullYear();
	},
	//get milliseconds from timestamp 
	getLongTimeFromTimestamp: function(ts) {
		return new Date(ts).getTime();  
	},
	//get new Date with start values
	getStartDate: function(y, m = 0, d = 1, h = 0, min = 0, s = 0, ms = 0) {
		return new Date(y, m, d, h, min, s, ms);
	},
	//get new Date with finish values
	getFinishWithLastDate: function(y, m = 11, d = 31, h = 23, min = 59, s = 59, ms = 999) {
		var days = this.getDaysInMonth(y, m);
		return new Date(y, m, days, h, min, s, ms);
	},
	//get number of days in month according on year and month
	getDaysInMonth: function(y, m) {
		return new Date(y, m, 0).getDate();
	},
	//get new Date with finish values, but with custom day
	setFinishDate: function(y, m, d, h = 23, min = 59, s = 59, ms = 999) {
		return new Date(y, m, d, h, min, s, ms);
	},
	//get random date in ms between defined min and max Dates 
	getRndLongTime: function(minDate, maxDate) {
		var min = minDate.getTime();
		var max = maxDate.getTime();
		return new Date(Math.floor(Math.random() * (max - min + 1)) + min);
	},
	//returns random interval between defined min and max Dates shorter than maxIntervalSize(in ms),
	//if toLong = true returns [long, long] otherwise as timestamps 
	getRndTimeInterval: function(min, max, maxIntervalSize, toLong = false) {
		var start = this.getRndLongTime(min, max);
		start = this.getStartDate(start.getFullYear(), start.getMonth(), start.getDate());
		var finish = this.getRndLongTime(start, new Date(start.getTime() + maxIntervalSize));
		finish = this.setFinishDate(finish.getFullYear(), finish.getMonth(), finish.getDate());
		return [ (toLong) ? start.getTime() : start, (toLong) ? finish.getTime() : finish];
	},
	//returns interval as timestamp based on timestamps
	//input format: year; month/year or day/month/year (e.g. 4/27/2017)
	getIntervalFromTimeString: function(tStr) {
		var s = new Date();
		var f = new Date();
		var tArr = tStr.split("/");
		switch (tArr.length) {
			case 1:// year
				s = this.getStartDate(tArr[0]);
				f = this.getFinishWithLastDate(tArr[0]);
				break;
			case 2:// month/year
				s = this.getStartDate(tArr[1], m = tArr[0]);
				f = this.getFinishWithLastDate(tArr[1], m = tArr[0]);
			break;
			case 3:// day/month/year
				s = this.getStartDate(tArr[2], m = tArr[1], d = tArr[0]);
				f = this.getFinishWithLastDate(tArr[2], m = tArr[1], d = tArr[0]);
				break;
		}
		return [s, f];//[Date, Date]
	},
	//behaves like getIntervalFromTimeString, but returns interval in ms as [long, long]
	getLongTimeIntervalFromTimeString: function(tStr) {
		var tArr = this.getIntervalFromTimeString(tStr);
		return [ tArr[0].getTime(), tArr[1].getTime() ];
	} 
}
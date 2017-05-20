module.exports = {
	daysToMs: function(d) {
		const MS_IN_DAY = 86400000;
		return d * MS_IN_DAY;
	}
}
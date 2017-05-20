### **Description:**

Tool generates file with random spatial temporal tuples based on user defined parameters' values

### **Usage:**

`node generator.js --output="path\to\file.txt" --tuples=10 --lines=0 --latRange="-10,10" --lngRange="-10,10" --seg="10,10" --latOffset="-70,10000" --lngOffset="0,5000" --radius="1000,5000" --clIdRange="1,100" --minTime="1/1/2000" --maxTime="1/1/2017" --daysInterval=30 --withClusterId=true`

**Param**|**Description**
------------ | -------------
**--output**|name of the file save in
**--tuple**|number of rows to generate
**--lines**|specifies portion of `LineString`'s among all the generated rows (0..1)
**--latRange**|range of lattitde values where events will be generated
**--lngRange**|range of longitude values where events will be generated
**--radius**|range of uncertain radius
**--minTime**|left time boundary to generate start time for interval
**--maxTime**|right time boundary to generate start time for interval
**--daysInterval**|max size of generated interval in days
**--withClusterId**|it is needed to generate random cluster id for each tuple

Following params are useful in case if --lines param value is more then 0:

**Param**|**Description**
------------ | -------------
**--seg**|range of segments in each line
**--latOffset**|offset of lattitude range for each next line segment in meters
**--lngOffset**|offset of langitude range for each next line segment in meters

The following argument is useful in case if --withClusterId param is true:

**Param**|**Description**
------------ | -------------
**--clIdRange**|range for generating cluster ids

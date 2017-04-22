### **Usage:**

`node gen.js --output="path/to/file" --tuples=10 --lines=0.5 --latRange="-10,10" --lngRange="-10,10" --seg="10,10" --latOffset="-70,10000" --lngOffset="0,5000" --radius="1000,5000" --clIdRange="1,100"`

**Param**|**Description**
------------ | -------------
**--output**|name of the file save in
**--tuple**|number of rows to generate
**--lines**|specifies portion of lines among all the generated rows (0..1)
**--latRange**|range of lattitde values where events will be generated
**--lngRange**|range of longitude values where events will be generated

Following params are useful in case if --lines param value is more then 0:

**Param**|**Description**
------------ | -------------
**--seg**|range of segments in each line
**--latOffset**|offset of lattitude range for each next line segment in meters
**--lngOffset**|offset of langitude range for each next line segment in meters
**--clIdRange**|range for generating cluster ids

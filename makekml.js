const fs = require('fs');
var x = 0.1;
var y = 0.2;
// Example JSON data (typically fetched from an API)
const jsonData = {
  "locations": [

  ]
};

// const jsonData===????; //GIVE ME GIVE ME!

function applyoffset(point, center, angle) {
  const radian = (angle * Math.PI) / 180;
  const tempLat = point.latitude - center.latitude;
  const tempLng = point.longitude - center.longitude;
  const rotatedLat = tempLat * Math.cos(radian) - tempLng * Math.sin(radian);
  const rotatedLng = tempLat * Math.sin(radian) + tempLng * Math.cos(radian);
  return {
    latitude: rotatedLat + center.latitude,
    longitude: rotatedLng + center.longitude,
  };
}

// Function to convert JSON to KML
function jsonToKml(jsonData) {
  // let kmlData = `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">\n  <Document>\n`;
  let kmlData = `<?xml version="1.0" encoding="UTF-8"?>
    <kml xmlns="http://www.opengis.net/kml/2.2">
    <Document>
        <Style id="transBluePoly">
        <LineStyle>
            <width>1.5</width>
        </LineStyle>
        <PolyStyle>
            <color>00000000</color>
        </PolyStyle>
        </Style>\n`;

  // Loop through each location in the JSON data
  jsonData.locations.forEach(location => {
    const newcords1 = applyoffset({
      latitude: location.latitude + x,
      longitude: location.longitude + x,
    }, location, location.cog);
    const newcords2 = applyoffset({
      latitude: location.latitude + x,
      longitude: location.longitude - x,
    }, location, location.cog);
    const newcords3 = applyoffset({
      latitude: location.latitude - x,
      longitude: location.longitude - x,
    }, location, location.cog);
    const newcords4 = applyoffset({
      latitude: location.latitude - x,
      longitude: location.longitude + x,
    }, location, location.cog);
    const newcords5 = applyoffset({
      latitude: location.latitude,
      longitude: location.longitude + y,
    }, location, location.cog);

    kmlData += `    <Placemark>\n`;
    kmlData += `      <name>${location.id}</name>\n`;
    kmlData += `      <styleUrl>#transBluePoly</styleUrl>\n`;
    kmlData += `       <Polygon>
        <extrude>1</extrude>
            <altitudeMode>relativeToGround</altitudeMode>
            <outerBoundaryIs>
            <LinearRing>\n`;
    kmlData += `        <coordinates>\n`;
    // kmlData +=`         ${location.longitude+x},${location.latitude+x},100\n`;
    // kmlData +=`         ${location.longitude-x},${location.latitude+x},100\n`;
    // kmlData +=`         ${location.longitude-x},${location.latitude-x},100\n`;
    // kmlData +=`         ${location.longitude+x},${location.latitude-x},100\n`;
    // kmlData +=`         ${location.longitude+y},${location.latitude},100\n`;  
    // kmlData +=`         ${location.longitude+x},${location.latitude+x},100\n`; 
    kmlData += `         ${newcords1.longitude},${newcords1.latitude},100\n`;
    kmlData += `         ${newcords2.longitude},${newcords2.latitude},100\n`;
    kmlData += `         ${newcords3.longitude},${newcords3.latitude},100\n`;
    kmlData += `         ${newcords4.longitude},${newcords4.latitude},100\n`;
    kmlData += `         ${newcords5.longitude},${newcords5.latitude},100\n`;
    kmlData += `         ${newcords1.longitude},${newcords1.latitude},100\n`;
    kmlData += `          </coordinates>\n`;
    kmlData += `       </LinearRing>
          </outerBoundaryIs>
        </Polygon>
      </Placemark>\n`;
  });

  kmlData += `  </Document>\n</kml>`;

  return kmlData;
}


const kmlOutput = jsonToKml(jsonData);

console.log(kmlOutput);


fs.writeFileSync('output.kml', kmlOutput);
console.log('KML file has been saved as output.kml');

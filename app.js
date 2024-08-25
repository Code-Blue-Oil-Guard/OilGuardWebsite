
//import 
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push, child, get } from "firebase/database";

import WebSocket from 'ws';
const socket = new WebSocket("wss://stream.aisstream.io/v0/stream");
import fs from 'fs';


FirebaseApiKey = process.env.ApiKey;

//firebase configuration 
const firebaseConfig = {
    // apiKey: "AIzaSyDZ7HbtLbglNvtP9k5e2Z-TuWzT22Jss-0",
    apiKey: ApiKey,
    authDomain: "oilguard.firebaseapp.com",
    projectId: "oilguard",
    storageBucket: "oilguard.appspot.com",
    messagingSenderId: "109394563647",
    appId: "1:109394563647:web:a8455c796006028121de8a",
    databaseURL: "https://oilguard-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase();


// Deleting the entire collection
// const postsRef = ref(database, 'vesseldata');

// // Create a new post reference with an auto-generated id
// set(postsRef, null)
//     .then(() => {
//         console.log("The 'posts' collection has been cleared.");
//     })
//     .catch((error) => {
//         console.error("Error clearing the 'posts' collection: ", error);
//     });


SocketApi = process.env.SocketApi;
//websocket server connection
socket.onopen = function (_) {
    let subscriptionMessage = {
        APIKey: SocketApi,
        BoundingBoxes: [[[18, -98], [30, -81]]]


    }
    socket.send(JSON.stringify(subscriptionMessage));
};



// fetching response of WebSocket and saving it to firebase
// socket.onmessage = function (event) {
//     let aisMessage = JSON.parse(event.data);
//     function writeUserData(aisMessagel, userId) {
//         set(ref(database, 'vesseldata/' + userId), {
//             Message: aisMessage.Message,
//             MessageType: aisMessage.MessageType,
//             MetaData: aisMessage.MetaData
//         });
//     }
//     var userId = aisMessage.MetaData.MMSI;
//     writeUserData(aisMessage, userId);
//     console.log(aisMessage.Message);
// };



const VesseldataRef = ref(database, 'vesseldata');




const dataArray = [];
const dataArray2 = [];
let shouldBreak = false;
// Function to read all data from a collection and convert it to an array
async function fetchDataToArray(dataArray2) {
    try {
        // Fetch data from the 'posts' node
        const snapshot = await get(VesseldataRef);

        if (snapshot.exists()) {
            // Initialize an empty array to store the data


            // Iterate over each child in the snapshot
            snapshot.forEach((childSnapshot) => {
                if (shouldBreak) return;
                const id = childSnapshot.key;
                const data = childSnapshot.val();
                const data2 = { ...data };
                const name = data2.MetaData.MMSI;
                const longitude = data2.MetaData.longitude;
                const latitude = data2.MetaData.latitude;
                var cog = 10;
                if (data2.MessageType == "PositionReport") {
                    cog = data2.Message.PositionReport.Cog;
                }
                // const cog = data2.Message.PositionReport.Cog;
                const obj = {
                    id: id,                // Key is a string
                    longitude: longitude,  // Ensure this is the desired format
                    latitude: latitude,  // Ensure this is the desired format
                    cog: cog
                };
                dataArray2.push(obj);
                dataArray.push({ id: childSnapshot.key, ...childSnapshot.val() });
                if (dataArray.length >= 2000) {
                    // console.log("5 ho gye!!!!!!!!!!!!!!!!!!");
                    shouldBreak = true; // Set the flag to break loop
                    return dataArray2;
                }
                // return;
            });
            // console.log("Data converted to array:");
            return dataArray2; // Return the array
        } else {
            console.log("No data available at the 'posts' node.");
            return [];
        }
    } catch (error) {
        console.error("Error fetching data: ", error);
        return [];
    }
}


const arr = [];

// const help=[];
// Call the function to read data and convert it to an array
fetchDataToArray(dataArray2).then((result) => {
    result.forEach((obj) => {
        arr.push(obj);
    })
    // const fs = require('fs');

    var x = 0.1;
    var y = 0.2;
    // Example JSON data (typically fetched from an API)
    const jsonData = {
        "locations": arr
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
            <color>ffffffff</color>
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

});



























// // async function fetchDataToArray() {
// //     try {
// //         const snapshot = await get(VesseldataRef);
// //         if (snapshot.exists()) {
// //             snapshot.forEach((childSnapshot) => {
// //                 if (shouldBreak) return;
// //                 const id = childSnapshot.key;
// //                 const data = { ...childSnapshot.val() };
// //                 const data2 = { ...data };
// //                 const name = data.MetaData.MMSI;
// //                 const longitude = data.MetaData.longitude;
// //                 const latitude = data.MetaData.latitude;
// //                 const obj = {
// //                     "id": id,                // Key is a string
// //                     "longitude": longitude,  // Ensure this is the desired format
// //                     "latitude": latitude     // Ensure this is the desired format
// //                 };
// //                 dataArray2.push(obj);
// //                 if (dataArray2.length >= 50) {
// //                     shouldBreak = true; // Set the flag to break loop
// //                     return dataArray2;
// //                 }
// //             });
// //             return dataArray2;
// //         } else {
// //             console.log("No data available at the 'posts' node.");
// //             return [];
// //         }
// //     } catch (error) {
// //         console.error("Error fetching data: ", error);
// //         return [];
// //     }
// // }

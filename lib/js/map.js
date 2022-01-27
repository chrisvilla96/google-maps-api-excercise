let map, userMarker, geoLocation, request, service, getNextPage;
// let currentPosition = { lat: 19.3508682, lng: -99.1345574 };
let currentPosition = {};
let distanceAndDuration = { distance: "", duration: "", };
let nearByPlacesRequest = { location: currentPosition, radius: 1000, type: ["restaurant"] };

const infoRequest = {
  location: currentPosition,
  fields: ["name", "formatted_address", "place_id", "geometry"],
};

let restaurantMarkers = [];

let positions = [
  { lat: 19.3516, lng: -99.16827 },
  { lat: 19.389864, lng: -99.155589 },
  { lat: 19.358835, lng: -99.186978 },
  { lat: 19.407292, lng: -99.163770 },
]

let positionCount = 0;

function initMap() {
  /* Creates the Map */
  map = new google.maps.Map(document.getElementById("map"), {
    center: currentPosition,
    zoom: 14.8,
  });

  /* Sets a marker in user position */
  userMarker = new google.maps.Marker({
    position: currentPosition,
    map,
  });

  activatePosition();


  /* Create the places service*/
  service = new google.maps.places.PlacesService(map);

  const moreButton = document.querySelector("#more");
  moreButton.onclick = function () {
    moreButton.disabled = true;
    if (getNextPage) {
      getNextPage();
    }
  };

  // Enables a Nearby Search Service.
  // service.nearbySearch(nearByPlacesRequest, placesCallback);

  /*   const distanceService = new google.maps.DistanceMatrixService();
   */

  /*  service.getDetails(infoRequest, (place, status) => {
     if (
       status === google.maps.places.PlacesServiceStatus.OK &&
       place &&
       place.geometry &&
       place.geometry.location
     ) {
       const marker = new google.maps.Marker({
         map,
         position: place.geometry.location,
       });
 
       google.maps.event.addListener(marker, "click", () => {
         const content = document.createElement("div");
         const nameElement = document.createElement("h2");
 
         nameElement.textContent = place.name;
         content.appendChild(nameElement);
 
         const placeIdElement = document.createElement("p");
 
         placeIdElement.textContent = place.place_id;
         content.appendChild(placeIdElement);
 
         const placeAddressElement = document.createElement("p");
 
         placeAddressElement.textContent = place.formatted_address;
         content.appendChild(placeAddressElement);
         infowindow.setContent(content);
         infowindow.open(map, marker);
       });
     }
   }); */
}


const deletePlacesButton = document.querySelector("#deletePlaces");
deletePlacesButton.addEventListener("click", () => {
  deletePlaces(restaurantMarkers);
})


const changePositionButton = document.querySelector("#changePosition");

changePositionButton.addEventListener("click", () => {
  if (positionCount < positions.length) {
    deletePlaces(restaurantMarkers);
    let newPosition = positions[positionCount];
    updateLocationAndPlaces(newPosition);
    positionCount++;
  }
  else {
    positionCount = 0;
    deletePlaces(restaurantMarkers);
    let newPosition = positions[positionCount];
    updateLocationAndPlaces(newPosition);
  }
})

/* Change Radio Buttons */
const changeRadioButton1 = document.querySelector("#changeRadio1");
const changeRadioButton2 = document.querySelector("#changeRadio2");
const changeRadioButton3 = document.querySelector("#changeRadio3");

changeRadioButton1.addEventListener("click", () => {
  deletePlaces(restaurantMarkers);
  changeRadiusRequest(500, 15);
})

changeRadioButton2.addEventListener("click", () => {
  deletePlaces(restaurantMarkers);
  changeRadiusRequest(1500, 14.5);
})

changeRadioButton3.addEventListener("click", () => {
  deletePlaces(restaurantMarkers);
  changeRadiusRequest(3000, 14);
})


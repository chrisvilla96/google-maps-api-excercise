/* All Functions Needed for Google Maps Implementation */


/**
 *  Activates Navigator Geolocation
 */
const activatePosition = () => {
  if (navigator.geolocation) {
    /*  For tracking location
    let options = { timeout: 150000, };
    let options = {}; */
    geoLocation = navigator.geolocation;
    // watchID = geoLocation.watchPosition(showMapLocation, errorHandler, options); 
    navigator.geolocation.getCurrentPosition(showMapLocation, errorHandler);
  }
  else {
    alert("Favor de activar la ubicación para más detalle");
  }
}

/* Error Handler for  Retrieving Location*/
const errorHandler = (error) => {
  if (error.code == 1) {
    alert("Favor de activar la ubicación para más detalle");
    location.reload();
  }
  else if (error.code == 2) {
    alert("No se encuentra tu posición");
  }
}

/* Sets Current User Position */
const showMapLocation = (position) => {

  let currentPosition = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  }

  // Updates Map with new Location
  userMarker.setPosition(currentPosition);
  map.setCenter(currentPosition);

  // Creates the NearByPlaces Request
  const nearByPlacesRequest = { location: currentPosition, radius: 1000, type: ["restaurant"] };
  service.nearbySearch(nearByPlacesRequest, placesCallback);
}

/**
 * If Location Changes, Updates Location
 * @param {Object} currentPosition 
 * @param {Objetct} newPosition 
 * @param {Object} placesRequest 
 */
const updateLocationAndPlaces = (newPosition) => {
  let currentPosition = {
    lat: newPosition.lat,
    lng: newPosition.lng,
  }

  userMarker.setPosition(currentPosition);
  map.setCenter(currentPosition);

  // Creates the NearByPlaces Request
  const nearByPlacesRequest = { location: currentPosition, radius: 1000, type: ["restaurant"] };
  service.nearbySearch(nearByPlacesRequest, placesCallback);
}


/**
 * Callback for Handling Nearby Places Requets
 * @param {Array.<Object>} results 
 * @param {*} status 
 * @param {*} pagination 
 * @returns 
 */
const placesCallback = (results, status, pagination) => {
  console.log("Places Call Back", results);
  if (status !== "OK" || !results) return;

  addPlaces(results, map);
  moreButton.disabled = !pagination || !pagination.hasNextPage;
  if (pagination && pagination.hasNextPage) {
    getNextPage = () => {
      // Note: nextPage will call the same handler function as the initial call
      pagination.nextPage();
    };
  }
}

/* Callback for Handling Place Detail Request */
const placeDetailCallback = (place, status) => {
  if (
    status === google.maps.places.PlacesServiceStatus.OK &&
    place &&
    place.geometry &&
    place.geometry.location
  ) {
    console.log("Place Detail Result", place);
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

}

/**
 * Add Requested Places to Map List and Map Icons
 * @param {Array.<Object>} places
 * @param {Map} map
 */
const addPlaces = (places, map) => {
  const placesList = document.getElementById("places");

  console.log("Restaurants", places);

  places.map(place => {
    if (place.geometry && place.geometry.location) {
      const image = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25),
      };

      /* Creates the Restaurant Marker */
      const restaurantMarker = new google.maps.Marker({
        map,
        icon: image,
        title: place.name,
        position: place.geometry.location,
      })

      /* Creates the Marker in Map and Appends Marker to List */
      restaurantMarkers.push(restaurantMarker);

      /* Creates the Marker Listener to Display Info on Click */
      restaurantMarker.addListener("click", () => {
        const infoRequest = {
          placeId: place.place_id,
          fields: ["name", "formatted_address", "place_id", "geometry"],
        };

        const infowindow = new google.maps.InfoWindow();



        service.getDetails(infoRequest, (place, status) => {


          calculateDistance(currentPosition, place);

          /* Creates div Element to Display info */
          const content = document.createElement("div");
          const nameElement = document.createElement("h3");

          nameElement.textContent = place.name;
          content.appendChild(nameElement);

          const placeIdElement = document.createElement("p");
          placeIdElement.setAttribute('id', 'distance');

          content.appendChild(placeIdElement);

          const placeAddressElement = document.createElement("p");

          placeAddressElement.textContent = place.formatted_address;
          content.appendChild(placeAddressElement);
          infowindow.setContent(content);
          infowindow.open(map, restaurantMarker);
        });

      })


      const li = document.createElement("li");

      li.textContent = place.name;
      placesList.appendChild(li);
      li.addEventListener("click", () => {
        map.setCenter(place.geometry.location);
      });
    }
  });
}

/* Detele Places and Markers in html list and in map  */
const deletePlaces = (markers) => {
  const placesList = document.getElementById("places");

  // Deletes all html Places elements  
  while (placesList.firstChild) {
    placesList.removeChild(placesList.lastChild);
  }

  // Delete all elements in markers list
  markers.map(marker => {
    marker.setMap(null);
  });
}

/**
 * Change Requested Radius for Nearby Places Request
 * @param {number} radioSize 
 * @param {number} zoom 
 */
const changeRadiusRequest = (radioSize, zoom) => {
  nearByPlacesRequest["radius"] = radioSize;
  service.nearbySearch(nearByPlacesRequest, placesCallback);
  map.setZoom(zoom);
}


const calculateDistance = (origin, destination) => {

  let placeDestination = destination.geometry.location

  const distanceRequest = {
    origins: [origin],
    destinations: [placeDestination],
    travelMode: google.maps.TravelMode.DRIVING,
    unitSystem: google.maps.UnitSystem.metric,
    avoidHighways: false,
    avoidTolls: false
  }


  const distanceService = new google.maps.DistanceMatrixService();

  distanceService.getDistanceMatrix(distanceRequest, distanceCallback);
}

const distanceCallback = (response, status) => {
  if (status == "OK") {
    let distancia = response.rows[0].elements[0].distance.text;
    let texto = "Ubicado a ";
    document.getElementById("distance").innerHTML = texto + distancia;
    console.log("Elemento Actualizado", elemento);
    console.log("Sí pasó por aquí", distanceAndDuration);
  }
}


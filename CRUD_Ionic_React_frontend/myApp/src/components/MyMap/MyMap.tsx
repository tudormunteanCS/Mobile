import { GoogleMap } from '@capacitor/google-maps';
import { useEffect, useRef } from 'react';
import { mapsApiKey } from '../../APIs/mapsApiKey';

interface MyMapProps {
    lat: number;
    lng: number;
    onMapClick: (lat: number, lng: number) => void;
    onMarkerClick: (e: any) => void,
    
}

const MyMap: React.FC<MyMapProps> = ({ lat, lng, onMapClick, onMarkerClick }) => {
    const mapRef = useRef<HTMLElement>(null);
    useEffect(myMapEffect, [mapRef.current])

    let markerIds: string[] = [];

    return (
      <div className="component-wrapper">
        <capacitor-google-map ref={mapRef} style={{
          display: 'block',
          width: 300,
          height: 400
        }}></capacitor-google-map>
      </div>
    );
  
    function myMapEffect() {
      let canceled = false;
      let googleMap: GoogleMap | null = null;
      
      createMap();
      return () => {
        canceled = true;
        googleMap?.removeAllMapListeners();
      }
  
      async function createMap() {
        if (!mapRef.current) {
          return;
        }
        googleMap = await GoogleMap.create({
          id: 'my-cool-map',
          element: mapRef.current,
          apiKey: mapsApiKey,
          config: {
            center: { lat, lng },
            zoom: 8
          }
          
        })
        console.log('gm created');
        // const myLocationMarkerId = await googleMap.addMarker({ coordinate: { lat, lng }, title: 'My location' });
        // if(googleMap){
        //   await googleMap.setOnMapClickListener(({ latitude, longitude }) => {
        //     onMapClick(latitude,longitude);
        //     if (!canceled) {
        //       markerIds.forEach((markerId) => {
        //         googleMap?.removeMarker(markerId);
        //       });
        //       markerIds = [];
        //       const myLocationMarkerId = googleMap?.addMarker({ coordinate: { lat: latitude, lng: longitude }, title: 'My location' });
        //       if (myLocationMarkerId) {
        //         markerIds.push(myLocationMarkerId);
        //       }
              
        //     }
            
        //   });
        //   await googleMap.setOnMarkerClickListener(({ markerId, latitude, longitude }) => {
        //     onMarkerClick({ markerId, latitude, longitude });
        //   });
        // }
        if (googleMap) {
          googleMap
                  ?.addMarker({
                    coordinate: { lat: lat, lng: lng },
                    title: 'My location',
                  }).then((myLocationMarkerId) => {
                    if (myLocationMarkerId) {
                      markerIds.push(myLocationMarkerId);
                    } else {
                      console.error("Failed to add marker.");
                    }
                  })
          


          await googleMap.setOnMapClickListener(({ latitude, longitude }) => {
            try{
              onMapClick(latitude, longitude);
              if (!canceled) {
                // Remove all previous markers
                Promise.all(
                  markerIds.map((markerId) => googleMap?.removeMarker(markerId).catch((err) => console.error(err)))
                ).then(() => {
                  markerIds = [];
          
                  // Add the new marker
                  googleMap
                    ?.addMarker({
                      coordinate: { lat: latitude, lng: longitude },
                      title: 'My location',
                    })
                    .then((myLocationMarkerId) => {
                      if (myLocationMarkerId) {
                        markerIds.push(myLocationMarkerId);
                      } else {
                        console.error("Failed to add marker.");
                      }
                    })
                    .catch((err) => console.error("Error adding marker:", err));
                });
              }
            }
            catch (Error){
              console.log(Error)
            }
            
            
        
            
          });
        }
        
      }
    }
  }
  
  export default MyMap;

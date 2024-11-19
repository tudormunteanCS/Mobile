import React, { useContext, useEffect, useState } from 'react';
import {
  IonButton,
  IonFab,
  IonFabButton,
  IonIcon,
  IonActionSheet,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonGrid,
  IonLoading,
  IonRow,
  IonCol,
  IonImg,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { camera, close, logoXing, trash } from 'ionicons/icons';
import { getLogger } from '../core';
import { EmployeeContext } from '../components/EmployeeProvider/employeeProvider';
import { RouteComponentProps } from 'react-router';
import { EmployeeProps } from '../utils/EmployeeProps';
import { useNetwork } from '../utils/useNetwork';
import { usePreferences } from '../utils/usePreferences';
import { MyPhoto, usePhotos } from '../utils/usePhotos';
import { useMyLocation } from '../utils/useMyLocation';
import MyMap from '../components/MyMap/MyMap';

const log = getLogger('EmployeeEdit');

interface EmployeeEditProps extends RouteComponentProps<{
  id?: string;
}> {}

const EmployeeEdit: React.FC<EmployeeEditProps> = ({ history, match }) => {
  const { employees, saving, savingError, saveEmployee } = useContext(EmployeeContext);
  
  const [role, setRole] = useState('');
  const[firstName,setFirstName] = useState('')
  const[lastName,setLastName] = useState('')
  const[email,setEmail] = useState('')
  const [employee, setEmployee] = useState<EmployeeProps>();
  const { networkStatus } = useNetwork();
  const {saveOfflineAction} = usePreferences()

  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();

  useEffect(() => {
    log('useEffect');
    const routeId = match.params.id || '';
    const employee = employees?.find(it => it._id === routeId);
    setEmployee(employee);
    if (employee) {
      // log('setting' + 'lat: ' + employee.lat + '  long: ' + lng)
      setRole(employee.role);
      setLat(employee.lat)
      setLng(employee.lng)
      setFirstName(employee.firstName || '');
      setLastName(employee.lastName || '');
      setEmail(employee.email || '');
    }
  }, [match.params.id, employees]);

  



  const myLocation = useMyLocation();
  console.log(employee)
  // const { latitude: lat, longitude: lng } = myLocation.position?.coords || {latitude: employee?.lat, longitude: employee?.lng}

  const handleSave = async () => {
    // log('before saving ' + 'lat: ' + lat + '  long: ' + lng)
    const hiringDate = new Date().toISOString().slice(0, 10);
      const updatedEmployee = {
        ...employee,   // Spread existing employee properties (for `_id` and any other fields)
        firstName,
        lastName,
        email,
        role,
        hiringDate,
        lat,
        lng
      };
      log(employee)
    if(!networkStatus.connected){
        // log('must save in pref')
        await saveOfflineAction(updatedEmployee);
        history.goBack()
    }
    else{
      // log('Must save and go back in history')
      
      // Call saveEmployee and navigate back after save
      saveEmployee && saveEmployee(updatedEmployee).then(() => {
        history.goBack();
      }).catch(err => log('Save failed', err));
    }
  };
  log('render');


  const { photos, takePhoto, deletePhoto } = usePhotos();
  const [photoToDelete, setPhotoToDelete] = useState<MyPhoto>();

  const currentId = match.params.id;

  


  const handleMapClicked = (lat: number,lng:number) =>{
    log('clicked lat is: ' + lat )
    log('clicked long is: ' + lng )
    setLat(lat)
    setLng(lng)
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSave}>
              Save
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonInput label = {'First Name: '} value={firstName} onIonChange={e => setFirstName(e.detail.value || '')} />
        <IonInput label = {'Last Name: '} value={lastName} onIonChange={e => setLastName(e.detail.value || '')} />
        <IonInput label = {'Role: '} value={role} onIonChange={e => setRole(e.detail.value || '')} />
        <IonInput label = {'Email: '} value={email} onIonChange={e => setEmail(e.detail.value || '')} />
        <IonLoading isOpen={saving} />
        {savingError && (
          <div>{savingError.message || 'Failed to save employee'}</div>
        )}
      </IonContent>
      <IonContent>
      <IonGrid>
        {lat && lng &&
          <MyMap
            lat={lat}
            lng={lng}
            onMapClick={(lat, lng) => handleMapClicked(lat,lng)}
            onMarkerClick={() => log('onMarker')}
          />}
          <IonRow>       
          {photos
            .filter(photo => {
              const userIdFromPath = photo.filepath.split('_')[0]; // Split and get the first part
              return userIdFromPath === currentId; // Compare with currentId
            })
            .map((photo, index) => (
              <IonCol size="6" key={index}>
                <IonImg 
                  onClick={() => setPhotoToDelete(photo)}
                  src={photo.webviewPath}
                />
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
        <IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton onClick={() => takePhoto(currentId)}>
            <IonIcon icon={camera}/>
          </IonFabButton>
          <IonActionSheet
          isOpen={!!photoToDelete}
          buttons={[{
            text: 'Delete',
            role: 'destructive',
            icon: trash,
            handler: () => {
              if (photoToDelete) {
                deletePhoto(photoToDelete);
                setPhotoToDelete(undefined);
              }
            }
          }, {
            text: 'Cancel',
            icon: close,
            role: 'cancel'
          }]}
          onDidDismiss={() => setPhotoToDelete(undefined)}
        />
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default EmployeeEdit;

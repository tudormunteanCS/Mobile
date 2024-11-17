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
import { camera, close, trash } from 'ionicons/icons';
import { getLogger } from '../core';
import { EmployeeContext } from '../components/EmployeeProvider/employeeProvider';
import { RouteComponentProps } from 'react-router';
import { EmployeeProps } from '../utils/EmployeeProps';
import { useNetwork } from '../utils/useNetwork';
import { usePreferences } from '../utils/usePreferences';
import { MyPhoto, usePhotos } from '../utils/usePhotos';

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


  useEffect(() => {
    log('useEffect');
    const routeId = match.params.id || '';
    const employee = employees?.find(it => it._id === routeId);
    setEmployee(employee);
    if (employee) {
      setRole(employee.role);
      setFirstName(employee.firstName || '');
      setLastName(employee.lastName || '');
      setEmail(employee.email || '');
    }
  }, [match.params.id, employees]);

  


  const handleSave = async () => {
    const hiringDate = new Date().toISOString().slice(0, 10);
      const updatedEmployee = {
        ...employee,   // Spread existing employee properties (for `_id` and any other fields)
        firstName,
        lastName,
        email,
        role,
        hiringDate,
      };
    if(!networkStatus.connected){
        log('must save in pref')
        await saveOfflineAction(updatedEmployee);
        history.goBack()
    }
    else{
      log('Must save and go back in history')
      
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
          <IonRow>       
  `    {photos
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
        ))}`
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

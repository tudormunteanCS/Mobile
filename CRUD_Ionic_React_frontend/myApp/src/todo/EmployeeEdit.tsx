import React, { useContext, useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { getLogger } from '../core';
import { EmployeeContext } from '../components/EmployeeProvider/employeeProvider';
import { RouteComponentProps } from 'react-router';
import { EmployeeProps } from '../utils/EmployeeProps';
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
  const handleSave = () => {
    log('Must save and go back in history')
    //build a new employee with firstName,lastName, email, role, hiringDate in this order 
    // Build the employee object with updated values
    const hiringDate = new Date().toISOString().slice(0, 10);
    const updatedEmployee = {
      ...employee,   // Spread existing employee properties (for `_id` and any other fields)
      firstName,
      lastName,
      email,
      role,
      hiringDate,
    };

    // Call saveEmployee and navigate back after save
    saveEmployee && saveEmployee(updatedEmployee).then(() => {
      history.goBack();
    }).catch(err => log('Save failed', err));
  };
  log('render');
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
    </IonPage>
  );
};

export default EmployeeEdit;

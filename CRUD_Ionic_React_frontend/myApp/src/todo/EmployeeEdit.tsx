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
  const [email, setEmail] = useState('');
  const [employee, setEmployee] = useState<EmployeeProps>();
  useEffect(() => {
    log('useEffect');
    const routeId = match.params.id || '';
    const employee = employees?.find(it => it._id === routeId);
    setEmployee(employee);
    if (employee) {
        setEmail(employee.email);
    }
  }, [match.params.id, employees]);
  const handleSave = () => {
    log('SAVE IS NOT IMPLEMENTED COME TO EmployeeEdit')
    // const editedEmployee = employee ? { ...employee, email } : { email };
    // saveEmployee && saveEmployee(editedEmployee).then(() => history.goBack());
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
        <div>
            not implemented!!
        </div>
        {/* <IonInput value={text} onIonChange={e => setText(e.detail.value || '')} />
        <IonLoading isOpen={saving} />
        {savingError && (
          <div>{savingError.message || 'Failed to save employee'}</div>
        )} */}
      </IonContent>
    </IonPage>
  );
};

export default EmployeeEdit;

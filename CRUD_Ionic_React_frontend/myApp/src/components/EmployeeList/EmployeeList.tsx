import { RouteComponentProps } from 'react-router';
import React, { useContext}from "react";
import Employee from "../Employee/Employee";
import { add } from 'ionicons/icons';
import { getLogger } from '../../core';
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonList, IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import "./EmployeeList.css"
import { EmployeeContext } from '../EmployeeProvider/employeeProvider';

const log = getLogger('ItemList');

const EmployeeList: React.FC<RouteComponentProps> = ({ history }) =>{
    const { employees, fetching, fetchingError } = useContext(EmployeeContext);
    log('render', fetching);
      
    return(
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>My App</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message={"Fetching employees"}/>
                {employees && (
                        <div className="employees_list">
                            {employees.map(({_id,firstName,lastName,email,role,hiringDate}) => <Employee key={_id} _id={_id} firstName={firstName} lastName={lastName} email={email} role={role} hiringDate={hiringDate} onEdit={id => history.push(`/employee/${id}`)}/>)}
                        </div>
                    )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch items'}</div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/item')}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    )
};


export default EmployeeList
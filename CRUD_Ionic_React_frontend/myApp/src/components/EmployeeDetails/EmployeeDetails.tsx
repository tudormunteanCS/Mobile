import { RouteComponentProps } from 'react-router-dom';
import { useState, useEffect, useCallback  } from 'react'
import { EmployeeProps } from '../../utils/EmployeeProps';
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
import { useEmployeeById } from '../../utils/useEmployeesFetch';

interface EmployeeDetailProps extends RouteComponentProps<{
    id:string;
}>{}



const EmployeeDetails: React.FC<EmployeeDetailProps> = ({ history, match}) => {
    
    const id = match.params.id
    const {employee, fetching , fetchingError} = useEmployeeById(id);
    console.log(employee)
    useCallback(() => console.log("render EmployeeDetails"),[id])
    
    return (
    <IonPage>
        <div>
            <h1>Employee Details</h1>
            <p>Must fetch from server!</p>
            <p>Email: {employee?.email} </p>
            <p>Role:  {employee?.role} </p>
        </div>
    </IonPage>
    )
}

export default EmployeeDetails
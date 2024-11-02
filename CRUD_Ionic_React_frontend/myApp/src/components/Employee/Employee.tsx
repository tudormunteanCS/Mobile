import { EmployeeProps } from "../../utils/EmployeeProps";
import React, { memo, } from 'react';
import { IonLabel } from "@ionic/react";
import "./Employee.css"

interface EmployeePropsExt extends EmployeeProps {
    onEdit: (_id?: string) => void;
  }
const Employee: React.FC<EmployeePropsExt> = ({_id,firstName,lastName,email,role,hiringDate,onEdit}) =>{
    return (
        <div className="employee_member" onClick={()=>onEdit(_id)}>
            <IonLabel>{firstName + ' '}  {lastName}</IonLabel>
            <IonLabel>{'Email: ' + email}</IonLabel>
            <IonLabel>{'Role: ' + role}</IonLabel>
            <IonLabel>{'Hiring date: ' + hiringDate}</IonLabel>
        </div>
    )
}
export default memo(Employee);
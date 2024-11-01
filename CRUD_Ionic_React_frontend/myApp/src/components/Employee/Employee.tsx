import { EmployeeProps } from "../../utils/EmployeeProps";
import React, { memo, } from 'react';
import "./Employee.css"
// import { useHistory } from "react-router";

interface EmployeePropsExt extends EmployeeProps {
    onEdit: (id?: string) => void;
  }
const Employee: React.FC<EmployeePropsExt> = ({id,full_name,onEdit}) =>{
    return (
        <div className="employee_member" onClick={()=>onEdit(id)}>
            {full_name}
        </div>
    )
}
export default memo(Employee);
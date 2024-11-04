import { RouteComponentProps } from 'react-router';
import React, { useContext, useEffect }from "react";
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
import { usePreferences } from '../../utils/usePreferences';
import { AuthContext } from '../../auth/AuthProvider';
import { useNetwork } from '../../utils/useNetwork';
import { EmployeeProps } from '../../utils/EmployeeProps';


const log = getLogger('ItemList');

const EmployeeList: React.FC<RouteComponentProps> = ({ history }) =>{
    const { employees, fetching, fetchingError, saveEmployee} = useContext(EmployeeContext);
    const { logout } = useContext(AuthContext)
    const { networkStatus } = useNetwork();
    const { getOfflineActions , clearOfflineActions } = usePreferences();
    
    useEffect(() => {
        if (networkStatus.connected) {
          log('Network is online, processing offline actions');
    
          const processOfflineActions = async () => {
            const storedActions = await getOfflineActions();
            log(storedActions)
            if (storedActions) {
               
    
              for (const action of storedActions) {
                try {
                  // Assuming action is the updatedEmployee format
                  if(saveEmployee)
                    saveEmployee(action)
                  log(`Successfully saved employee: ${action.firstName} ${action.lastName}`);
                } catch (error) {
                  log(`Failed to save employee: ${error}`);
                }
              }
    
              // Clear offline actions after processing
              await clearOfflineActions()
              log('Cleared offline actions after processing');
            }
          };
    
          processOfflineActions();
        }
      }, [networkStatus.connected]); // Run this effect when the network status changes


    const handleLogout = async () => {
        // Remove the user token from preferences
        log('logging out')
        if(logout)
            await logout()
        
        // Redirect to the login page
        history.push('/login');

    };
    log('render', fetching);
    return(
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Employees</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                {/* <IonLoading isOpen={fetching} message={"Fetching employees"}/> */}
                {employees && (
                        <div className="employees_list">
                            {employees.map(({_id,firstName,lastName,email,role,hiringDate}) =>
                                 <Employee key={_id} _id={_id} firstName={firstName} lastName={lastName} email={email} role={role} hiringDate={hiringDate} onEdit={id => history.push(`/employee/${id}`)}/>)}
                        </div>
                    )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch items'}</div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/employee')}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                    <IonFabButton color='danger' onClick={handleLogout}>
                        Log out
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    )
};


export default EmployeeList
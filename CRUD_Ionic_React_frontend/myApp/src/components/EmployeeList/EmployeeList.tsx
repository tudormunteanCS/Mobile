import { RouteComponentProps } from 'react-router';
import React, { useContext, useEffect, useState }from "react";
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
    IonToolbar,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSelect,
    IonSelectOption,
    IonButton
} from '@ionic/react';
import "./EmployeeList.css"
import { EmployeeContext } from '../EmployeeProvider/employeeProvider';
import { usePreferences } from '../../utils/usePreferences';
import { AuthContext } from '../../auth/AuthProvider';
import { useNetwork } from '../../utils/useNetwork';
import { EmployeeProps } from '../../utils/EmployeeProps';


const log = getLogger('EmployeeList');



const EmployeeList: React.FC<RouteComponentProps> = ({ history }) =>{
    const { employees, fetching, fetchingError, saveEmployee} = useContext(EmployeeContext);
    const { logout } = useContext(AuthContext)
    const { networkStatus } = useNetwork();
    const { getOfflineActions , clearOfflineActions } = usePreferences();
    const [currentPage, setCurrentPage] = useState(1); // Starting with the first page
    const pageSize = 5; // Number of employees to fetch per request
    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
    const [displayedEmployees, setDisplayedEmployees] = useState<EmployeeProps[]>([]);
    const [selectedRole, setSelectedRole] = useState<string | undefined>(undefined);
    const uniqueRoles = Array.from(new Set(employees?.map(employee => employee.role)));
    

    useEffect(() => {
        // Function to load employees for the current page
        const loadEmployees = () => {
            if (employees) {
                const filteredEmployees = selectedRole ? employees.filter(employee => employee.role === selectedRole) : employees
                
                const startIndex = (currentPage - 1) * pageSize;
                const endIndex = startIndex + pageSize;
                const newEmployees = filteredEmployees.slice(startIndex, endIndex);
                setDisplayedEmployees(prev => [...prev, ...newEmployees]);
                // Disable infinite scroll if less than pageSize employees are returned
                setDisableInfiniteScroll(newEmployees.length < pageSize);
            }
        };

        loadEmployees();
    }, [currentPage, employees, selectedRole]); // Re-run when currentPage or employees change


    // Handle infinite scroll event
    const loadMoreEmployees = (event: CustomEvent<void>) => {
        setCurrentPage(prev => prev + 1);
        setTimeout(() => {
            (event.target as HTMLIonInfiniteScrollElement).complete();
        }, 100); // Simulate loading time
    };

    const handleRoleChange = (event: CustomEvent)=> {
        setSelectedRole(event.detail.value)
        setCurrentPage(1)
        setDisplayedEmployees([])
        
    }

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

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAnimationClicked = () => {
        setIsModalOpen(true); // Open the modal
    };

    const handleCloseModal = (e: Event) => {
        // Check if the click is outside the modal content
        setIsModalOpen(false);
    };
    if(employees)
        log(employees)
    return(
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Employees</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonSelect placeholder="Select Role" onIonChange={handleRoleChange}>
                    {uniqueRoles.map((role, index) => (
                        <IonSelectOption key={index} value={role}>
                            {role}
                        </IonSelectOption>
                    ))}
                </IonSelect>
                {employees && (
                <div className="employees_list">
                    {employees.map(({ _id, firstName, lastName, email, role, hiringDate,lat,lng }) => (
                    <Employee
                        key={_id}
                        _id={_id}
                        firstName={firstName}
                        lastName={lastName}
                        email={email}
                        role={role}
                        hiringDate={hiringDate}
                        lat={lat}
                        lng ={lng}
                        onEdit={id => history.push(`/employee/${id}`)}
                    />
                    ))}
                </div>
                )}
                <div className={`modal ${isModalOpen ? 'show' : ''}`} onClick={handleCloseModal}>
                    <div className="modal-content">
                        <h2>Information</h2>
                        <p>This is a simple modal with expanding animation.</p>
                    </div>
                </div>
                <IonFab vertical="bottom" horizontal="center" slot="fixed">
                    <IonButton onClick={handleAnimationClicked}>Animation</IonButton>
                </IonFab>
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch items'}</div>
                )}
                <IonInfiniteScroll threshold="100px" disabled={disableInfiniteScroll} onIonInfinite={loadMoreEmployees}>
                    <IonInfiniteScrollContent loadingText="Loading more employees..." />
                </IonInfiniteScroll>
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
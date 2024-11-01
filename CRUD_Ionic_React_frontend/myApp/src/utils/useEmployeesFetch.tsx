import { EmployeeProps } from "./EmployeeProps";
import { useState,useCallback, useEffect } from "react";
import { getEmployees, getEmployeeById } from "../APIs/EmployeeAPI/employeeAPI";
export interface EmployeesState{
    employees?: EmployeeProps[],
    fetching: boolean,
    fetchingError?: Error;
}

export interface EmployeeState{
    employee?: EmployeeProps,
    fetching: boolean,
    fetchingError?: Error;
}


export interface EmployeesProps extends EmployeesState{
    addItem:()=>void

}

export const useItems:()=> EmployeesProps = () =>{
    const [employees,setEmployees] = useState<EmployeeProps[]>()
    const [fetching,setFetching] = useState<boolean>(false)
    const [fetchingError,setFetchingError] = useState<Error>()
    const addItem = useCallback(() => {
        console.log('addItem - TODO');
      }, []);
    console.log('useItems Called')

    useEffect(()=>{
        let canceled = false
        fetchItems();
        return () => {
            canceled = true;
        }
    

        async function fetchItems(){
            console.log('useItems Called - getEmployeesEffect')
            try{
                setFetching(true);
                const employees = await getEmployees()
                if(!canceled){
                    setFetching(false);
                    setEmployees(employees);
                }
            }
            catch(error){
                if (!canceled) {
                    setFetching(false);
                    setFetchingError(error as Error);
                }
            }
        }
        
    },[])
    
    return {
        employees,
        fetching,
        fetchingError,
        addItem
    }

//     function getEmployeesEffect(){
//         
//     }
}

export const useEmployeeById: (id:string)=> EmployeeState = (id) =>{

    //State to hold employee fetching details
    const [employee,setEmployee] = useState<EmployeeProps>()
    const [fetching, setFetching] = useState<boolean>(false)
    const [fetchingError, setFetchingError] = useState<Error>()
    // console.log("render useEmployee")

    useEffect(() => getEmployeeByIdEffect(id),[id])

    return {
        employee,
        fetching,
        fetchingError
    }

    function getEmployeeByIdEffect(id:string){
        let canceled = false
        fetchEmployeeById(id);
        return () => {
            canceled = true;
        }

        async function fetchEmployeeById(id:string){
            try{
                setFetching(true);
                const employee = await getEmployeeById(id)
                
                if(!canceled){
                    setFetching(false);
                    setEmployee(employee);
                }
            }
            catch(error){
                if (!canceled) {
                    setFetching(false);
                    setFetchingError(error as Error);
                }
            }
        }
        
    }
}

// export const useItems: () => EmployeesProps = () => {
//     const [employees, setEmployees] = useState<EmployeeProps[]>();
//     const [fetching, setFetching] = useState<boolean>(false);
//     const [fetchingError, setFetchingError] = useState<Error | undefined>(undefined);

//     const addItem = useCallback(() => {
//         console.log('addItem - TODO');
//     }, []);

//     useEffect(() => {
//         let canceled = false;
//         fetchItems();
//         return () => {
//             canceled = true;
//         }

//         async function fetchItems() {
//             try {
//                 setFetching(true);
//                 const fetchedEmployees = await getEmployees();
//                 if (!canceled) {
//                     setEmployees(fetchedEmployees);
//                 }
//             } catch (error) {
//                 if (!canceled) {
//                     setFetchingError(error as Error);
//                 }
//             } finally {
//                 if (!canceled) {
//                     setFetching(false);
//                 }
//             }
//         }
//     }, []); // No dependencies, runs once on mount

//     return {
//         employees,
//         fetching,
//         fetchingError,
//         addItem
//     };
// }

// export const useEmployeeById: (id: string) => EmployeeState = (id) => {
//     const [employee, setEmployee] = useState<EmployeeProps>();
//     const [fetching, setFetching] = useState<boolean>(false);
//     const [fetchingError, setFetchingError] = useState<Error | undefined>(undefined);

//     useEffect(() => {
//         let canceled = false;
//         fetchEmployeeById(id);
//         return () => {
//             canceled = true;
//         }

//         async function fetchEmployeeById(employeeId: string) {
//             try {
//                 setFetching(true);
//                 const fetchedEmployee = await getEmployeeById(employeeId);
//                 if (!canceled) {
//                     setEmployee(fetchedEmployee);
//                 }
//             } catch (error) {
//                 if (!canceled) {
//                     setFetchingError(error as Error);
//                 }
//             } finally {
//                 if (!canceled) {
//                     setFetching(false);
//                 }
//             }
//         }
//     }, [id]); // Depend on id to refetch when it changes

//     return {
//         employee,
//         fetching,
//         fetchingError
//     };
// }


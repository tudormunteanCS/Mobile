import React, { useCallback, useContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../../core';
import { EmployeeProps } from '../../utils/EmployeeProps';
import { createEmployee,updateEmployee,newWebSocket,getEmployees } from '../../todo/employeeApi';
import { AuthContext } from '../../auth/AuthProvider';

const log = getLogger('EmployeeProvider');

type SaveEmployeeFn = (employee: EmployeeProps) => Promise<any>;

export interface EmployeesState {
  employees?: EmployeeProps[],
  fetching: boolean,
  fetchingError?: Error | null,
  saving: boolean,
  savingError?: Error | null,
  saveEmployee?: SaveEmployeeFn,
}

interface ActionProps {
  type: string,
  payload?: any,
}

const initialState: EmployeesState = {
  fetching: false,
  saving: false,
};

const FETCH_EMPLOYEES_STARTED = 'FETCH_EMPLOYEES_STARTED';
const FETCH_EMPLOYEES_SUCCEEDED = 'FETCH_EMPLOYEES_SUCCEEDED';
const FETCH_EMPLOYEES_FAILED = 'FETCH_EMPLOYEES_FAILED';
const SAVE_EMPLOYEE_STARTED = 'SAVE_EMPLOYEE_STARTED';
const SAVE_EMPLOYEE_SUCCEEDED = 'SAVE_EMPLOYEE_SUCCEEDED';
const SAVE_EMPLOYEE_FAILED = 'SAVE_EMPLOYEE_FAILED';

const reducer: (state: EmployeesState, action: ActionProps) => EmployeesState =
  (state, { type, payload }) => {
    switch (type) {
      case FETCH_EMPLOYEES_STARTED:
        return { ...state, fetching: true, fetchingError: null };
      case FETCH_EMPLOYEES_SUCCEEDED:
        return { ...state, employees: payload.employees, fetching: false };
      case FETCH_EMPLOYEES_FAILED:
        return { ...state, fetchingError: payload.error, fetching: false };
      case SAVE_EMPLOYEE_STARTED:
        return { ...state, savingError: null, saving: true };
      case SAVE_EMPLOYEE_SUCCEEDED:
        const employees = [...(state.employees || [])];
        const employee = payload.employee;
        const index = employees.findIndex(it => it._id === employee._id);
        if (index === -1) {
          employees.splice(0, 0, employee);
        } else {
          employees[index] = employee;
        }
        return { ...state, employees, saving: false };
      case SAVE_EMPLOYEE_FAILED:
        return { ...state, savingError: payload.error, saving: false };
      default:
        return state;
    }
  };

export const EmployeeContext = React.createContext<EmployeesState>(initialState);

interface EmployeeProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const EmployeeProvider: React.FC<EmployeeProviderProps> = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { employees, fetching, fetchingError, saving, savingError } = state;
  useEffect(getEmployeesEffect, [token]);
  useEffect(wsEffect, [token]);
  const saveEmployee = useCallback<SaveEmployeeFn>(saveEmployeeCallback, [token]);
  const value = { employees, fetching, fetchingError, saving, savingError, saveEmployee };
  log('returns');
  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );

  function getEmployeesEffect() {
    let canceled = false;
    if (token) {
      fetchEmployees();
    }
    return () => {
      canceled = true;
    }

    async function fetchEmployees() {
      try {
        log('fetchEmployees started');
        dispatch({ type: FETCH_EMPLOYEES_STARTED });
        const employees = await getEmployees(token);
        log('fetchEmployees succeeded');
        if (!canceled) {
          dispatch({ type: FETCH_EMPLOYEES_SUCCEEDED, payload: { employees } });
        }
      } catch (error) {
        log('fetchEmployees failed', error);
        dispatch({ type: FETCH_EMPLOYEES_FAILED, payload: { error } });
      }
    }
  }

  async function saveEmployeeCallback(employee: EmployeeProps) {
    try {
      log('saveEmployee started');
      dispatch({ type: SAVE_EMPLOYEE_STARTED });
      const savedEmployee = await (employee._id ? updateEmployee(token, employee) : createEmployee(token, employee));
      log('saveEmployee succeeded');
      dispatch({ type: SAVE_EMPLOYEE_SUCCEEDED, payload: { employee: savedEmployee } });
    } catch (error) {
      log('saveEmployee failed');
      dispatch({ type: SAVE_EMPLOYEE_FAILED, payload: { error } });
    }
  }

  function wsEffect() {
    let canceled = false;
    log('wsEffect - connecting');
    let closeWebSocket: () => void;
    if (token?.trim()) {
      closeWebSocket = newWebSocket(token, message => {
        if (canceled) {
          return;
        }
        const { type, payload: item } = message;
        log(`ws message, item ${type}`);
        if (type === 'created' || type === 'updated') {
          dispatch({ type: SAVE_EMPLOYEE_SUCCEEDED, payload: { item } });
        }
      });
    }
    return () => {
      log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket?.();
    }
  }
};

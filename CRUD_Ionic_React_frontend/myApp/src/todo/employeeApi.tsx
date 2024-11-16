import axios from 'axios';
import { authConfig, baseUrl, getLogger, withLogs } from '../core';
import { EmployeeProps } from '../utils/EmployeeProps';

const employeeUrl = `http://${baseUrl}/api/employee`;

export const getEmployees: (token: string) => Promise<EmployeeProps[]> = token => {
  return withLogs(axios.get(employeeUrl, authConfig(token)), 'getEmployees');
}

export const createEmployee: (token: string, employee: EmployeeProps) => Promise<EmployeeProps[]> = (token, employee) => {
  return withLogs(axios.post(employeeUrl, employee, authConfig(token)), 'createEmployee');
}

export const updateEmployee: (token: string, employee: EmployeeProps) => Promise<EmployeeProps[]> = (token, employee) => {
  return withLogs(axios.put(`${employeeUrl}/${employee._id}`, employee, authConfig(token)), 'updateEmployee');
}

interface MessageData {
  type: string;
  payload: EmployeeProps
}

const log = getLogger('ws');

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
  const ws = new WebSocket(`ws://${baseUrl}`);
  ws.onopen = () => {
    log('web socket onopen');
    ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
  };
  ws.onclose = () => {
    log('web socket onclose');
  };
  ws.onerror = error => {
    log('web socket onerror', error);
  };
  ws.onmessage = messageEvent => {
    console.log('received message below:')
    console.log(JSON.parse(messageEvent.data))
    
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  }
}

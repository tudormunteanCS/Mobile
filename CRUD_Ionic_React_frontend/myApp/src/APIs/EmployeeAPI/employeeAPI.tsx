// import { EmployeeProps } from "../../utils/EmployeeProps";
// import axios from 'axios'

// const baseUrl = 'http://localhost:3000';

// export const getEmployees : ()=> Promise<EmployeeProps[]> = () => {
//     return axios
//     .get(`${baseUrl}/employees`)
//     .then(res=>{
//         return Promise.resolve(res.data)
//     })
//     .catch(err =>{
//         return Promise.reject(err)
//     })
// }

// export const getEmployeeById : (id:string) => Promise<EmployeeProps> = (id) =>{
//     return axios
//     .get(`${baseUrl}/employee/${id}`)
//     .then(response=>{
//         return Promise.resolve(response.data)
//     })
//     .catch(err=>{
//         console.log(err)
//         return Promise.reject(err)
//     })
// }

// export interface MessageData {
//     event: string;
//     payload : {
//         employee: EmployeeProps
//     }
//   }
  
//   export const newWebSocket = (onMessage: (data: MessageData) => void) => {
//     const ws = new WebSocket(`ws://${baseUrl}`)
//     ws.onopen = () => {
//       console.log('web socket onopen');
//     };
//     ws.onclose = () => {
//         console.log('web socket onclose');
//     };
//     ws.onerror = error => {
//         console.log('web socket onerror', error);
//     };
//     ws.onmessage = messageEvent => {
//         console.log('web socket onmessage');
//       onMessage(JSON.parse(messageEvent.data));
//     };
//     return () => {
//       ws.close();
//     }
//   }
import { useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';

// export const usePreferences = () => {
//   useEffect(() => {
//     runPreferencesDemo();
//   }, []);

//   function runPreferencesDemo() {
//     (async () => {
//       // Saving ({ key: string, value: string }) => Promise<void>
//       await Preferences.set({
//         key: 'user',
//         value: JSON.stringify({
//           username: 'a', password: 'a',
//         })
//       });

//       // Loading value by key ({ key: string }) => Promise<{ value: string | null }>
//       const res = await Preferences.get({ key: 'user' });
//       if (res.value) {
//         console.log('User found', JSON.parse(res.value));
//       } else {
//         console.log('User not found');
//       }

//       // Loading keys () => Promise<{ keys: string[] }>
//       const { keys } = await Preferences.keys();
//       console.log('Keys found', keys);

//       // Removing value by key, ({ key: string }) => Promise<void>
//       await Preferences.remove({ key: 'user' });
//       console.log('Keys found after remove', await Preferences.keys());

//       // Clear storage () => Promise<void>
//       await Preferences.clear();
//     })(); // IIE
//   }
// };

import { EmployeeProps } from './EmployeeProps';

export const usePreferences = ()=>{

    const saveAuthToken = async (token: string) => {
        
      await Preferences.set({
        key: 'token',
        value: token
      });
      console.log("saved token")
    };
  
    const getAuthToken = async (): Promise<string | null> => {
      const { value } = await Preferences.get({key: 'token'});
   
      return value;
    };

    const removeAuthToken = async () =>{
      await Preferences.remove({key:'token'})
    }
    
      // Function to save an offline action (e.g., an employee object)
    const saveOfflineAction = async (employee: EmployeeProps): Promise<void> => {
      // Retrieve existing offline actions from preferences
      const { value } = await Preferences.get({ key: 'offlineActions' });
      const storedActions: EmployeeProps[] = value ? JSON.parse(value) : [];
      
      // Add the new employee to the list of offline actions
      const updatedActions = [...storedActions, employee];
      
      // Save the updated list back to preferences
      await Preferences.set({
        key: 'offlineActions',
        value: JSON.stringify(updatedActions),
      });
      console.log("Offline action saved successfully");
    };

    // Function to retrieve all offline actions
    const getOfflineActions = async (): Promise<EmployeeProps[]> => {
      const { value } = await Preferences.get({ key: 'offlineActions' });
      return value ? JSON.parse(value) : [];
    };

    // Function to clear all offline actions
    const clearOfflineActions = async (): Promise<void> => {
      await Preferences.remove({ key: 'offlineActions' });
      console.log("Offline actions cleared successfully");
    };

    return {
      saveAuthToken,
      getAuthToken,
      removeAuthToken,
      saveOfflineAction,
      getOfflineActions,
      clearOfflineActions,
    };
  }

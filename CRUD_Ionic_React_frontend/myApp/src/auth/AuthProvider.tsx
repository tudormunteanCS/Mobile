import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { login as loginApi } from './authApi';
import { usePreferences } from '../utils/usePreferences';
const log = getLogger('AuthProvider');

type LoginFn = (username?: string, password?: string) => void;

export interface AuthState {
  authenticationError: Error | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  login?: LoginFn;
  pendingAuthentication?: boolean;
  username?: string;
  password?: string;
  token: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isAuthenticating: false,
  authenticationError: null,
  pendingAuthentication: false,
  token: '',
};

export const AuthContext = React.createContext<AuthState>(initialState);

interface AuthProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const { isAuthenticated, isAuthenticating, authenticationError, pendingAuthentication, token } = state;
  const login = useCallback<LoginFn>(loginCallback, []);
  useEffect(authenticationEffect, [pendingAuthentication]);
  useEffect(() => {
    log("checkAuthenticationEffect")
    const checkAuthenticationEffect = async () => {
      log(state)
      const { username, password } = state;
      log(username + " " + password)
      if(username && password){
        const storedToken = await getAuthToken(username,password); // Get the token from Preferences
        log("stored token: " + storedToken)
        if (storedToken) {
          // If a token is found, set the authentication state
          setState((prevState) => ({
            ...prevState,
            isAuthenticated: true,
            token: storedToken,
          }));
        }
      }
    };
    
    checkAuthenticationEffect(); // Call the async function
  }, []); // Add effect to check authentication
  const value = { isAuthenticated, login, isAuthenticating, authenticationError, token };
  const {saveAuthToken, getAuthToken} = usePreferences()
  log('render');
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );

  function loginCallback(username?: string, password?: string): void {
    log('loginCallBack');
    setState({
      ...state,
      pendingAuthentication: true,
      username,
      password
    });
    log(state)
  }

  

  function authenticationEffect() {
    let canceled = false;
    authenticate();
    return () => {
      canceled = true;
    }

    async function authenticate() {
      if (!pendingAuthentication) {
        log('authenticate, !pendingAuthentication, return');
        return;
      }
      try {
        log('authenticate...');
        setState({
          ...state,
          isAuthenticating: true,
        });
        const { username, password } = state;
        console.log(username + " x " + password)
        const { token } = await loginApi(username, password);
        log(token)
        if(username && password){
          saveAuthToken(username,password,token)
        }
        if (canceled) {
          return;
        }
        log('authenticate succeeded');
        setState({
          ...state,
          token,
          pendingAuthentication: false,
          isAuthenticated: true,
          isAuthenticating: false,
          username,
          password
        });
        log(state)
      } catch (error) {
        if (canceled) {
          return;
        }
        log('authenticate failed');
        setState({
          ...state,
          authenticationError: error as Error,
          pendingAuthentication: false,
          isAuthenticating: false,
        });
      }
    }
  }
};

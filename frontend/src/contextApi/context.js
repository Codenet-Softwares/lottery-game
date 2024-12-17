import { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { reducer } from './reducer';
import { getAdminInitialState } from '../Utils/getInitialState';
import strings from '../Utils/constant/stringConstant';
import './loader.css';


const Loader = () => (
  <div className="loader">
    <div className="spinner"></div>
  </div>
);

const AppContext = createContext({
  store: {},
  dispatch: () => {},
  showLoader: () => {},
  hideLoader: () => {},
});

const initialState = {
  admin: getAdminInitialState(),
};

const AppProvider = ({ children }) => {
  const [store, dispatch] = useReducer(reducer, initialState, () => {
    const storedState = localStorage.getItem(strings.LOCAL_STORAGE_KEY);
    return storedState ? JSON.parse(storedState) : initialState;
  });

  const [isLoading, setIsLoading] = useState(true);
  const showLoader = () => setIsLoading(true);
  const hideLoader = () => setIsLoading(false);

  useEffect(() => {
    if (store.admin.accessToken) {
      localStorage.setItem(strings.LOCAL_STORAGE_KEY, JSON.stringify(store));
      setIsLoading(false);
    } else {
      localStorage.removeItem(strings.LOCAL_STORAGE_KEY);
      setIsLoading(false);
    }
  }, [store]);
  

  return <AppContext.Provider value={{ store, dispatch, isLoading, showLoader, hideLoader}}>{children} {isLoading && (
    <Loader />
  )} </AppContext.Provider>;
};

const useAppContext = () => {
  return useContext(AppContext);
};

export { AppProvider, useAppContext };

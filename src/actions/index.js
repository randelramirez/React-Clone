import * as actionTypes from './types';

/* User Action Creators */
export const setUser = (user) => {
  return {
    type: actionTypes.SET_USER,
    payload: {
      currentUser: user,
      isLoading: false,
    },
  };
};

export const clearUser = () => {
  return {
    type: actionTypes.CLEAR_USER,
  };
};

/* Channel Action Creators */
export const setCurrentChannel = (channel) => {
  return {
    type: actionTypes.SET_CURRENT_CHANNEL,
    payload: {
      currentChannel: channel,
    },
  };
};

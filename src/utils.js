export const generateLoginEvent = () => ({
  type: 'login',
  timeStamp: (new Date()).getTime()
});

export const generateLogoutEvent = () => ({
  type: 'logout',
  timeStamp: (new Date()).getTime()
});

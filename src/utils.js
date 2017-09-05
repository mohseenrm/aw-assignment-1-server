export const generateLoginEvent = () => ({
  type: 'login',
  timeStamp: (new Date()).getTime()
});

export const rootDomain = 'http://localhost';

// Check email is valid
export const validateEmail = (email: string) => {
  const regex = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g);
  if (regex.test(email)) {
    return true;
  }
  return false;
};

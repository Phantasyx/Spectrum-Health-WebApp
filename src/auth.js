export const EXAMPLE_USER = 'admin';
export const EXAMPLE_PASSWORD = 'firstlook';

const KEY = 'first-look-admin-session';

export function credentialsMatch(user, password) {
  return String(user ?? '') === EXAMPLE_USER && String(password ?? '') === EXAMPLE_PASSWORD;
}

export function isSignedIn() {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function signIn(user, password) {
  if (!credentialsMatch(user, password)) return false;
  sessionStorage.setItem(KEY, '1');
  return true;
}

export function signOut() {
  sessionStorage.removeItem(KEY);
}

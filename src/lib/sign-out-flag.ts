/**
 * Module-level flag to prevent FirebaseAuthSync from re-signing in
 * during an explicit sign-out flow.
 */
let _isSigningOut = false;

export function isSigningOut() {
  return _isSigningOut;
}

export function setSigningOut(value: boolean) {
  _isSigningOut = value;
}

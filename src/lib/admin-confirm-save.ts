/**
 * Browser confirm for CMS saves. Call after e.preventDefault() in form handlers.
 */
export function confirmAdminSave(message: string): boolean {
  if (typeof window === "undefined") return true;
  return window.confirm(message);
}

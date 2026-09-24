import type { Access, FieldAccess } from "payload";

/**
 * CMS access rules. Two roles, both on the Payload `users` collection:
 *
 *   admin      everything in the CMS, including managing CMS users
 *   marketing  edits content and media; cannot manage users or change roles
 *
 * These are CMS accounts, separate from the site's Supabase accounts. Products,
 * orders and prices stay in the Supabase admin panel at /admin, admins only.
 */

type RoleUser = { role?: string | null } | null | undefined;

export const isAdmin = (user: RoleUser) => user?.role === "admin";

/** Any signed-in CMS user. */
export const signedIn: Access = ({ req }) => Boolean(req.user);

export const adminOnly: Access = ({ req }) => isAdmin(req.user as RoleUser);

/** Admins see every user; everyone else only themselves. */
export const adminOrSelf: Access = ({ req }) => {
  if (!req.user) return false;
  if (isAdmin(req.user as RoleUser)) return true;
  return { id: { equals: req.user.id } };
};

/** Only an admin may set or change a role — so nobody can promote themselves. */
export const adminFieldOnly: FieldAccess = ({ req }) => isAdmin(req.user as RoleUser);

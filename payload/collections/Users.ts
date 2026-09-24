import type { CollectionConfig } from "payload";
import { adminFieldOnly, adminOnly, adminOrSelf } from "../access";
import { L } from "../fields";

/**
 * CMS sign-in accounts. The very first account is created from the
 * /cms "create first user" screen and is made an admin automatically; after
 * that, only an admin can add people.
 */
export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: L("User", "ผู้ใช้"), plural: L("Users", "ผู้ใช้") },
  auth: {
    // Sessions last a working week; locked out for 10 minutes after 5 wrong passwords.
    tokenExpiration: 60 * 60 * 24 * 7,
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "name", "role"],
    group: L("Settings", "ตั้งค่า"),
    // Marketing accounts don't manage people, so the list is not shown to them
    // (access.read is what actually stops them seeing other accounts).
    hidden: ({ user }) => (user as { role?: string } | null)?.role !== "admin",
  },
  access: {
    read: adminOrSelf,
    create: adminOnly,
    update: adminOrSelf,
    delete: adminOnly,
  },
  hooks: {
    beforeChange: [
      // The first account can't be given a role by anyone, so it gets admin.
      async ({ data, operation, req }) => {
        if (operation !== "create") return data;
        const { totalDocs } = await req.payload.count({ collection: "users", req });
        if (totalDocs === 0) return { ...data, role: "admin" };
        return data;
      },
    ],
  },
  fields: [
    { name: "name", type: "text", label: L("Name", "ชื่อ") },
    {
      name: "role",
      type: "select",
      label: L("Role", "บทบาท"),
      required: true,
      defaultValue: "marketing",
      options: [
        { label: L("Admin — everything, including users", "ผู้ดูแล — ทุกอย่าง รวมถึงผู้ใช้"), value: "admin" },
        { label: L("Marketing — content and media", "การตลาด — เนื้อหาและสื่อ"), value: "marketing" },
      ],
      access: { create: adminFieldOnly, update: adminFieldOnly },
      saveToJWT: true,
    },
  ],
};

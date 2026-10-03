"use client";

import { useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, FormAlert } from "@/components/ui/field";
import { ApiError } from "@/lib/api";
import { adminService } from "@/services/admin";
import { can, type Role, type User } from "@/types/auth";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [editing, setEditing] = useState<User | "new" | null>(null);
  const [notice, setNotice] = useState<
    { tone: "error" | "success"; message: string } | null
  >(null);

  const {
    data: users,
    isLoading,
    mutate: reloadUsers,
  } = useSWR(
    "/admin/users",
    async () =>
      (await adminService.users({ type: "admin", per_page: 25 })).items,
    { shouldRetryOnError: false },
  );

  const { data: roles } = useSWR(
    "/admin/roles",
    async () => (await adminService.roles()).items,
    { shouldRetryOnError: false },
  );

  async function run(action: () => Promise<unknown>, success: string) {
    setNotice(null);

    try {
      await action();
      await reloadUsers();
      setNotice({ tone: "success", message: success });

      return true;
    } catch (e) {
      setNotice({
        tone: "error",
        message:
          e instanceof ApiError ? e.displayMessage : "Something went wrong",
      });

      return false;
    }
  }

  async function saveRoles(user: User, selected: string[]) {
    const ok = await run(
      () => adminService.syncUserRoles(user.id, selected),
      "Roles updated",
    );

    if (ok) setEditing(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="flex items-center gap-3">
          {can(currentUser, "user.manage") && (
            <Button onClick={() => setEditing("new")}>New user</Button>
          )}
        </div>
      </div>

      {notice && <FormAlert tone={notice.tone} message={notice.message} />}

      {editing === "new" && (
        <UserForm
          roles={roles}
          onCancel={() => setEditing(null)}
          onSaved={() => setEditing(null)}
          onRun={run}
        />
      )}

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Roles</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && (
              <tr>
                <td colSpan={6} className="text-muted-foreground px-4 py-6">
                  Loading…
                </td>
              </tr>
            )}
            {users?.length === 0 && (
              <tr>
                <td colSpan={6} className="text-muted-foreground px-4 py-6">
                  No users found.
                </td>
              </tr>
            )}
            {users?.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.type}</td>
                <td className="px-4 py-3">{user.status}</td>
                <td className="px-4 py-3">
                  {user.roles?.map((role) => role.label).join(", ") || "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  {user.type === "admin" && can(currentUser, "user.manage") && (
                    <Button variant="ghost" onClick={() => setEditing(user)}>
                      Edit roles
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {editing && editing !== "new" && (
        <Card className="space-y-4">
          <CardTitle>Roles for {editing.name}</CardTitle>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const selected = Array.from(
                new FormData(event.currentTarget).getAll("roles"),
              ).map(String);
              void saveRoles(editing, selected);
            }}
            className="space-y-4"
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {roles?.map((role) => (
                <label
                  key={role.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    name="roles"
                    value={role.name}
                    defaultChecked={editing.roles?.some(
                      (r) => r.name === role.name,
                    )}
                    className="size-4"
                  />
                  {role.label}
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save roles</Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

function UserForm({
  roles,
  onCancel,
  onSaved,
  onRun,
}: {
  roles: Role[] | undefined;
  onCancel: () => void;
  onSaved: () => void;
  onRun: (
    action: () => Promise<unknown>,
    success: string,
  ) => Promise<boolean>;
}) {
  const [saving, setSaving] = useState(false);

  return (
    <Card className="space-y-4">
      <CardTitle>New user</CardTitle>

      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          setSaving(true);

          const payload = {
            name: String(form.get("name")),
            email: String(form.get("email")),
            password: String(form.get("password")),
            phone: String(form.get("phone") || "") || undefined,
            roles: Array.from(form.getAll("roles")).map(String),
          };

          try {
            const ok = await onRun(
              () => adminService.createUser(payload),
              "User created",
            );

            if (ok) onSaved();
          } finally {
            setSaving(false);
          }
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" name="name" required />
          <Field label="Email" name="email" type="email" required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone" name="phone" />
          <Field
            label="Password"
            name="password"
            type="password"
            required
            minLength={8}
            hint="At least 8 characters"
          />
        </div>

        <div className="space-y-1.5">
          <span className="block text-sm font-medium">Roles</span>
          <div className="grid gap-2 sm:grid-cols-2">
            {roles?.map((role) => (
              <label key={role.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="roles"
                  value={role.name}
                  className="size-4"
                />
                {role.label}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2 border-t pt-4">
          <Button type="submit" loading={saving}>
            Create user
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

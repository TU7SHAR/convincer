import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import {
  isAdminAuthenticated,
  isAdminConfigured,
} from "@/src/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <main className="admin-login-page">
      <section>
        <span className="admin-kicker">Private control room</span>
        <h1>Super admin</h1>
        <p>
          This area contains deliberate responses and visit timelines that were
          recorded only after explicit consent.
        </p>
        {isAdminConfigured() ? (
          <AdminLoginForm />
        ) : (
          <div className="admin-config-warning">
            Add <code>ADMIN_PASSWORD</code> and{" "}
            <code>ADMIN_SESSION_SECRET</code> to the environment before signing
            in.
          </div>
        )}
      </section>
    </main>
  );
}

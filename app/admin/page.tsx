import Link from "next/link";
import { redirect } from "next/navigation";

import { DeleteVisitButton } from "@/components/admin/DeleteVisitButton";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { AdminPageControls } from "@/components/admin/AdminPageControls";
import { isAdminAuthenticated } from "@/src/lib/admin-auth";
import {
  getAdminDashboardData,
  type AdminDashboardData,
} from "@/src/lib/admin-db";
import { hashPrivatePageToken } from "@/src/lib/token";
import { getSmtpNotificationStatus } from "@/src/lib/visit-notifications";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const token = process.env.PRIVATE_PAGE_TOKEN?.trim();
  let data: AdminDashboardData | null = null;
  let databaseError = "";
  const smtpStatus = getSmtpNotificationStatus();

  if (!token) {
    databaseError = "PRIVATE_PAGE_TOKEN is not configured.";
  } else {
    try {
      data = await getAdminDashboardData(hashPrivatePageToken(token));
    } catch (error) {
      console.error("[admin] dashboard query failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      databaseError =
        "The dashboard could not reach Neon. Check DATABASE_URL and run the latest schema.";
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <span className="admin-kicker">Private control room</span>
          <h1>Super admin</h1>
          <p>
            Deliberate responses and visit timelines recorded after explicit
            consent.
          </p>
        </div>
        <div className="admin-header-actions">
          {token ? (
            <Link href={`/p/${token}`} target="_blank" rel="noreferrer">
              Open private page
            </Link>
          ) : null}
          <AdminLogoutButton />
        </div>
      </header>

      {databaseError ? (
        <section className="admin-error" role="alert">
          <h2>Database connection needed</h2>
          <p>{databaseError}</p>
        </section>
      ) : null}

      {data ? (
        <>
          <section className="admin-metrics" aria-label="Dashboard totals">
            <article>
              <span>Responses</span>
              <strong>{data.totals.responses}</strong>
            </article>
            <article>
              <span>Consented visits</span>
              <strong>{data.totals.visits}</strong>
            </article>
            <article>
              <span>Section views</span>
              <strong>{data.totals.sectionViews}</strong>
            </article>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="admin-kicker">Direct SMTP alerts</span>
                <h2>
                  {smtpStatus.configured
                    ? "Email notifications ready"
                    : "Email notifications need setup"}
                </h2>
              </div>
            </div>
            <p className="admin-muted">
              {smtpStatus.configured
                ? "Every new consented visit or named-section stamp triggers one SMTP email. Duplicate stamps do not resend."
                : `Add these server-only environment values: ${smtpStatus.missing.join(", ")}.`}
            </p>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="admin-kicker">Page access</span>
                <h2>
                  {data.tokenState.isClosed
                    ? "Closed by recipient"
                    : data.tokenState.isActive
                      ? "Private page active"
                      : "Private page paused"}
                </h2>
              </div>
              <AdminPageControls
                isActive={data.tokenState.isActive}
                isClosed={data.tokenState.isClosed}
              />
            </div>
            {data.tokenState.closedReason ? (
              <p className="admin-muted">
                Closed reason: {formatValue(data.tokenState.closedReason)}
              </p>
            ) : null}
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="admin-kicker">Intentional submissions</span>
                <h2>Responses</h2>
              </div>
            </div>
            {data.responses.length > 0 ? (
              <div className="admin-response-list">
                {data.responses.map((response) => (
                  <article className="admin-response-card" key={response.id}>
                    <div className="admin-card-heading">
                      <strong>{formatValue(response.responseType)}</strong>
                      <time dateTime={response.createdAt}>
                        {formatDate(response.createdAt)}
                      </time>
                    </div>
                    {response.message ? (
                      <blockquote>{response.message}</blockquote>
                    ) : (
                      <p className="admin-muted">No written note.</p>
                    )}
                    <dl>
                      <Detail label="Contact" value={response.contactMethod} />
                      <Detail
                        label="Phone supplied"
                        value={response.phoneNumber}
                      />
                      <Detail label="Preferred time" value={response.preferredTime} />
                      <Detail label="Waiting period" value={response.waitingPeriod} />
                      <Detail
                        label="Reply permission"
                        value={response.replyPermission}
                      />
                    </dl>
                  </article>
                ))}
              </div>
            ) : (
              <p className="admin-empty">No responses have been submitted yet.</p>
            )}
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="admin-kicker">Opt-in only</span>
                <h2>Visit timelines</h2>
              </div>
            </div>
            <p className="admin-privacy-note">
              These timelines contain no phone number, IP address, device
              fingerprint, or typing activity.
            </p>
            {data.visits.length > 0 ? (
              <div className="admin-visit-list">
                {data.visits.map((visit, index) => (
                  <article className="admin-visit-card" key={visit.sessionId}>
                    <div className="admin-card-heading">
                      <strong>Visit {data.visits.length - index}</strong>
                      <time dateTime={visit.startedAt}>
                        {formatDate(visit.startedAt)}
                      </time>
                    </div>
                    <ol>
                      {visit.events.map((event) => (
                        <li key={event.id}>
                          <span>
                            {event.eventType === "session_started"
                              ? "Consent given"
                              : `Reached ${formatValue(event.sectionKey)}`}
                            {event.notificationSentAt ? (
                              <small> · Email sent</small>
                            ) : event.notificationError ? (
                              <small> · Email failed</small>
                            ) : (
                              <small> · Email not sent</small>
                            )}
                          </span>
                          <time dateTime={event.createdAt}>
                            {formatDate(event.createdAt)}
                          </time>
                        </li>
                      ))}
                    </ol>
                    <DeleteVisitButton sessionId={visit.sessionId} />
                  </article>
                ))}
              </div>
            ) : (
              <p className="admin-empty">No consented visit timelines yet.</p>
            )}
          </section>
        </>
      ) : null}
    </main>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  if (!value) {
    return null;
  }

  return (
    <div>
      <dt>{label}</dt>
      <dd>{formatValue(value)}</dd>
    </div>
  );
}

function formatValue(value: string | null) {
  if (!value) {
    return "Not provided";
  }

  return value.replaceAll("_", " ");
}

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

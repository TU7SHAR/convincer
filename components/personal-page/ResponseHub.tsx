"use client";

import { FormEvent, useState } from "react";

import {
  personalPageContent,
  type ResponseType,
} from "@/src/content/personal-page";

export type ContactLinks = {
  whatsapp?: string;
  instagram?: string;
  email?: string;
};

type ResponsePayload = {
  responseType: ResponseType;
  message?: string;
  contactMethod?: string;
  preferredTime?: string;
  waitingPeriod?: string;
  replyPermission?: string;
  phoneConfirmed?: boolean;
  phoneNumber?: string;
  website?: string;
};

type ResponseHubProps = {
  token: string;
  contactLinks: ContactLinks;
  storageAvailable: boolean;
};

type ContactMethod = keyof ContactLinks;

const contactLabels: Record<ContactMethod, string> = {
  whatsapp: "Open WhatsApp",
  instagram: "Open Instagram",
  email: "Open Gmail",
};

export function ResponseHub({
  token,
  contactLinks,
  storageAvailable,
}: ResponseHubProps) {
  const [selected, setSelected] = useState<ResponseType | null>(null);
  const [submitted, setSubmitted] = useState<ResponseType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submitResponse(payload: ResponsePayload) {
    if (!storageAvailable) {
      setError(
        "The private reply box is temporarily offline. Your words are still here—use one of the direct contact buttons instead.",
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/private-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...payload }),
      });
      const result = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          result?.message ?? personalPageContent.forms.retryError,
        );
      }

      setSubmitted(payload.responseType);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : personalPageContent.forms.retryError,
      );
    } finally {
      setSubmitting(false);
    }
  }

  function chooseResponse(type: ResponseType | null) {
    setSelected(type);
    setError("");
  }

  return (
    <div className="response-shell">
      <DirectContactCard contactLinks={contactLinks} />

      {submitted ? (
        <ResponseSuccess
          responseType={submitted}
          contactLinks={contactLinks}
        />
      ) : (
        <>
          {!selected ? (
            <div className="response-options">
              {personalPageContent.responseHub.options.map((option) => (
                <button
                  className="response-option"
                  type="button"
                  key={option.type}
                  onClick={() => chooseResponse(option.type)}
                >
                  <span>{option.label}</span>
                  <small>{option.description}</small>
                </button>
              ))}
            </div>
          ) : null}

          {selected === "talk" ? (
            <TalkForm
              submitting={submitting}
              storageAvailable={storageAvailable}
              error={error}
              contactLinks={contactLinks}
              onBack={() => chooseResponse(null)}
              onSubmit={submitResponse}
            />
          ) : null}

          {selected === "need_time" ? (
            <TimeForm
              submitting={submitting}
              storageAvailable={storageAvailable}
              error={error}
              contactLinks={contactLinks}
              onBack={() => chooseResponse(null)}
              onSubmit={submitResponse}
            />
          ) : null}

          {selected === "written_message" ? (
            <WrittenForm
              submitting={submitting}
              storageAvailable={storageAvailable}
              error={error}
              contactLinks={contactLinks}
              onBack={() => chooseResponse(null)}
              onSubmit={submitResponse}
            />
          ) : null}

          {selected === "no_contact" ? (
            <NoContactForm
              submitting={submitting}
              storageAvailable={storageAvailable}
              error={error}
              contactLinks={contactLinks}
              onBack={() => chooseResponse(null)}
              onSubmit={submitResponse}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

function DirectContactCard({
  contactLinks,
}: {
  contactLinks: ContactLinks;
}) {
  return (
    <section
      className="direct-contact-card"
      id="direct-contact-options"
      data-visit-section="response"
      aria-labelledby="direct-contact"
    >
      <span className="direct-contact-heart" aria-hidden="true">
        ♡
      </span>
      <div>
        <span className="eyebrow">The simplest route</span>
        <h3 id="direct-contact">Want to talk to me directly?</h3>
        <p>
          Skip every form if you want. These buttons open your own app, and
          nothing is sent until you choose Send there.
        </p>
      </div>
      <ContactButtons contactLinks={contactLinks} />
    </section>
  );
}

function ResponseSuccess({
  responseType,
  contactLinks,
}: {
  responseType: ResponseType;
  contactLinks: ContactLinks;
}) {
  const message = personalPageContent.finalMessages[responseType];

  return (
    <div className="response-success" aria-live="polite">
      <span className="eyebrow">Response sent</span>
      <h3>{message.heading}</h3>
      <p>{message.body}</p>
      {responseType === "talk" ? (
        <ContactButtons contactLinks={contactLinks} />
      ) : null}
    </div>
  );
}

type FormProps = {
  submitting: boolean;
  storageAvailable: boolean;
  error: string;
  contactLinks: ContactLinks;
  onBack: () => void;
  onSubmit: (payload: ResponsePayload) => Promise<void>;
};

function TalkForm({
  submitting,
  storageAvailable,
  error,
  contactLinks,
  onBack,
  onSubmit,
}: FormProps) {
  const copy = personalPageContent.forms.talk;
  const [contactMethod, setContactMethod] = useState("page");
  const [preferredTime, setPreferredTime] = useState("i_will_tell_you");
  const [message, setMessage] = useState("");
  const [phoneConfirmed, setPhoneConfirmed] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const directMessage =
    message.trim() || "Hey, I saw what you made. We can talk.";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      responseType: "talk",
      contactMethod,
      preferredTime,
      message,
      phoneConfirmed,
      phoneNumber,
      website: readHoneypot(event),
    });
  }

  return (
    <form className="response-form" onSubmit={handleSubmit}>
      <HoneypotField />
      <FormHeading heading={copy.heading} body={copy.body} />

      <label htmlFor="talk-method">{copy.methodLabel}</label>
      <select
        id="talk-method"
        value={contactMethod}
        onChange={(event) => setContactMethod(event.target.value)}
      >
        <option value="page">Leave the answer on this page</option>
        <option value="whatsapp">WhatsApp</option>
        <option value="instagram">Instagram</option>
        <option value="email">Email</option>
        <option value="phone">Phone call request</option>
      </select>

      <label htmlFor="talk-time">{copy.timeLabel}</label>
      <select
        id="talk-time"
        value={preferredTime}
        onChange={(event) => setPreferredTime(event.target.value)}
      >
        <option value="today">Today</option>
        <option value="tomorrow">Tomorrow</option>
        <option value="this_weekend">This weekend</option>
        <option value="i_will_tell_you">I will tell you later</option>
      </select>

      <label htmlFor="talk-note">Optional note</label>
      <textarea
        id="talk-note"
        value={message}
        maxLength={5000}
        rows={4}
        onChange={(event) => setMessage(event.target.value)}
      />

      {contactMethod === "phone" ? (
        <>
          <label htmlFor="talk-phone">
            Phone number (only if you want me to use it)
          </label>
          <input
            id="talk-phone"
            type="tel"
            value={phoneNumber}
            inputMode="tel"
            autoComplete="tel"
            required
            maxLength={30}
            onChange={(event) => setPhoneNumber(event.target.value)}
          />
          <label className="check-row">
            <input
              type="checkbox"
              checked={phoneConfirmed}
              onChange={(event) => setPhoneConfirmed(event.target.checked)}
              required
            />
            <span>{copy.phoneConfirmation}</span>
          </label>
        </>
      ) : null}

      <FormActions
        submitting={submitting}
        storageAvailable={storageAvailable}
        error={error}
        onBack={onBack}
      />
      <DirectFallback
        heading="Or start the conversation now"
        contactLinks={contactLinks}
        message={directMessage}
      />
    </form>
  );
}

function TimeForm({
  submitting,
  storageAvailable,
  error,
  contactLinks,
  onBack,
  onSubmit,
}: FormProps) {
  const copy = personalPageContent.forms.needTime;
  const [waitingPeriod, setWaitingPeriod] = useState("i_do_not_know");
  const [replyPermission, setReplyPermission] = useState("wait_for_me");
  const [message, setMessage] = useState("");
  const directMessage = [
    "I saw the page. I need some more time.",
    message.trim(),
    replyPermission === "wait_for_me"
      ? "Please wait for me to contact you."
      : "You may check in after some time.",
  ]
    .filter(Boolean)
    .join(" ");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      responseType: "need_time",
      waitingPeriod,
      replyPermission,
      message,
      website: readHoneypot(event),
    });
  }

  return (
    <form className="response-form" onSubmit={handleSubmit}>
      <HoneypotField />
      <FormHeading heading={copy.heading} body={copy.body} />

      <label htmlFor="waiting-period">{copy.periodLabel}</label>
      <select
        id="waiting-period"
        value={waitingPeriod}
        onChange={(event) => setWaitingPeriod(event.target.value)}
      >
        <option value="a_few_days">A few days</option>
        <option value="a_week">A week</option>
        <option value="a_few_weeks">A few weeks</option>
        <option value="i_will_contact_you">I will contact you myself</option>
        <option value="i_do_not_know">I do not know yet</option>
      </select>

      <label htmlFor="time-note">{copy.noteLabel}</label>
      <textarea
        id="time-note"
        value={message}
        maxLength={5000}
        rows={5}
        onChange={(event) => setMessage(event.target.value)}
      />

      <label htmlFor="time-permission">{copy.permissionLabel}</label>
      <select
        id="time-permission"
        value={replyPermission}
        onChange={(event) => setReplyPermission(event.target.value)}
      >
        <option value="may_check_in">
          You may check in after this period
        </option>
        <option value="wait_for_me">Please wait for me to contact you</option>
      </select>

      <FormActions
        submitting={submitting}
        storageAvailable={storageAvailable}
        error={error}
        onBack={onBack}
      />
      <DirectFallback
        heading="Send this boundary directly instead"
        contactLinks={contactLinks}
        message={directMessage}
      />
    </form>
  );
}

function WrittenForm({
  submitting,
  storageAvailable,
  error,
  contactLinks,
  onBack,
  onSubmit,
}: FormProps) {
  const copy = personalPageContent.forms.written;
  const [message, setMessage] = useState("");
  const [replyPermission, setReplyPermission] = useState("may_reply");
  const [contactMethod, setContactMethod] = useState("no_reply");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      responseType: "written_message",
      message,
      replyPermission,
      contactMethod,
      website: readHoneypot(event),
    });
  }

  return (
    <form className="response-form" onSubmit={handleSubmit}>
      <HoneypotField />
      <FormHeading heading={copy.heading} body={copy.body} />

      <label htmlFor="written-message">{copy.messageLabel}</label>
      <textarea
        id="written-message"
        value={message}
        required
        minLength={1}
        maxLength={5000}
        rows={9}
        placeholder={copy.placeholder}
        onChange={(event) => setMessage(event.target.value)}
      />
      <span className="character-count">{message.length} / 5,000</span>

      <label htmlFor="written-permission">{copy.permissionLabel}</label>
      <select
        id="written-permission"
        value={replyPermission}
        onChange={(event) => setReplyPermission(event.target.value)}
      >
        <option value="may_reply">You may reply to me</option>
        <option value="not_immediately">
          Please read it, but do not reply immediately
        </option>
        <option value="read_only">
          Please read it only. I do not want a response
        </option>
      </select>

      <label htmlFor="written-method">{copy.methodLabel}</label>
      <select
        id="written-method"
        value={contactMethod}
        onChange={(event) => setContactMethod(event.target.value)}
      >
        <option value="no_reply">No reply</option>
        <option value="whatsapp">WhatsApp</option>
        <option value="instagram">Instagram</option>
        <option value="email">Email</option>
      </select>

      <FormActions
        submitting={submitting}
        storageAvailable={storageAvailable}
        error={error}
        onBack={onBack}
      />
      {message.trim() ? (
        <DirectFallback
          heading="Or send these exact words directly"
          contactLinks={contactLinks}
          message={message}
        />
      ) : null}
    </form>
  );
}

function NoContactForm({
  submitting,
  storageAvailable,
  error,
  contactLinks,
  onBack,
  onSubmit,
}: FormProps) {
  const copy = personalPageContent.forms.noContact;
  const directMessage =
    "I saw the page. I do not want further contact. Please respect this decision.";

  return (
    <div className="response-form">
      <FormHeading heading={copy.heading} body={copy.body} />
      <div className="form-actions">
        <button
          className="primary-button"
          type="button"
          disabled={submitting || !storageAvailable}
          onClick={() =>
            onSubmit({
              responseType: "no_contact",
              website: "",
            })
          }
        >
          {submitting
            ? personalPageContent.forms.sending
            : storageAvailable
              ? copy.confirm
              : "Private reply box offline"}
        </button>
        <button
          className="text-button"
          type="button"
          disabled={submitting}
          onClick={onBack}
        >
          {copy.cancel}
        </button>
      </div>
      <p className="form-error" aria-live="polite">
        {error}
      </p>
      <DirectFallback
        heading="Send this boundary directly instead"
        contactLinks={contactLinks}
        message={directMessage}
      />
    </div>
  );
}

function DirectFallback({
  heading,
  contactLinks,
  message,
}: {
  heading: string;
  contactLinks: ContactLinks;
  message: string;
}) {
  return (
    <div className="direct-fallback">
      <strong>{heading}</strong>
      <small>
        This opens a draft in your app. You can review or change it before
        sending.
      </small>
      <ContactButtons contactLinks={contactLinks} message={message} />
    </div>
  );
}

function ContactButtons({
  contactLinks,
  message,
}: {
  contactLinks: ContactLinks;
  message?: string;
}) {
  const entries = Object.entries(contactLinks) as Array<
    [ContactMethod, string | undefined]
  >;
  const availableEntries = entries.filter(
    (entry): entry is [ContactMethod, string] => Boolean(entry[1]),
  );

  if (availableEntries.length === 0) {
    return (
      <p className="contact-unavailable">
        Direct contact details have not been added yet.
      </p>
    );
  }

  return (
    <div className="contact-links" aria-label="Direct contact choices">
      {availableEntries.map(([method, href]) => (
        <a
          className={`contact-link contact-link-${method}`}
          href={buildContactHref(method, href, message)}
          key={method}
          target="_blank"
          rel="noreferrer"
        >
          <span aria-hidden="true">
            {method === "whatsapp" ? "↗" : method === "email" ? "✉" : "♡"}
          </span>
          {contactLabels[method]}
        </a>
      ))}
    </div>
  );
}

function buildContactHref(
  method: ContactMethod,
  href: string,
  message?: string,
) {
  if (!message?.trim() || method === "instagram") {
    return href;
  }

  try {
    const url = new URL(href);

    if (method === "whatsapp") {
      url.searchParams.set("text", message.trim());
    }

    if (method === "email") {
      url.searchParams.set("su", "A message after seeing the site");
      url.searchParams.set("body", message.trim());
    }

    return url.toString();
  } catch {
    return href;
  }
}

function readHoneypot(event: FormEvent<HTMLFormElement>) {
  return String(new FormData(event.currentTarget).get("website") ?? "");
}

function HoneypotField() {
  return (
    <div
      aria-hidden="true"
      style={{ position: "absolute", left: "-10000px", width: 1, height: 1 }}
    >
      <label htmlFor="website-field">Website</label>
      <input
        id="website-field"
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}

function FormHeading({ heading, body }: { heading: string; body: string }) {
  return (
    <div className="form-heading">
      <h3>{heading}</h3>
      <p>{body}</p>
    </div>
  );
}

function FormActions({
  submitting,
  storageAvailable,
  error,
  onBack,
}: {
  submitting: boolean;
  storageAvailable: boolean;
  error: string;
  onBack: () => void;
}) {
  return (
    <>
      <div className="form-actions">
        <button
          className="primary-button"
          type="submit"
          disabled={submitting || !storageAvailable}
        >
          {submitting
            ? personalPageContent.forms.sending
            : storageAvailable
              ? personalPageContent.forms.submit
              : "Private reply box offline"}
        </button>
        <button
          className="text-button"
          type="button"
          disabled={submitting}
          onClick={onBack}
        >
          {personalPageContent.forms.back}
        </button>
      </div>
      <p className="form-error" aria-live="polite">
        {error}
      </p>
    </>
  );
}

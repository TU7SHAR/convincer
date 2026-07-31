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
  website?: string;
};

type ResponseHubProps = {
  token: string;
  contactLinks: ContactLinks;
};

const contactLabels = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  email: "Email",
};

export function ResponseHub({ token, contactLinks }: ResponseHubProps) {
  const [selected, setSelected] = useState<ResponseType | null>(null);
  const [submitted, setSubmitted] = useState<ResponseType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submitResponse(payload: ResponsePayload) {
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/private-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...payload }),
      });

      if (!response.ok) {
        throw new Error("Response was not accepted.");
      }

      setSubmitted(payload.responseType);
    } catch {
      setError(personalPageContent.forms.retryError);
    } finally {
      setSubmitting(false);
    }
  }

  function chooseResponse(type: ResponseType | null) {
    setSelected(type);
    setError("");
  }

  if (submitted) {
    const message = personalPageContent.finalMessages[submitted];

    return (
      <div className="response-success" aria-live="polite">
        <span className="eyebrow">Response sent</span>
        <h3>{message.heading}</h3>
        <p>{message.body}</p>
        {submitted === "talk" && Object.keys(contactLinks).length > 0 ? (
          <div className="contact-links" aria-label="Contact choices">
            {Object.entries(contactLinks).map(([method, href]) =>
              href ? (
                <a
                  href={href}
                  key={method}
                  target={method === "email" ? undefined : "_blank"}
                  rel={method === "email" ? undefined : "noreferrer"}
                >
                  {contactLabels[method as keyof typeof contactLabels]}
                </a>
              ) : null,
            )}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="response-shell">
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
          error={error}
          onBack={() => chooseResponse(null)}
          onSubmit={submitResponse}
        />
      ) : null}

      {selected === "need_time" ? (
        <TimeForm
          submitting={submitting}
          error={error}
          onBack={() => chooseResponse(null)}
          onSubmit={submitResponse}
        />
      ) : null}

      {selected === "written_message" ? (
        <WrittenForm
          submitting={submitting}
          error={error}
          onBack={() => chooseResponse(null)}
          onSubmit={submitResponse}
        />
      ) : null}

      {selected === "no_contact" ? (
        <NoContactForm
          submitting={submitting}
          error={error}
          onBack={() => chooseResponse(null)}
          onSubmit={submitResponse}
        />
      ) : null}
    </div>
  );
}

type FormProps = {
  submitting: boolean;
  error: string;
  onBack: () => void;
  onSubmit: (payload: ResponsePayload) => Promise<void>;
};

function TalkForm({ submitting, error, onBack, onSubmit }: FormProps) {
  const copy = personalPageContent.forms.talk;
  const [contactMethod, setContactMethod] = useState("page");
  const [preferredTime, setPreferredTime] = useState("i_will_tell_you");
  const [message, setMessage] = useState("");
  const [phoneConfirmed, setPhoneConfirmed] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      responseType: "talk",
      contactMethod,
      preferredTime,
      message,
      phoneConfirmed,
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
        <label className="check-row">
          <input
            type="checkbox"
            checked={phoneConfirmed}
            onChange={(event) => setPhoneConfirmed(event.target.checked)}
            required
          />
          <span>{copy.phoneConfirmation}</span>
        </label>
      ) : null}

      <FormActions
        submitting={submitting}
        error={error}
        onBack={onBack}
      />
    </form>
  );
}

function TimeForm({ submitting, error, onBack, onSubmit }: FormProps) {
  const copy = personalPageContent.forms.needTime;
  const [waitingPeriod, setWaitingPeriod] = useState("i_do_not_know");
  const [replyPermission, setReplyPermission] = useState("wait_for_me");
  const [message, setMessage] = useState("");

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
        error={error}
        onBack={onBack}
      />
    </form>
  );
}

function WrittenForm({ submitting, error, onBack, onSubmit }: FormProps) {
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
        error={error}
        onBack={onBack}
      />
    </form>
  );
}

function NoContactForm({ submitting, error, onBack, onSubmit }: FormProps) {
  const copy = personalPageContent.forms.noContact;

  return (
    <div className="response-form">
      <FormHeading heading={copy.heading} body={copy.body} />
      <div className="form-actions">
        <button
          className="primary-button"
          type="button"
          disabled={submitting}
          onClick={() =>
            onSubmit({
              responseType: "no_contact",
              website: "",
            })
          }
        >
          {submitting ? personalPageContent.forms.sending : copy.confirm}
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
    </div>
  );
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
  error,
  onBack,
}: {
  submitting: boolean;
  error: string;
  onBack: () => void;
}) {
  return (
    <>
      <div className="form-actions">
        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting
            ? personalPageContent.forms.sending
            : personalPageContent.forms.submit}
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

export type MemoryItem = {
  id: string;
  type: "image" | "video";
  src: string;
  poster?: string;
  enabled: boolean;
  safeToUse: boolean;
  privacy: "safe" | "private-do-not-use";
  category: "quiet" | "playful" | "warm" | "thoughtful";
  caption: string;
  alt: string;
  order: number;
};

export type ResponseType =
  | "talk"
  | "need_time"
  | "written_message"
  | "no_contact";

export const personalPageContent = {
  recipientName: "Palak",
  senderName: "Tushar",

  metadata: {
    title: "Something I wanted to say",
    description: "A private message.",
  },

  opening: {
    eyebrow: "Something I could not fit inside a message",
    heading: "Hey, Palak.",
    body: "I know this is unexpected. I made something small because another huge paragraph would never explain it properly.",
    reassurance: "You do not have to decide anything before seeing it.",
    openLabel: "Open what I made",
    exitLabel: "Leave quietly",
  },

  memoriesIntro: {
    eyebrow: "The small things",
    heading: "Some versions of you I still remember",
    body: "Not an archive. Just a few ordinary expressions that somehow made ordinary days feel less ordinary.",
  },

  memories: [
    {
      id: "expression-01",
      type: "video",
      src: "/memories/expression-01.mp4",
      poster: "/memories/poster-01.jpg",
      enabled: true,
      safeToUse: true,
      privacy: "safe",
      category: "quiet",
      caption: "The face you made when words felt unnecessary.",
      alt: "A quiet remembered expression",
      order: 1,
    },
    {
      id: "expression-02",
      type: "video",
      src: "/memories/expression-02.mp4",
      poster: "/memories/poster-02.jpg",
      enabled: true,
      safeToUse: true,
      privacy: "safe",
      category: "thoughtful",
      caption: "The serious version of you that never stayed serious for very long.",
      alt: "A thoughtful remembered expression",
      order: 2,
    },
    {
      id: "expression-03",
      type: "video",
      src: "/memories/expression-03.mp4",
      poster: "/memories/poster-03.jpg",
      enabled: true,
      safeToUse: true,
      privacy: "safe",
      category: "warm",
      caption: "The tiny smile that could reset an entire bad day.",
      alt: "A warm remembered expression",
      order: 3,
    },
    {
      id: "expression-04",
      type: "video",
      src: "/memories/expression-04.mp4",
      poster: "/memories/poster-04.jpg",
      enabled: true,
      safeToUse: true,
      privacy: "safe",
      category: "playful",
      caption: "The version of you that was fully capable of arguing while half asleep.",
      alt: "A playful remembered expression",
      order: 4,
    },
    {
      id: "expression-05",
      type: "video",
      src: "/memories/expression-05.mp4",
      poster: "/memories/poster-05.jpg",
      enabled: true,
      safeToUse: true,
      privacy: "safe",
      category: "playful",
      caption: "The small expressions I did not know I would miss this much.",
      alt: "A playful remembered moment",
      order: 5,
    },
    {
      id: "memory-01",
      type: "image",
      src: "/memories/memory-01.jpeg",
      enabled: true,
      safeToUse: true,
      privacy: "safe",
      category: "warm",
      caption: "One quiet moment, kept gently.",
      alt: "A quiet outdoor portrait",
      order: 6,
    },
  ] satisfies MemoryItem[],

  absenceTransition: {
    first: "I thought distance would make all of this feel smaller.",
    second: "It did not.",
  },

  separation: {
    heading: "It has been…",
    lineOne: "Since we stopped talking.",
    lineTwo:
      "I am not showing you this to make you responsible for the time. I just never stopped noticing it.",
  },

  reflection: {
    eyebrow: "What the distance felt like",
    heading: "I missed your place in the ordinary.",
    body: "I kept thinking enough time would make me stop wanting to tell you things. Something funny would happen, I would see something you would have reacted to, or a normal day would suddenly remind me of one of your expressions. I understood that what I missed was not only the conversations. I missed your presence inside the ordinary parts of my day.",
  },

  accountability: {
    eyebrow: "The honest part",
    heading: "I know this does not fix everything.",
    body: "Building a website cannot undo whatever made distance feel necessary. Missing you also does not mean you have to come back. I may have misunderstood things, reacted emotionally, or made the situation heavier than it needed to be. I am not asking you to pretend none of that happened.",
    request:
      "What I am asking for is smaller: one honest conversation, without pressure to promise anything.",
    points: [
      {
        title: "I should have listened.",
        body: "I should have listened instead of trying to immediately change your mind.",
        enabled: true,
      },
      {
        title: "Fear made things heavier.",
        body: "I let my fear of losing the connection make some conversations heavier than they needed to be.",
        enabled: true,
      },
      {
        title: "Care is not control.",
        body: "I understand that caring about someone does not give me control over their decision.",
        enabled: true,
      },
    ],
  },

  invitation: {
    eyebrow: "What I am hoping for",
    heading: "One calm, honest conversation.",
    body: "Not an instant answer. Not a promise that everything will return to how it was. I would just like the chance to speak once, calmly and honestly, and understand where we both stand.",
    points: [
      "One honest conversation.",
      "No fighting or forcing a decision.",
      "Space for both people to say what they actually feel.",
    ],
    final:
      "Palak, I do not expect a website to decide anything for you. I made it because what we had mattered to me, and silence did not feel like an honest ending. I would still choose one real conversation over a hundred assumptions. If there is even a small part of you that is open to that, you can tell me below.",
  },

  responseHub: {
    eyebrow: "No perfect answer required",
    heading: "You do not need to find the perfect words.",
    body: "Choose whichever answer feels closest to what you actually feel.",
    privacyNote:
      "Only the answer you intentionally send below will be stored. Viewing, scrolling, and leaving are not recorded.",
    options: [
      {
        type: "talk",
        label: "I am willing to talk",
        description: "Choose a place and a time that feels comfortable.",
      },
      {
        type: "need_time",
        label: "I need more time",
        description: "Set the boundary that would feel most helpful.",
      },
      {
        type: "written_message",
        label: "I want to write something here",
        description: "Say it in your own words, however unfinished.",
      },
      {
        type: "no_contact",
        label: "I do not want further contact",
        description: "A clear answer that will be treated as final.",
      },
    ] satisfies Array<{
      type: ResponseType;
      label: string;
      description: string;
    }>,
  },

  forms: {
    back: "Choose a different answer",
    sending: "Sending…",
    submit: "Send my response",
    retryError:
      "This could not be sent right now. Your message is still here. Please try again.",
    talk: {
      heading: "Thank you.",
      body: "Choose whatever feels most comfortable. Nothing will be contacted automatically.",
      methodLabel: "Where would you prefer to talk?",
      timeLabel: "When would you feel comfortable talking?",
      phoneConfirmation: "Yes, send this as a phone call request.",
    },
    needTime: {
      heading: "That is okay.",
      body: "You do not need to explain everything right now.",
      periodLabel: "What feels closest?",
      noteLabel: "Anything you want me to understand?",
      permissionLabel: "What should happen after that?",
    },
    written: {
      heading: "Write whatever is true.",
      body: "It does not have to be positive, polished, or complete.",
      messageLabel: "Your message",
      placeholder:
        "Say whatever you actually feel. It does not have to be positive, polished, or complete.",
      permissionLabel: "How should I treat this message?",
      methodLabel: "Preferred reply method",
    },
    noContact: {
      heading: "I understand.",
      body: "Confirming this means I will treat your answer as final and will not use this site or another message to keep asking.",
      confirm: "Confirm my decision",
      cancel: "Go back",
    },
  },

  finalMessages: {
    talk: {
      heading: "Thank you for giving the conversation a chance.",
      body: "Choose wherever you feel most comfortable talking. I will meet you there without turning this into pressure.",
    },
    need_time: {
      heading: "I understand.",
      body: "You do not have to rush because of this website. I will respect what you selected.",
    },
    written_message: {
      heading: "Your message has reached me.",
      body: "I will read it carefully and follow the reply preference you selected.",
    },
    no_contact: {
      heading: "I understand your decision.",
      body: "I will not use another message or this page to keep asking. Thank you for being clear. Take care, Palak.",
    },
    closed: {
      heading: "Your answer has been heard.",
      body: "This page is now closed. I understand, and I will respect your decision. Take care, Palak.",
    },
    quietExit: {
      heading: "That is completely okay.",
      body: "You can close this page. Nothing was recorded or sent.",
      linkLabel: "Go to a neutral page",
    },
  },
} as const;

export const enabledMemories = (personalPageContent.memories as readonly MemoryItem[])
  .filter(
    (memory) =>
      memory.enabled &&
      memory.safeToUse &&
      memory.privacy !== "private-do-not-use",
  )
  .sort((a, b) => a.order - b.order);

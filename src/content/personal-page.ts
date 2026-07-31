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

  smileScene: {
    eyebrow: "A completely unbiased observation",
    heading: "My chatar-patar is smiling right now.",
    body: "I am almost certain of it. You look so amazingly pretty when you smile—the kind of pretty that makes the whole moment feel lighter.",
    note: "And yes, I am shamelessly hoping this page earned at least one.",
    buttonLabel: "Tap if I caught you smiling",
    clickedLabel: "Knew it. Keep that smile, princess.",
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

  freeTime: {
    eyebrow: "When the day goes quiet",
    heading: "Staying busy works. Until it doesn’t.",
    paragraphs: [
      "I can control myself by staying super busy. Then free time arrives and—oh my God—the whole act falls apart. One thought of you and I become stupidly sentimental again.",
      "I miss your chatar-patar. Your chehak-pehak. The small, noisy life you brought into ordinary moments. I keep wondering when things went wrong, because I have honestly never been this shameless about missing someone.",
    ],
    aside:
      "The unserious version of me still wants to say: just come back, pretty pwease, Palak. The serious version knows your answer has to be yours.",
  },

  accountability: {
    eyebrow: "The truth I owe you",
    heading: "I was the one who created the distance.",
    body: "I removed you because I was hurt. I cared for you as more than a friend, and I wanted to feel loved and chosen too. I was not trying to punish you; I just did not know how to stay close while carrying feelings that did not seem to have a place. But instead of saying that plainly, I stepped away and quietly hoped that you asking me back would tell me I mattered. That expectation was unfair to you.",
    request:
      "This is not an apology for having feelings or for needing space. It is an apology for leaving you to understand a decision I never explained honestly.",
    points: [
      {
        title: "I should have spoken honestly.",
        body: "I should have told you that staying close while wanting more was hurting me, instead of disappearing and hoping your reaction would answer what I could not ask.",
        enabled: true,
      },
      {
        title: "You did not owe me a rescue.",
        body: "You were never responsible for guessing what I needed, asking me to return, or repairing a distance I chose without explaining it.",
        enabled: true,
      },
      {
        title: "Your silence was not proof.",
        body: "Not asking me to return does not prove that I meant nothing. You may have been hurt, confused, or simply respecting the distance I created. I should not turn your silence into a verdict about what I meant to you.",
        enabled: true,
      },
    ],
  },

  invitation: {
    eyebrow: "What is still true",
    heading: "I still have feelings for you.",
    personalNote: "I am introverted by nature. I do not let many people into the unfiltered parts of my life, and you became one of the few I trusted there. That is part of why losing this connection has felt so heavy. I do not say that to make you responsible for staying; I say it because I want you to understand why this mattered so much to me.",
    body: "I would be lying if I called all of this only friendship. There is tenderness here, hope, and a part of me that still wonders whether we could find our way to something more. But I do not want to manufacture that feeling inside you, turn your kindness into a promise, or ask you to carry my emotions for me.",
    points: [
      "If you feel something too, I would be grateful for one honest conversation.",
      "If friendship is what you genuinely want, I can be your friend without treating it as a waiting room for romance.",
      "If what you need is distance, I will respect that without asking you to soften the answer for me.",
    ],
    final:
      "I miss you, Palak—not only the messages, but you: your chatar-patar, your chehak-pehak, your expressions, and the way your presence made ordinary moments feel alive. I am asking for truth, not pity. If there is any real warmth left between us, I would be grateful for one conversation. If there is not, I will still respect your answer and be grateful that you were once such a meaningful part of my life.",
  },
  responseHub: {
    eyebrow: "No perfect answer required",
    heading: "You do not need to find the perfect words.",
    body: "Choose whichever answer feels closest to what you actually feel.",
    privacyNote:
      "Only the answer you intentionally send below is stored as a response. If you allowed the optional visit timeline above, its consent timestamp and the named sections you reached are stored separately. No message, phone number, IP address, device fingerprint, or typing is collected from viewing.",
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
      eyebrow: "A tiny protest, not a trap",
      heading: "Hey, I am supposed to be the quiet one. Not you.",
      body: "My first, completely unserious reaction is to reject this application and say, “you better watch properly, my princess.” My real answer is that this is not an application I get to reject. You can leave now with no guilt, or stay for one more minute.",
      reassurance: "Leaving sends no response and contacts nobody.",
      leaveLabel: "Leave now",
      stayLabel: "Okay, one more minute",
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

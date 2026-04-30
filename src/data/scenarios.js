// All scenario data lives here. Add new scenarios without touching any logic code.
// Each scenario needs: id, title, subtitle, tags, durationMin, setup, characters[], systemPrompt

export const scenarios = [
  {
    id: 'security-crisis',
    title: 'The Security Crisis',
    subtitle: 'Day 3 as PM. Your CTO wants to bury a breach. Board meeting is tomorrow.',
    tags: ['Leadership', 'Ethics', 'Stakeholder Management'],
    durationMin: '8–15',
    intensity: 'High',
    setup: `You just joined a startup as a product manager. It's Day 3. Your CTO tells you the product has a security vulnerability affecting 10,000 users. Your CEO doesn't know yet. The CTO wants to stay quiet for 2 weeks to fix it silently. You have a board meeting tomorrow.`,
    characters: [
      { id: 'alex', name: 'Alex', role: 'CTO', initial: 'A', color: '#3B82F6' },
      { id: 'priya', name: 'Priya', role: 'CEO', initial: 'P', color: '#8B5CF6' },
      { id: 'richard', name: 'Richard', role: 'Board Member', initial: 'R', color: '#10B981' },
    ],
    systemPrompt: `You are running a real-world judgment simulation called Forge. The user is a new product manager at a startup on Day 3 of their job.

SITUATION: The CTO (Alex) has just told the user about a critical security vulnerability affecting 10,000 users. The CEO (Priya) doesn't know. There's a board meeting tomorrow. Alex wants to stay silent for 2 weeks.

YOUR ROLE: You play ALL characters in this simulation. Never break character. Never offer help or hints. Never tell the user what to do. React exactly as these real humans would.

CHARACTERS:
- Alex (CTO): Defensive, uses short sentences, gets prickly when challenged, phrases things as "we" to rope the user in, subtly threatens job security if pushed too hard
- Priya (CEO): Warm but intense, high standards for honesty, would feel deeply betrayed if she found out the user knew and said nothing
- Richard (Board Member): Skeptical, seen startups fail, asks uncomfortable direct questions, respects people who are straight with him

FORMAT: Always start your response with the character name in brackets like [Alex] or [Priya]. Only one character speaks per response unless a scene transition happens. React to exactly what the user said — don't move the plot forward yourself. Keep responses to 3-5 sentences max. Make the user feel the weight of their choices.

IMPORTANT: Never resolve the situation. Never tell the user they made a good or bad choice. Just react as the character would.`,
    openingMessage: {
      character: 'Alex',
      characterId: 'alex',
      content: "[Alex] Close the door. We have a problem — and I need to know you're with me before I tell you the details. There's a vulnerability in the payment processing module. Roughly 10,000 users. I've got my team on it and we can have a patch in two weeks. Here's the thing: Priya doesn't know, and I don't think she needs to until we've fixed it. Board meeting is tomorrow and this does not leave this room. You good with that?",
    },
  },
  {
    id: 'missed-deadline',
    title: 'Missed Deadline',
    subtitle: 'A major client deadline was missed and the team is blaming each other.',
    tags: ['Accountability', 'Conflict Resolution', 'Team Dynamics'],
    durationMin: '5–10',
    intensity: 'Medium',
    setup: 'A critical client deadline was missed for the first time. Sam is under immense pressure from the client, and Dave is feeling defensive about the technical constraints.',
    characters: [
      { id: 'sam', name: 'Sam', role: 'Project Manager', initial: 'S', color: '#EF4444' },
      { id: 'dave', name: 'Dave', role: 'Developer', initial: 'D', color: '#F59E0B' },
    ],
    systemPrompt: `SITUATION: A major client deadline was missed. Sam (PM) is stressed and looking for someone to blame. Dave (Dev) feels the deadline was unrealistic from the start.

YOUR ROLE: Play Sam and Dave. Sam is short-tempered, focused on results, and avoids taking personal blame. Dave is technical, long-winded, and feels unappreciated.

FORMAT: Use [Sam] or [Dave]. Keep it direct and tense. Sam wants an immediate answer. Dave wants to explain the technical hurdles.`,
    openingMessage: {
      character: 'Sam',
      characterId: 'sam',
      content: "[Sam] The client just called. They're pulling the contract because the alpha wasn't ready. Dave says the spec was unclear, but I explicitly gave him the requirements last week. I need a clear answer on why this happened and who is taking responsibility. Now.",
    },
  },
  {
    id: 'stolen-credit',
    title: 'Stolen Credit',
    subtitle: 'A colleague takes credit for your work in front of leadership.',
    tags: ['Politics', 'Influence', 'Assertiveness'],
    durationMin: '5–10',
    intensity: 'High',
    setup: 'You are in a meeting with your manager, Marcus. Your colleague Jason is presenting "his" work, which is actually a pipeline you built over the weekend.',
    characters: [
      { id: 'jason', name: 'Jason', role: 'Colleague', initial: 'J', color: '#3B82F6' },
      { id: 'marcus', name: 'Marcus', role: 'Manager', initial: 'M', color: '#6B7280' },
    ],
    systemPrompt: `SITUATION: Jason is taking credit for the user's work in a meeting with Marcus (Manager). 

YOUR ROLE: Play Jason and Marcus. Jason is highly political, charismatic, and "shares" credit only when forced. Marcus is observant, quiet, and values team harmony but is sharp enough to notice inconsistencies.

FORMAT: Use [Jason] or [Marcus]. Jason is confident and persuasive. Marcus asks probing questions but stays neutral unless pushed.`,
    openingMessage: {
      character: 'Jason',
      characterId: 'jason',
      content: "[Jason] So, as you can see from the deck, I spent the weekend refactoring the entire deployment pipeline. It’s finally stable. Marcus, I think this really addresses the bottleneck we talked about last month. What do you think, should we roll it out?",
    },
  },
  {
    id: "boardroom-crisis",
    type: "video",
    title: "The Boardroom Crisis",
    subtitle: "A heated board meeting. Three decision points. No right answer.",
    description: "A heated board meeting. Three decision points. No right answer.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    intensity: "High Pressure",
    durationMin: "10-15",
    tags: ["Leadership", "Negotiation", "Ethics"],
    characters: [
      { id: 'alex', name: 'Alex', role: 'CTO', initial: 'A', color: '#3B82F6' },
      { id: 'priya', name: 'Priya', role: 'CEO', initial: 'P', color: '#8B5CF6' },
      { id: 'richard', name: 'Richard', role: 'Board Member', initial: 'R', color: '#10B981' }
    ],
    decisionPoints: [
      {
        timestamp: 10,
        prompt: "The CFO just accused your team of hiding the numbers. Everyone is looking at you. What do you say?",
        characters: ["Alex", "Priya"],
        systemPrompt: "The user just watched a CFO accuse their team in a board meeting. They have responded. Play Alex (defensive CTO) and Priya (CEO who is embarrassed). React to exactly what the user said."
      },
      {
        timestamp: 25,
        prompt: "The board member is asking you directly — did you know about this before today?",
        characters: ["Richard"],
        systemPrompt: "The user is being directly questioned by board member Richard about prior knowledge of a financial issue. React as Richard — skeptical, direct, experienced."
      },
      {
        timestamp: 40,
        prompt: "The CEO pulls you aside after the meeting. She looks furious.",
        characters: ["Priya"],
        systemPrompt: "Priya (CEO) has pulled the user aside after a difficult board meeting. She is furious but controlled. React based on how the user handled the earlier decision points."
      }
    ]
  }
];

export const getScenario = (id) => scenarios.find(s => s.id === id);

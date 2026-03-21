// Safety chatbot for UW students
// Matches user input to the most relevant scenario and returns
// actionable steps + direct phone numbers to call.

const SCENARIOS = [
  {
    id: 'emergency',
    keywords: ['dying', 'dead', 'unconscious', 'not breathing', 'stabbed', 'shot', 'bleeding', 'heart attack', 'overdose', 'collapsed', 'unresponsive'],
    text: "This sounds like a medical emergency. Call 911 immediately — don't wait.",
    contacts: [
      { label: 'Emergency', number: '911' },
      { label: 'UWPD Emergency', number: '206-685-1800' },
    ],
    tips: [
      'Stay on the line with 911 — they will guide you.',
      'If safe to do so, stay with the person until help arrives.',
      'Do not move someone who may have a spinal injury.',
    ],
  },
  {
    id: 'link_train',
    keywords: ['link', 'light rail', 'train', 'uw station', 'u district station', 'capitol hill station', 'sound transit', 'metro rail', 'rail'],
    text: "You're on or near the LINK light rail. Here's what to do:",
    contacts: [
      { label: 'Sound Transit Security (24/7)', number: '888-889-6368' },
      { label: 'King County Metro Transit Police', number: '206-684-1551' },
      { label: '911 (immediate danger)', number: '911' },
    ],
    tips: [
      'Move to a different train car if you feel unsafe — stay near other passengers.',
      'Press the emergency intercom button inside the train car to reach the operator.',
      'Get off at the next station if you need to — UW Station and U District Station both have security.',
      'Stay in well-lit, populated areas of the station platform.',
    ],
  },
  {
    id: 'bus',
    keywords: ['bus', 'metro', 'king county', 'route 44', 'route 48', 'route 70', 'route 49', 'transit', 'stop', 'bus stop', 'on the bus'],
    text: "You're on or near a King County Metro bus. Here's what to do:",
    contacts: [
      { label: 'King County Metro Transit Police', number: '206-684-1551' },
      { label: 'Metro Customer Service', number: '206-553-3000' },
      { label: '911 (immediate danger)', number: '911' },
    ],
    tips: [
      'Sit near the driver or other passengers.',
      'You can ask the driver to stop early or call for help — they are trained for this.',
      'If someone is harassing you, loudly say "Stop" — bystanders often help.',
      'Get off at a busy, well-lit stop and wait inside a business if needed.',
    ],
  },
  {
    id: 'uber_lyft',
    keywords: ['uber', 'lyft', 'rideshare', 'ride share', 'driver', 'cab', 'taxi', 'car'],
    text: "If you feel unsafe in a rideshare, here's what to do:",
    contacts: [
      { label: '911 (immediate danger)', number: '911' },
      { label: 'Uber Safety Line', number: '800-353-8237' },
      { label: 'UWPD Non-Emergency', number: '206-685-4973' },
    ],
    tips: [
      'Use the in-app emergency button in Uber or Lyft — it shares your location with 911.',
      'Share your trip details with a friend before getting in.',
      'Ask to be dropped off at a busy public location if you feel uncomfortable.',
      'Trust your gut — you can cancel and request a new driver at any time.',
    ],
  },
  {
    id: 'on_campus',
    keywords: ['campus', 'uw', 'university', 'quad', 'red square', 'hub', 'odegaard', 'suzzallo', 'library', 'dorm', 'mcmahon', 'lander', 'haggett', 'elm', 'alder', 'maple', 'cedar'],
    text: "You're on the UW campus. UWPD is your first call:",
    contacts: [
      { label: 'UWPD Emergency', number: '206-685-1800' },
      { label: 'UWPD Non-Emergency', number: '206-685-4973' },
      { label: 'UW SafeCampus', number: '206-685-7233' },
      { label: '911', number: '911' },
    ],
    tips: [
      'Blue light emergency phones are located across campus — press the button for immediate UWPD response.',
      'The Husky NightWalk escort service is available — call UWPD non-emergency to request a walking escort.',
      'Stay in populated, well-lit areas and move toward the HUB or other open buildings.',
      'UW SafeCampus handles threats, harassment, and concerning behavior.',
    ],
  },
  {
    id: 'u_district_street',
    keywords: ['u district', 'university ave', 'the ave', 'u-district', 'udistrict', '45th', '50th', 'brooklyn', 'roosevelt', 'off campus', 'apartment', 'walking home', 'walking back', 'street'],
    text: "You're in the U-District off campus. Here's what to do:",
    contacts: [
      { label: 'Seattle Police Non-Emergency', number: '206-625-5011' },
      { label: 'UWPD Non-Emergency', number: '206-685-4973' },
      { label: '911 (immediate danger)', number: '911' },
    ],
    tips: [
      'Walk toward busy, well-lit streets — University Ave (The Ave) and 45th St have more foot traffic.',
      'Duck into an open business — cafes, convenience stores, and restaurants are safe havens.',
      'Call a friend and stay on the phone while you walk.',
      'UWPD NightWalk escorts can walk with you even slightly off campus — call and ask.',
    ],
  },
  {
    id: 'following',
    keywords: ['following me', 'being followed', 'someone following', 'stalking', 'stalker', 'tailing me', 'wont leave me alone', "won't leave"],
    text: "If you think someone is following you, don't go home — lead them to people.",
    contacts: [
      { label: '911', number: '911' },
      { label: 'UWPD Emergency', number: '206-685-1800' },
      { label: 'Seattle Police Non-Emergency', number: '206-625-5011' },
    ],
    tips: [
      'Change direction — if they change too, trust your instinct.',
      'Walk into the nearest open business and tell staff you feel unsafe.',
      'Call 911 and stay on the line — describe the person and your location.',
      'Do NOT go to your home or dorm — you don\'t want them to know where you live.',
      'Stay in public, well-lit areas with other people around.',
    ],
  },
  {
    id: 'harassment',
    keywords: ['harassing', 'harassment', 'threatening', 'threatened', 'yelling at me', 'aggressive', 'confrontational', 'verbal', 'shouting'],
    text: "If someone is harassing or threatening you:",
    contacts: [
      { label: 'Seattle Police Non-Emergency', number: '206-625-5011' },
      { label: 'UWPD Non-Emergency', number: '206-685-4973' },
      { label: '911 (if escalating)', number: '911' },
    ],
    tips: [
      'Do not engage or escalate — disengage and walk away calmly.',
      'Move toward other people or into a business.',
      'If it escalates to physical threats, call 911 immediately.',
      'Document what happened (time, location, description) for a police report.',
    ],
  },
  {
    id: 'assault',
    keywords: ['attacked', 'attack', 'assault', 'hit', 'punched', 'kicked', 'mugged', 'robbery', 'robbed', 'stole', 'weapon', 'knife', 'gun'],
    text: "Your safety is the priority. If you are in immediate danger, call 911 now.",
    contacts: [
      { label: '911', number: '911' },
      { label: 'UWPD Emergency', number: '206-685-1800' },
      { label: 'Harborview Medical Center', number: '206-744-3000' },
    ],
    tips: [
      'Get to a safe location first — distance from the threat is your priority.',
      'Call 911 and describe your location, what happened, and any injuries.',
      'Do not pursue or confront the person who attacked you.',
      'Seek medical attention even if injuries seem minor.',
    ],
  },
  {
    id: 'female_safety',
    keywords: [
      'woman', 'women', 'female', 'girl', 'sexual assault', 'sexually assaulted', 'rape', 'raped',
      'groped', 'touched without consent', 'domestic', 'domestic violence', 'abusive', 'abuse',
      'boyfriend', 'ex boyfriend', 'partner hurting', 'intimate partner', 'dv', 'gender based',
      'unsafe as a woman', 'being followed as a woman', 'creep', 'catcalled', 'catcalling',
    ],
    text: "You are not alone and what you're experiencing is not okay. Here's immediate support and who to call:",
    contacts: [
      { label: 'National Sexual Assault Hotline (RAINN)', number: '800-656-4673' },
      { label: 'National DV Hotline (24/7)', number: '800-799-7233' },
      { label: 'UW Safecampus (threats/harassment)', number: '206-685-7233' },
      { label: 'Harborview Center for Sexual Assault', number: '206-744-1600' },
      { label: 'UWPD Emergency', number: '206-685-1800' },
      { label: '911', number: '911' },
    ],
    tips: [
      'You can text "HELLO" to 741741 (Crisis Text Line) if you cannot speak safely.',
      'Harborview\'s Center for Sexual Assault & Traumatic Stress provides 24/7 care — no police report required to receive medical help.',
      'UW\'s Title IX office (206-616-2028) handles sexual harassment and assault involving UW students or staff.',
      'If you are in immediate danger, get to a public place with other people — a business, restaurant, or campus building.',
      'The UW Women\'s Center (HUB 201) is a safe space on campus: 206-685-1090.',
      'You do not have to report to police to access support — advocates at RAINN can help you understand all your options.',
      'If you need to leave a dangerous living situation, call the DV hotline — they can help find emergency shelter.',
    ],
    followUp: "Can you tell me a bit more about where you are right now — are you on campus, in the U-District, or somewhere else? I can give you more specific nearby resources.",
  },
  {
    id: 'mental_health',
    keywords: ['mental health', 'crisis', 'panic', 'panic attack', 'anxiety', 'scared', 'overwhelmed', 'breakdown', 'suicidal', 'self harm', 'hurting myself'],
    text: "You're not alone. Here's immediate support:",
    contacts: [
      { label: 'Crisis Text Line (text HOME)', number: '741741' },
      { label: '988 Suicide & Crisis Lifeline', number: '988' },
      { label: 'UW Counseling Center', number: '206-543-1240' },
      { label: 'Hall Health (UW)', number: '206-543-5030' },
    ],
    tips: [
      'Text HOME to 741741 to reach a crisis counselor right now.',
      'Call 988 — it\'s free, confidential, and available 24/7.',
      'If you\'re on campus, go to Hall Health or the UW Counseling Center.',
      'You can also go to any emergency room — Harborview is the closest major hospital.',
    ],
  },
  {
    id: 'nightwalk',
    keywords: ['escort', 'walk me', 'walk home', 'night walk', 'nightwalk', 'alone at night', 'dark', 'late night', 'late at night'],
    text: "UWPD offers a free NightWalk escort service — a trained officer or volunteer will walk with you.",
    contacts: [
      { label: 'UWPD NightWalk / Non-Emergency', number: '206-685-4973' },
    ],
    tips: [
      'Call UWPD non-emergency and ask for a NightWalk escort — it\'s free and no questions asked.',
      'Available for on-campus and nearby off-campus locations.',
      'You can also use the Husky NightWalk app to request an escort.',
      'If you\'re waiting, stay inside a building or well-lit area.',
    ],
  },
];

const FALLBACK = {
  text: "I want to make sure I give you the right help. Can you tell me a bit more? For example: are you on the LINK, a bus, on campus, or walking in the U-District? What's happening?",
  contacts: [
    { label: '911 (immediate danger)', number: '911' },
    { label: 'UWPD Emergency', number: '206-685-1800' },
    { label: 'Seattle Police Non-Emergency', number: '206-625-5011' },
  ],
};

export function getResponse(input) {
  const lower = input.toLowerCase();

  for (const scenario of SCENARIOS) {
    if (scenario.keywords.some(kw => lower.includes(kw))) {
      return {
        text: scenario.text,
        contacts: scenario.contacts,
        tips: scenario.tips,
        followUp: scenario.followUp || null,
      };
    }
  }

  return FALLBACK;
}

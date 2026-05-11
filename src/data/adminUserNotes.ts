// Admin-only notes about specific users — hardcoded so we don't need a
// separate notes table for low-volume out-of-band feedback (DMs, Reddit,
// in-person convos). Add new entries by editing this file. The admin
// analytics page matches notes to users via lowercased name OR email.
//
// When notes outgrow this file (50+ entries, multiple admins), promote
// to a real `admin_user_notes` table with an insert UI.

export interface AdminUserNote {
  source: 'reddit' | 'dm' | 'email' | 'in_person' | 'twitter' | 'other'
  author?: string  // External handle, e.g. Reddit username
  url?: string     // Link back to the source thread
  date: string     // YYYY-MM-DD
  note: string
}

// Keys are lowercased email OR lowercased display-name. The admin page
// tries email first, then name. Use whatever you have — either works.
export const USER_NOTES: Record<string, AdminUserNote[]> = {
  'kevin johnson': [
    {
      source: 'reddit',
      author: 'Ok_Leave3364',
      date: '2026-05-09',
      note:
        "I was on the platform for a little while yesterday. It's unique and interesting. Different approach is good. " +
        'In my experience to compete you need a very good image and video generation. Both conversational and prompt. ' +
        'As the male species no matter how imaginative we may be we are still visual creatures lol. ' +
        "You're platform is unique and fun but to retain your customers your going to need more NSFW content and images. " +
        "I'll be back on the platform again sometime today and will give you more feedback later. " +
        "You've got a great and unique style with really good potential! Ttyl",
    },
    {
      source: 'reddit',
      author: 'Ok_Leave3364',
      date: '2026-05-08',
      note:
        "Ive had a quick look at this new platform. Great unique idea. Pick a destination and/or storyline. Mostly SFW! " +
        "By that I mean your in control of the SFW or NSFW chat content. No image or video generation available.! " +
        "Images as the RP progresses will appear at pre determined intervals. Quick and easy sign up and go! Give it a try!",
    },
  ],
}

/** Look up notes for a user by either email or display name (both lowercased). */
export function getNotesFor(email: string | null, name: string | null): AdminUserNote[] {
  if (email && USER_NOTES[email.toLowerCase()]) return USER_NOTES[email.toLowerCase()]
  if (name && USER_NOTES[name.toLowerCase()]) return USER_NOTES[name.toLowerCase()]
  return []
}

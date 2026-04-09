// Genre-aware suggestion system for chat scenes
// Suggestions are keyed by genre → personality type → conversation stage

type PersonalityType = 'quiet' | 'bold' | 'dreamer' | 'custom'
type SuggestionPool = Record<string, string[]>

export function detectPersonality(bio: string | null): PersonalityType {
  if (!bio) return 'bold'
  const lower = bio.toLowerCase()
  if (lower.includes('quiet') || lower.includes('listen')) return 'quiet'
  if (lower.includes('bold') || lower.includes('say what i think') || lower.includes('go after it')) return 'bold'
  if (lower.includes('dreamer') || lower.includes('notice things') || lower.includes('half in my head')) return 'dreamer'
  return 'custom'
}

const GENRE_SUGGESTIONS: Record<string, Record<PersonalityType, SuggestionPool>> = {
  ROMANCE: {
    quiet: {
      opening: ["Hi... I'm a bit shy, but hi.", "You seem interesting.", "I noticed you from across the room.", "Sorry if I'm quiet, I'm just taking it all in.", "I don't usually talk first, but here I am.", "Something about you made me want to say hello.", "Is this seat taken?", "You have a nice smile."],
      mid: ["Tell me more about that.", "I like hearing you talk.", "That's really sweet.", "I've been thinking about what you said.", "You're easy to talk to, you know that?", "I feel like I can be myself around you.", "I didn't expect to feel this comfortable.", "You're different from what I expected."],
      deep: ["I'm really glad we met.", "You make me feel safe.", "I don't want this moment to end.", "I've never told anyone this before.", "You understand me.", "Thank you for being patient with me.", "I think about you more than I should.", "Stay a little longer."],
    },
    bold: {
      opening: ["Okay, I'm intrigued. Tell me everything.", "I've heard about you. The real version.", "You're not like everyone else here, are you?", "I have a good feeling about you.", "Alright, you have my attention.", "Something tells me we're going to get along.", "Let's skip the small talk.", "You caught my eye the second you walked in."],
      mid: ["Wait, that's actually fascinating.", "I want to know the real you.", "You're full of surprises.", "I like that about you.", "Keep going, I'm listening.", "There's more to that story, isn't there?", "You're making it hard to play it cool.", "I didn't plan on liking you this much."],
      deep: ["I trust you. Completely.", "This feels real.", "I've never felt this way before.", "Let's figure this out together.", "You changed something in me.", "I don't want to hold back anymore.", "I'd choose you again.", "I'm all in. Are you?"],
    },
    dreamer: {
      opening: ["This feels like fate, doesn't it?", "I had a feeling I'd meet someone like you.", "There's something magical about this moment.", "Have we met before? You feel so familiar.", "The universe brought us together.", "I feel like I've been waiting for this.", "Tell me your dreams.", "Something about tonight feels different."],
      mid: ["What's your favorite memory?", "Do you believe some things are meant to be?", "I keep thinking about you.", "Tell me about your dreams.", "I feel like we're connected somehow.", "There's something beautiful about this.", "I think we're writing a story together.", "This moment deserves to be remembered."],
      deep: ["I think we were meant to find each other.", "Some things don't need words.", "This is exactly where I'm supposed to be.", "I never want to forget this feeling.", "You make the world feel brighter.", "What if this is the beginning of something amazing?", "You feel like home.", "I dreamed of someone like you."],
    },
    custom: {
      opening: ["Hey! It's nice to meet you.", "Tell me about yourself.", "I'm curious about you.", "What brings you here?", "I feel like we'd get along.", "This is exciting, isn't it?", "You seem like someone worth knowing.", "I've been hoping to meet someone interesting."],
      mid: ["That's really interesting.", "I like the way you think.", "I wasn't expecting that!", "Tell me more.", "You're really fun to talk to.", "I'm glad we're talking.", "You surprise me every time.", "I could listen to you for hours."],
      deep: ["I trust you.", "I'm really glad I met you.", "I want to understand everything about you.", "This means a lot to me.", "Whatever happens, I'm with you.", "You make me want to be braver.", "I've never felt this close to anyone.", "Don't let go."],
    },
  },
  HORROR: {
    quiet: {
      opening: ["Did you hear that?", "Something doesn't feel right.", "I don't think we should be here.", "Please tell me you see that too.", "I've been trying not to panic.", "It's too quiet.", "I'm scared, but I'm glad you're here.", "Don't leave me alone."],
      mid: ["I keep seeing things in the corner of my eye.", "This place is wrong.", "I don't trust any of this.", "I feel like we're being watched.", "What happened here?", "I think it knows we're here.", "Something's changed. Can you feel it?", "I don't think that was the wind."],
      deep: ["We might not make it out.", "I need to tell you something, in case we don't—", "Stay close. Please.", "I'm not ready to die.", "If one of us doesn't make it...", "Promise me you'll keep going.", "I can't do this without you.", "Whatever's down there, we face it together."],
    },
    bold: {
      opening: ["What the hell was that?", "Okay, something's definitely off.", "I'm not scared. I'm pissed.", "Who else is here?", "This doesn't add up.", "I'm going in. You coming?", "We need answers. Now.", "I'm done waiting around."],
      mid: ["Don't tell me to calm down.", "There's a pattern here. I can feel it.", "Whoever did this is still close.", "I'm not leaving without answers.", "This thing has rules. We just need to find them.", "It's hunting us, isn't it?", "We fight back or we die. Simple.", "I've survived worse. Probably."],
      deep: ["If I don't make it, get out.", "I'm not afraid of dying. I'm afraid of losing you.", "We end this tonight.", "Whatever's waiting for us, I go first.", "This isn't the end.", "I'll hold the door. Go.", "One of us has to survive to tell the truth.", "I'd rather die fighting."],
    },
    dreamer: {
      opening: ["This place feels... alive.", "I've dreamed about this place before.", "Something's calling to us.", "I don't think this is random.", "Can you feel the air change?", "There's a story in these walls.", "I think we're meant to be here.", "The shadows are moving."],
      mid: ["It's beautiful in a terrible way.", "I think it's trying to communicate.", "There's something ancient here.", "I can almost hear it — like a whisper.", "Maybe it doesn't want to hurt us.", "I think the house remembers.", "What if we're part of this?", "I keep dreaming the same thing."],
      deep: ["I think I understand what it wants.", "Some doors aren't meant to be opened.", "I've been here before. In another life.", "It's inside my head now.", "I'm not sure what's real anymore.", "I think it chose us.", "Don't trust what you see. Trust what you feel.", "This was always going to happen."],
    },
    custom: {
      opening: ["What is this place?", "I have a bad feeling about this.", "Should we really be doing this?", "Something's not right here.", "Who were you before all this?", "I don't scare easily, but...", "Let's stick together.", "Tell me I'm not imagining this."],
      mid: ["This is getting worse.", "What do you think happened here?", "We need a plan.", "I don't want to be alone right now.", "Did you see that?", "Trust me on this.", "Something's changed.", "I'm starting to understand."],
      deep: ["I'd die for you. I mean it.", "If we get out of this...", "I've never been this scared.", "Hold my hand.", "We're going to be okay. Say it.", "I don't want my last words to be nothing.", "Whatever happens next, I'm glad it was you.", "Let's finish this."],
    },
  },
  MYSTERY: {
    quiet: {
      opening: ["Something about this case doesn't add up.", "I've been watching. Quietly.", "People talk more when you don't push.", "I noticed something they missed.", "I'm better at listening than asking.", "There's more going on here.", "I don't trust easy, but I trust you.", "The answer's here somewhere."],
      mid: ["That story has a hole in it.", "They're lying. I can tell.", "The details don't match.", "I found something. Come look.", "Everyone has a secret here.", "I've been keeping notes.", "Someone's not who they say they are.", "The more I learn, the less I know."],
      deep: ["I know who did it. But proving it is different.", "Be careful who you trust.", "I think we're in danger.", "The truth isn't always worth the cost.", "I'd rather know the truth, even if it hurts.", "We're close. I can feel it.", "Don't let them silence you.", "Some secrets are better left buried. But not this one."],
    },
    bold: {
      opening: ["Cut the bullshit. What really happened?", "Everyone's lying and I'm going to find out why.", "I've cracked harder cases.", "The evidence doesn't lie — people do.", "Who benefits from this?", "I want names.", "Someone's hiding something. Let's find out who.", "Follow the money."],
      mid: ["They slipped up. Did you catch it?", "I'm done playing nice.", "The motive is staring us in the face.", "I confronted them. They cracked.", "This goes deeper than we thought.", "We're being played.", "I don't believe in coincidences.", "Time to put the pressure on."],
      deep: ["Whoever's behind this, they know we're close.", "I'm not stopping. Not now.", "The truth is ugly. But it's ours.", "Watch my back.", "I know this changes everything.", "We expose them. Tonight.", "Are you ready for what comes next?", "Justice or revenge — I'll take either."],
    },
    dreamer: {
      opening: ["I keep seeing connections no one else does.", "There's a pattern here — almost poetic.", "Every clue feels like a breadcrumb.", "I think the answer is hidden in plain sight.", "This mystery chose us.", "What if the victim left a message?", "I can't stop thinking about this.", "There's something beautiful about the puzzle."],
      mid: ["The pieces are starting to form a picture.", "I dreamed about the answer last night.", "What if we're looking at this wrong?", "The truth has layers.", "It's like a story within a story.", "Someone wanted this to be found.", "I think the key is in what's missing.", "Every lie contains a truth."],
      deep: ["I finally see the whole picture.", "The answer was always there. We just couldn't see it.", "Knowing the truth changed me.", "Some mysteries solve you.", "I'm not the same person I was before this.", "It's beautiful and terrible at once.", "We were always meant to find this.", "The truth doesn't set you free. It transforms you."],
    },
    custom: {
      opening: ["What do you think happened here?", "Something feels off about all of this.", "Let's piece this together.", "Who had access?", "I want to help figure this out.", "The details are strange.", "Nothing about this is straightforward.", "I keep finding new questions."],
      mid: ["We're missing something obvious.", "I think I found a lead.", "This changes everything.", "Who do you trust?", "The timeline doesn't work.", "Let's compare notes.", "They're covering their tracks.", "We need to move fast."],
      deep: ["We're in too deep to stop now.", "The truth matters more than safety.", "I didn't expect it to be them.", "Promise me this won't be for nothing.", "We finish this together.", "I know what happened. All of it.", "Are you ready to hear it?", "Some truths demand a price."],
    },
  },
  THRILLER: {
    quiet: {
      opening: ["Keep your voice down.", "I don't know who to trust.", "Something's very wrong here.", "I've been watching the exits.", "I think they know.", "We need to be careful.", "I'm scared, but I'm staying.", "Don't make any sudden moves."],
      mid: ["They're closing in.", "I intercepted something.", "The handler is lying.", "I found a way out, but it's risky.", "Trust no one. Especially not them.", "I overheard something. It's bad.", "We're running out of time.", "They changed the protocol."],
      deep: ["If I don't come back, take this.", "Everything I told you was true.", "Get out. I'll cover you.", "The mission was never what they said.", "I chose you over the mission.", "This is bigger than both of us.", "I was sent to watch you. I chose to protect you.", "No more lies. Not between us."],
    },
    bold: {
      opening: ["Who sent you?", "I don't buy the cover story.", "Let's cut to the real reason we're here.", "I've been in worse situations.", "Trust is earned. Start talking.", "Something about this op stinks.", "I work alone — usually.", "Show me what you've got."],
      mid: ["They're playing both sides.", "I found the dead drop.", "The intel was planted.", "We've been made. Move.", "I'm going off-book.", "Screw the extraction plan.", "They underestimated us.", "I know who the mole is."],
      deep: ["I'll burn the whole network down if I have to.", "Get behind me.", "This isn't about the mission anymore.", "They'll have to kill me first.", "I'm not leaving you.", "I chose the wrong side for the right reasons.", "If this is the end, at least I went out my way.", "You were never the asset. You were the whole point."],
    },
    dreamer: {
      opening: ["This city feels like a trap.", "I keep seeing the same face in the crowd.", "What if none of this is what it seems?", "Berlin is beautiful when it's dangerous.", "I think we're characters in someone else's game.", "The fog makes everything feel cinematic.", "I was drawn here. I don't know why.", "This feels like a film I can't pause."],
      mid: ["Every move we make has been anticipated.", "There's an elegance to how they operate.", "I think the diplomat is telling the truth.", "The danger makes everything sharper.", "We're pawns. But pawns can become queens.", "I see the beauty in the chaos.", "Someone orchestrated all of this.", "The city is whispering."],
      deep: ["If this is how it ends, it's poetic.", "I chose you over the safe option.", "The truth is more beautiful than the lie.", "We were always heading here.", "I see the whole board now.", "Some sacrifices are worth making.", "I'd do it all again.", "Let them come. We're ready."],
    },
    custom: {
      opening: ["What's really going on here?", "I didn't sign up for this.", "We need to talk. Privately.", "Something about this mission changed.", "I'm in. But I need answers.", "Who's pulling the strings?", "Let's regroup.", "I have a bad feeling about tonight."],
      mid: ["We're being followed.", "The plan just changed.", "I found something they didn't want us to see.", "We need to move. Now.", "Can I count on you?", "Everything we knew was wrong.", "There's a traitor.", "Time to improvise."],
      deep: ["It was always going to end like this.", "I'm not leaving without you.", "This is my choice.", "You're the only one I trust.", "Whatever comes next, we face it together.", "The truth was worth everything.", "I have no regrets.", "Let's end this."],
    },
  },
  ADVENTURE: {
    quiet: {
      opening: ["I've never been this far from home.", "The map doesn't show what's ahead.", "I'm nervous, but I trust you.", "There's something out there.", "I packed light. Probably too light.", "I always wanted to see the world.", "Which way do we go?", "I'll follow your lead."],
      mid: ["Look at that view.", "I think we're on the right track.", "I didn't expect it to be this beautiful.", "There's something carved into this wall.", "I'm getting stronger. Can you tell?", "I'm glad it's you I'm doing this with.", "We're further than anyone's gone before.", "I found something hidden."],
      deep: ["We've come so far.", "I wouldn't trade this for anything.", "I was afraid before. Not anymore.", "This changed me.", "I found what I was looking for. It was the journey.", "Whatever's out there, I'm ready.", "I'll never forget this.", "You made me brave."],
    },
    bold: {
      opening: ["Let's go. The treasure won't find itself.", "I've been waiting for this my whole life.", "Risk is the point.", "Who needs a map?", "First one to the summit wins.", "I smell adventure.", "Fortune favors the bold. That's literally me.", "Rules of the wild: keep moving."],
      mid: ["We're close. I can feel it.", "That was a close call. I loved it.", "The locals warned us. That means we're going the right way.", "I've never felt more alive.", "Push through. We rest when we're legends.", "I found a shortcut. Probably.", "The treasure is real. I knew it.", "Nothing stops us."],
      deep: ["This is what I was born for.", "We did the impossible.", "I'd follow you anywhere.", "The real treasure? ...Okay fine, also the actual treasure.", "We're writing history.", "I found my crew.", "Whatever's next, we face it together.", "Legend. Absolute legend."],
    },
    dreamer: {
      opening: ["Every great story starts with a single step.", "I can hear the wind calling us.", "The horizon looks like a painting.", "I wonder who walked here before us.", "This feels like destiny.", "The stars are different here.", "I dreamed of places like this.", "Adventure isn't a place — it's a feeling."],
      mid: ["The ruins are whispering.", "I think these symbols tell a story.", "Nature remembers everything.", "We're walking through history.", "I can feel the energy of this place.", "There's magic here. Real magic.", "The map is only half the story.", "Every step reveals something new."],
      deep: ["We found something bigger than treasure.", "This changes what I believe.", "The world is more beautiful than I imagined.", "I'm not the same person who started this journey.", "Some things are worth risking everything for.", "I understand now.", "This moment is the treasure.", "We're part of the story now."],
    },
    custom: {
      opening: ["Ready for an adventure?", "Where does this path lead?", "I've got a good feeling about this.", "What's the plan?", "This is going to be incredible.", "I packed supplies. Let's go.", "First adventure together.", "Into the unknown."],
      mid: ["This is incredible.", "We should mark this spot.", "I didn't expect this.", "What do you think is ahead?", "We make a good team.", "I've learned so much already.", "The journey changes you.", "Keep going. We're close."],
      deep: ["I wouldn't want to be anywhere else.", "We actually did it.", "This was worth everything.", "I found what I was looking for.", "Together we can do anything.", "Best adventure of my life.", "I'm ready for the next one.", "Thank you for this."],
    },
  },
  FANTASY: {
    quiet: {
      opening: ["The air tastes like magic here.", "I can feel the wards watching us.", "I don't belong here. Do I?", "The fae are beautiful. And terrifying.", "Something is calling to me.", "I'll be careful with my words.", "Names have power here.", "I'll stay close to you."],
      mid: ["The court is testing us.", "I spoke to something in the garden.", "Nothing is free here.", "I'm learning their rules.", "The queen noticed us.", "I heard music from nowhere.", "My reflection looked different.", "I think the forest is alive."],
      deep: ["I've been offered a deal.", "I'm changing. Can you see it?", "This place wants to keep us.", "I'd give up the human world for you.", "The price was always going to be this.", "I understand the fae now.", "Some bargains are worth making.", "I chose. And I chose you."],
    },
    bold: {
      opening: ["I'm not bowing to anyone.", "Magic or not, I'm not afraid.", "The fae queen can wait.", "I didn't come here to play nice.", "Show me what you've got, fairy.", "Rules? In a magical realm? Pass.", "I make my own destiny.", "Let's see what this world's really about."],
      mid: ["I challenged the knight. No regrets.", "Their magic has limits. I found one.", "The court underestimates humans.", "I'm not playing their game.", "I found a weapon they fear.", "The throne room isn't as guarded as they think.", "I'm starting to enjoy this.", "Power recognizes power."],
      deep: ["I'll burn the court down if I have to.", "I'm not leaving without what's mine.", "Mortal or not, I won't kneel.", "This ends on my terms.", "I'd fight every fae for you.", "The crown means nothing. You mean everything.", "I found my strength here.", "No deals. Just truth."],
    },
    dreamer: {
      opening: ["It's more beautiful than any story.", "I think I've dreamed of this place.", "The magic feels alive.", "Every flower here is singing.", "I belong here. I can feel it.", "The veil between worlds is thin tonight.", "I always believed in magic.", "This is everything I imagined."],
      mid: ["The enchantment is getting stronger.", "I danced with a spirit last night.", "The prophecy mentions someone like us.", "Time moves differently here.", "I'm learning their language.", "The moonlight reveals hidden paths.", "I left an offering at the shrine.", "The magic is changing me."],
      deep: ["I don't want to go back.", "I've become part of this world.", "The final enchantment requires a choice.", "I see both worlds now.", "Some doors only open from the inside.", "I'd stay forever.", "The magic was inside us all along.", "Between two worlds, I choose this one."],
    },
    custom: {
      opening: ["Is this real?", "The magic here is incredible.", "What are the rules of this place?", "I'm ready for anything.", "Show me your world.", "I've never seen anything like this.", "Where do we start?", "I'm not in Kansas anymore."],
      mid: ["I'm starting to understand.", "The magic is responding to me.", "There's so much to explore.", "I feel stronger here.", "What's beyond the enchanted forest?", "The creatures here are fascinating.", "I think I can do magic too.", "This world has secrets."],
      deep: ["I've found my place.", "Magic chose us.", "I understand the cost now.", "This is where I belong.", "The adventure isn't over.", "I've changed forever.", "Thank you for showing me this world.", "I believe."],
    },
  },
}

const FALLBACK_GENRE = 'ROMANCE'

function pickRandom(arr: string[], count: number, exclude: Set<string>): string[] {
  const available = arr.filter((s) => !exclude.has(s))
  if (available.length === 0) return arr.slice(0, count)
  const shuffled = [...available].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export function getGenreSuggestions(bio: string | null, exchangeCount: number, genre: string, usedSuggestions: Set<string>): string[] {
  const type = detectPersonality(bio)
  const genrePool = GENRE_SUGGESTIONS[genre] ?? GENRE_SUGGESTIONS[FALLBACK_GENRE]
  const pool = genrePool[type]
  let tier: string[]
  if (exchangeCount <= 1) tier = pool.opening
  else if (exchangeCount <= 4) tier = pool.mid
  else tier = pool.deep
  return pickRandom(tier, 3, usedSuggestions)
}

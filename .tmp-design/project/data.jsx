// ============================================================
// Sample data — 11 weeks of realistic training history
// ============================================================

const EXERCISES = [
  {
    id: 'pullup',
    name: 'Pull-up',
    muscle: 'Back',
    secondary: ['Arms'],
    difficulty: 'Advanced',
    equipment: 'Bodyweight · Bar',
    pr: { value: 12, unit: 'reps', date: 'Apr 14' },
    sets: 3,
    reps: '6-10',
    cue: 'Drive elbows to ribs · pause at the top',
  },
  {
    id: 'row',
    name: 'Bent-over Row',
    muscle: 'Back',
    secondary: ['Arms'],
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    pr: { value: 185, unit: 'lb', date: 'Apr 09' },
    sets: 4,
    reps: '8',
    cue: 'Hinge to 45° · pull bar to belt · slow eccentric',
  },
  {
    id: 'press',
    name: 'Shoulder Press',
    muscle: 'Shoulders',
    secondary: ['Arms', 'Chest'],
    difficulty: 'Intermediate',
    equipment: 'Dumbbell',
    pr: { value: 70, unit: 'lb', date: 'Apr 21' },
    sets: 4,
    reps: '6-8',
    cue: 'Stack ribs over hips · press straight up',
  },
  {
    id: 'squat',
    name: 'Back Squat',
    muscle: 'Legs',
    secondary: [],
    difficulty: 'Advanced',
    equipment: 'Barbell',
    pr: { value: 245, unit: 'lb', date: 'Apr 18' },
    sets: 5,
    reps: '5',
    cue: 'Brace · break at hips and knees together · drive the floor',
  },
  {
    id: 'lunge',
    name: 'Walking Lunge',
    muscle: 'Legs',
    secondary: [],
    difficulty: 'Beginner',
    equipment: 'Dumbbell',
    pr: { value: 50, unit: 'lb', date: 'Apr 11' },
    sets: 3,
    reps: '10 / leg',
    cue: 'Long stride · knee tracks over toes · upright torso',
  },
];

const MUSCLE_GROUPS = ['Legs', 'Shoulders', 'Chest', 'Back', 'Arms'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

// 11 weeks of sets per week (most recent last)
const SETS_PER_WEEK = [38, 42, 36, 48, 44, 51, 47, 53, 49, 58, 62];
const WEEK_LABELS = ['W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12', 'W13', 'W14', 'W15', 'W16'];

// Muscle group volume distribution (last 4 weeks, total sets per group)
const MUSCLE_VOLUME = {
  Legs: 78,
  Shoulders: 52,
  Chest: 41,
  Back: 71,
  Arms: 38,
};

// Bodyweight trend, lb, last 11 entries
const BODYWEIGHT = [172.4, 172.8, 173.1, 173.4, 173.0, 173.6, 174.1, 174.3, 174.0, 174.6, 175.1];

// PR progression — point per month, last 5 months
const PR_HISTORY = {
  squat:  [205, 215, 225, 235, 245],
  press:  [55,  60,  65,  68,  70],
  row:    [155, 165, 170, 180, 185],
  pullup: [6,   8,   9,   10,  12],
  lunge:  [35,  40,  45,  45,  50],
};

// Recent sessions
const RECENT_SESSIONS = [
  { date: 'Today',      title: 'Lower Power',     duration: '52 min', sets: 18, focus: 'Legs' },
  { date: 'Yesterday',  title: 'Push Volume',     duration: '47 min', sets: 16, focus: 'Shoulders' },
  { date: '2 days ago', title: 'Pull Strength',   duration: '54 min', sets: 19, focus: 'Back' },
  { date: '4 days ago', title: 'Lower Hypertrophy', duration: '61 min', sets: 21, focus: 'Legs' },
  { date: '5 days ago', title: 'Mobility + Core', duration: '32 min', sets: 12, focus: 'Mixed' },
  { date: '1 week ago', title: 'Push Strength',   duration: '49 min', sets: 17, focus: 'Chest' },
];

const USER = {
  name: 'Maaz',
  streak: 14,
  weekTarget: 5,
  weekDone: 4,
  totalSets: SETS_PER_WEEK.reduce((a, b) => a + b, 0),
  level: 'Intermediate',
};

Object.assign(window, {
  EXERCISES, MUSCLE_GROUPS, DIFFICULTIES,
  SETS_PER_WEEK, WEEK_LABELS, MUSCLE_VOLUME, BODYWEIGHT, PR_HISTORY,
  RECENT_SESSIONS, USER,
});

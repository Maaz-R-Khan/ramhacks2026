export const exerciseGroups = [
  {
    group: 'Chest',
    exercises: [
      {
        id: 'pushup',
        name: 'Push-up',
        difficulty: 'Beginner',
        targetJoints: ['Elbow', 'Shoulder', 'Hip'],
        repDetection: {
          joints: ['left_elbow', 'right_elbow'],
          inThreshold: 90,   // enters active phase when avg elbow < 90°
          outThreshold: 160, // rep complete when elbow returns > 160°
        },
        steps: [
          'Start in a plank with hands shoulder-width apart, arms straight.',
          'Lower your chest until it nearly touches the floor, elbows at ~45°.',
          'Push back up to the start position with arms fully extended.',
          'Keep your core tight and body in a straight line throughout.',
        ],
        keyAngles: [
          { joint: 'Elbow', target: '90° at bottom', note: 'Avoid flaring past 90°' },
          { joint: 'Hip', target: '180° (flat plank)', note: 'No sagging or piking' },
          { joint: 'Shoulder', target: '45° from torso', note: 'Elbows not too wide' },
        ],
        commonMistakes: ['Hips sagging', 'Elbows flaring out wide', 'Partial range of motion'],
      },
      {
        id: 'wide-pushup',
        name: 'Wide Push-up',
        difficulty: 'Beginner',
        targetJoints: ['Elbow', 'Shoulder', 'Hip'],
        repDetection: {
          joints: ['left_elbow', 'right_elbow'],
          inThreshold: 90,
          outThreshold: 160,
        },
        steps: [
          'Start in a plank with hands wider than shoulder-width.',
          'Lower your chest toward the floor, keeping elbows pointing out to the sides.',
          'Push back up to full arm extension.',
          'Maintain a straight line from head to heels.',
        ],
        keyAngles: [
          { joint: 'Elbow', target: '90° at bottom', note: 'Wider flare than standard push-up' },
          { joint: 'Hip', target: '180° (flat plank)', note: 'No sagging or piking' },
          { joint: 'Shoulder', target: 'Wide abduction', note: 'Hits outer chest more' },
        ],
        commonMistakes: ['Hips sagging', 'Hands too wide causing shoulder strain', 'Partial range of motion'],
      },
    ],
  },
  {
    group: 'Back',
    exercises: [
      {
        id: 'pullup',
        name: 'Pull-up',
        difficulty: 'Intermediate',
        targetJoints: ['Elbow', 'Shoulder', 'Wrist'],
        repDetection: {
          joints: ['left_elbow', 'right_elbow'],
          inThreshold: 70,   // enters active phase when elbow < 70° (chin over bar)
          outThreshold: 150, // rep complete when elbow returns > 150° (back to hang)
        },
        steps: [
          'Hang from a bar with hands just outside shoulder-width, palms facing away.',
          'Depress your shoulder blades and engage your lats.',
          'Pull until your chin clears the bar, leading with your chest.',
          'Lower slowly back to a full hang with arms straight.',
        ],
        keyAngles: [
          { joint: 'Elbow', target: 'Full flexion at top', note: 'Full range — chin over bar' },
          { joint: 'Shoulder', target: 'Full extension at bottom', note: 'Do not short the hang' },
          { joint: 'Torso', target: 'Slight lean back', note: 'Not excessive swinging' },
        ],
        commonMistakes: ['Kipping or using momentum', 'Not reaching full hang', 'Chin barely over bar'],
      },
      {
        id: 'chinup',
        name: 'Chin-up',
        difficulty: 'Intermediate',
        targetJoints: ['Elbow', 'Shoulder', 'Bicep'],
        repDetection: {
          joints: ['left_elbow', 'right_elbow'],
          inThreshold: 70,
          outThreshold: 150,
        },
        steps: [
          'Hang from a bar with hands shoulder-width apart, palms facing you.',
          'Pull your chest toward the bar, leading with your elbows.',
          'Lift until your chin is above the bar.',
          'Lower slowly back to a dead hang.',
        ],
        keyAngles: [
          { joint: 'Elbow', target: 'Full flexion at top', note: 'Supinated grip activates biceps more' },
          { joint: 'Shoulder', target: 'Full extension at bottom', note: 'Complete dead hang each rep' },
          { joint: 'Torso', target: 'Mostly vertical', note: 'Minimal swing' },
        ],
        commonMistakes: ['Half reps', 'Swinging the body', 'Not fully extending at the bottom'],
      },
    ],
  },
  {
    group: 'Legs',
    exercises: [
      {
        id: 'squat',
        name: 'Squat',
        difficulty: 'Beginner',
        targetJoints: ['Knee', 'Hip', 'Ankle'],
        repDetection: {
          joints: ['left_knee', 'right_knee'],
          inThreshold: 90,
          outThreshold: 160,
        },
        steps: [
          'Stand with feet shoulder-width apart, toes slightly out.',
          'Brace your core, then push hips back and bend knees simultaneously.',
          'Lower until thighs are parallel to the floor or below.',
          'Drive through your heels to return to standing.',
        ],
        keyAngles: [
          { joint: 'Knee', target: '90° or below at bottom', note: 'Knees track over toes' },
          { joint: 'Hip', target: 'Below parallel', note: 'Avoid early hip rise on the way up' },
          { joint: 'Torso', target: 'Slight forward lean', note: 'No excessive forward collapse' },
        ],
        commonMistakes: ['Knees caving inward', 'Heels rising off floor', 'Rounding lower back'],
      },
      {
        id: 'lunge',
        name: 'Lunge',
        difficulty: 'Beginner',
        targetJoints: ['Knee', 'Hip', 'Ankle'],
        repDetection: {
          joints: ['left_knee', 'right_knee'],
          inThreshold: 90,
          outThreshold: 150,
        },
        steps: [
          'Stand tall, feet together, hands on hips.',
          'Step one foot forward about 2 to 3 feet.',
          'Lower your back knee toward the floor, front shin stays vertical.',
          'Push off the front foot to return to start, then switch sides.',
        ],
        keyAngles: [
          { joint: 'Front Knee', target: '90° at bottom', note: 'Do not let knee pass toes' },
          { joint: 'Back Knee', target: 'Just above floor', note: 'Control the descent' },
          { joint: 'Torso', target: 'Upright / neutral spine', note: 'No leaning forward' },
        ],
        commonMistakes: ['Front knee caving in', 'Torso leaning forward', 'Short stride length'],
      },
    ],
  },
  {
    group: 'Shoulders',
    exercises: [
      {
        id: 'shoulder-circles',
        name: 'Shoulder Circles',
        difficulty: 'Beginner',
        targetJoints: ['Shoulder', 'Scapula'],
        repDetection: null,
        steps: [
          'Stand or sit upright with arms hanging at your sides.',
          'Slowly roll both shoulders forward in a large circular motion.',
          'Complete the prescribed reps, then reverse direction.',
          'Keep the neck relaxed and movement smooth throughout.',
        ],
        keyAngles: [
          { joint: 'Shoulder', target: 'Full circular range', note: 'Go through the full arc each rep' },
          { joint: 'Neck', target: 'Neutral', note: 'Do not tense or tilt the neck' },
          { joint: 'Scapula', target: 'Active retraction and protraction', note: 'Feel the blade move' },
        ],
        commonMistakes: ['Small incomplete circles', 'Tensing the neck', 'Moving too fast'],
      },
      {
        id: 'arm-circles',
        name: 'Arm Circles',
        difficulty: 'Beginner',
        targetJoints: ['Shoulder', 'Rotator Cuff'],
        repDetection: null,
        steps: [
          'Stand with feet shoulder-width apart, arms extended straight out to the sides.',
          'Make small forward circles, gradually increasing the size.',
          'After the prescribed reps, reverse to backward circles.',
          'Keep arms at shoulder height and core engaged.',
        ],
        keyAngles: [
          { joint: 'Shoulder', target: '90° abduction throughout', note: 'Arms stay at shoulder level' },
          { joint: 'Elbow', target: 'Fully extended', note: 'Do not bend the elbow' },
          { joint: 'Torso', target: 'Upright, no swaying', note: 'Isolate the shoulder joint' },
        ],
        commonMistakes: ['Arms dropping below shoulder height', 'Bending elbows', 'Swaying the torso'],
      },
    ],
  },
  {
    group: 'Core',
    exercises: [
      {
        id: 'plank',
        name: 'Plank',
        difficulty: 'Beginner',
        targetJoints: ['Hip', 'Shoulder', 'Spine'],
        repDetection: null,
        steps: [
          'Rest on forearms and toes, elbows directly under shoulders.',
          'Form a straight line from head to heels.',
          'Squeeze glutes and brace abs — hold the position.',
          'Breathe steadily; avoid holding your breath.',
        ],
        keyAngles: [
          { joint: 'Hip', target: '180° (flat)', note: 'No sagging or hiking' },
          { joint: 'Shoulder', target: 'Stacked over elbows', note: 'No shrugging up' },
          { joint: 'Neck', target: 'Neutral (eyes down)', note: 'Do not crane neck up' },
        ],
        commonMistakes: ['Hips too high or too low', 'Holding breath', 'Shoulder blades winging'],
      },
    ],
  },
]

export function getExerciseById(id) {
  for (const group of exerciseGroups) {
    const found = group.exercises.find((e) => e.id === id)
    if (found) return { ...found, group: group.group }
  }
  return null
}

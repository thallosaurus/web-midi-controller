enum BUTTON_DEF {
    LeftArrow = 91,
    RightArrow = 92,
    Session = 93,
    Note = 94,
    Chord = 95,
    Custom = 96,
    Sequencer = 97,
    Projects = 98,
    Shift = 90,
    UpArrow = 80,
    DownArrow = 70,
    Clear = 60,
    Duplicate = 50,
    Quantise = 40,
    FixedLength = 30,
    Play = 20,
    Rec = 10,
    RecArm = 1,
    Mute = 2,
    Solo = 3,
    Volume = 4,
    Pan = 5,
    Sends = 6,
    DeviceTempo = 7,
    StopClip = 8
}

export class MetaButtons {
    static LP_PRO_CC_MAP = new Map<number, string>(
        Object.entries(BUTTON_DEF)
            .filter(([key]) => !isNaN(Number(key)))
            .map(([key, value]) => [Number(key), value as string])
    );

    
}
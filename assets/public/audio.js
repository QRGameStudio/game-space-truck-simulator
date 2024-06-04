function initMusic() {
    MUSIC.cache['laser'] = [[["C8"],50],[["D7"],50]];
    MUSIC.cache['humm0'] =  [[["C1"],50],[["D1"],50]];
    MUSIC.cache['humm1'] =  [[["C2"],50],[["D2"],50]];
    MUSIC.cache['humm2'] =  [[["C3"],50],[["D3"],50]];
    MUSIC.cache['alert'] = [[["C2"],500],[["C4"],500],[["C2"],500],[["C4"],500],[["silence"],250],[["C2"],500],[["C4"],500],[["C2"],500],[["C4"],500],[["silence"],250],[[],500]];
    MUSIC.cache['boom'] = [[["C1"],100],[["C2"],100],[["C1"],100],[[],500]];
    MUSIC.cache['cargoFull'] = [[["A3"],200],[["B3"],200],[["C4"],200],[["D4"],500],[[],500]];

    MUSIC.cache['musicMainTheme'] = [ [["E4"], 1000], [["G4"], 500], [["E4"], 500], [["silence"], 500],
        [["B4"], 500], [["G4"], 500], [["E4"], 500], [["D4"], 1000], [["silence"], 500],
        [["C4"], 1000], [["E4"], 500], [["silence"], 250], [[], 500],
        [["A4"], 500], [["E4"], 500], [["F#4"], 500], [["silence"], 250],
        [["G4"], 500], [["E4"], 500], [["A4"], 1000], [["silence"], 500],
        [["B4"], 750], [["C5"], 750], [["B4"], 500], [["A4"], 500],
        [["G4"], 500], [["F#4"], 500], [["E4"], 1000], [["silence"], 500],
        [["D4"], 750], [["C4"], 750], [["D4"], 500], [["E4"], 500],
        [["F#4"], 500], [["G4"], 500], [["A4"], 500], [["silence"], 250], [[], 500]
    ];
    MUSIC.cache["musicCombat"] = [[["G4"],250],[["A4"],250],[["G4"],250],[["F#4"],250],[["E4"],250],[["F#4"],250],[["G4"],250],[["silence"],100],[["G4"],250],[["B4"],250],[["A4"],250],[["G4"],250],[["F#4"],250],[["E4"],250],[["D4"],250],[["silence"],100],[["D4"],250],[["E4"],250],[["F#4"],250],[["G4"],250],[["A4"],500],[["G4"],250],[["F#4"],250],[["E4"],500],[["D4"],250],[["E4"],250],[["F#4"],500],[["silence"],250],[["G4"],250],[["A4"],250],[["B4"],500],[["A4"],250],[["G4"],250],[["F#4"],500],[["E4"],250],[["F#4"],250],[["G4"],250],[["silence"],100],[["A4"],250],[["B4"],250],[["C5"],500],[["B4"],250],[["A4"],250],[["G4"],500],[["silence"],250],[[],500]];
    MUSIC.cache["musicMining"] = [ [["C3"], 750], [["E3"], 750], [["G3"], 750], [["C4"], 750],
        [["silence"], 250], [["E3"], 500], [["G3"], 500], [["C4"], 500],
        [["E4"], 500], [["silence"], 250], [["C4"], 500], [["G3"], 500],
        [["E3"], 500], [["C3"], 750], [["silence"], 250], [["C3"], 500],
        [["E3"], 500], [["G3"], 500], [["C4"], 750], [["silence"], 250],
        [["E4"], 500], [["C4"], 500], [["G3"], 500], [["E3"], 500],
        [["C3"], 750], [["silence"], 250], [["C3"], 500], [["E3"], 500],
        [["G3"], 500], [["C4"], 750], [["silence"], 250], [["C4"], 500],
        [["E4"], 500], [["G4"], 500], [["C5"], 1000], [["silence"], 500], [[], 500]
    ];
}


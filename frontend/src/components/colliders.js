export const wallBounds = [
    // ===== Room 1 (centerZ = 0) =====
    [-15, -15, -14, 15], // left wall
    [14, -15, 15, 15],   // right wall

    // BACK wall (entry from outside)
    [-15, -15, -4, -14],
    [4, -15, 15, -14],

    // FRONT wall (entry into Room 2)
    // [-15, 14, -4, 15],
    // [4, 14, 15, 15],

    // ===== Room 2 (centerZ = 30) =====
    [-15, 15, -14, 45],  // left
    [14, 15, 15, 45],    // right
    [-15, 44, 15, 45],   // back wall (solid)

    // FRONT wall of Room 2(between 2 rooms) — leave matching door gap
    [-15, 14, -4, 16],   // left of front door (same as Room 1's back wall!)
    [4, 14, 15, 16],     // right of front door


    // Room walls (your existing bounds, if any)

    //  Room 1
    [-2.5, -2.5, 2.5, 2.5],         // Center statue
    [6, -4, 10.5, 1],              // T-Rex
    [-9, 7, -7, 9],                 // Ceremonial Knife pedestal

    //  Room 2
    [9, 19, 11, 21],                // Arrow Man
    [-2, 20.5, 2.5, 35.5],        // Diplodocus base
    [9, 39, 11, 41],                // Spear Man
    [-9, 32, -3.5, 40],             // Hephaestus Temple

    //  Assistant AI
    [7.5, 9.5, 8.5, 10.5],          // Assistant base

    // //  NPC spawn zones
    // [1, -4, 3, -2],                 // Visitor A
    // [-4, 1, -2, 3],                 // Visitor B
];

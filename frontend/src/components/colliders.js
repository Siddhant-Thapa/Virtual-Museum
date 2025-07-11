export const wallBounds = [
    // ===== Room 1 (centerZ = 0) =====
    [-15, -15, -14, 15], // left wall
    [14, -15, 15, 15],   // right wall

    // BACK wall (entry from outside)
    [-15, -15, -4, -14],
    [4, -15, 15, -14],

    // FRONT wall (entry into Room 2)
    [-15, 14, -4, 15],
    [4, 14, 15, 15],

    // ===== Room 2 (centerZ = 30) =====
    [-15, 15, -14, 45],  // left
    [14, 15, 15, 45],    // right
    [-15, 44, 15, 45],   // back wall (solid)

    // FRONT wall of Room 2 — leave matching door gap
    [-15, 14, -4, 15],   // left of front door (same as Room 1's back wall!)
    [4, 14, 15, 15],     // right of front door
];
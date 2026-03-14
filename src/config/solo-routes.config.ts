/**
 * Curated Bristol running, walking and cycling routes for Solo fitness.
 * Polylines are simplified approximations; refine with GPX/OSM data as needed.
 */

export type RouteType = "run" | "walk" | "cycle";

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface SoloRoute {
  id: string;
  name: string;
  type: RouteType;
  distanceKm: number;
  polyline: RoutePoint[];
  startLat: number;
  startLng: number;
  description?: string;
}

// Bristol centre reference: 51.4545, -2.5879
export const SOLO_ROUTES: SoloRoute[] = [
  {
    id: "harbourside-5k",
    name: "Solo Harbourside Loop",
    type: "run",
    distanceKm: 5,
    description: "A high-energy 5km loop around the water, perfect for early morning clarity.",
    startLat: 51.4515,
    startLng: -2.5958,
    polyline: [
      { lat: 51.4515, lng: -2.5958 }, // Queen Square
      { lat: 51.452, lng: -2.598 }, // Pero's Bridge
      { lat: 51.4518, lng: -2.602 }, // Millennium Square
      { lat: 51.4505, lng: -2.608 }, // Watershed
      { lat: 51.4488, lng: -2.6132 }, // SS Great Britain
      { lat: 51.4475, lng: -2.615 }, // Underfall Yard
      { lat: 51.447, lng: -2.612 }, // Spike Island
      { lat: 51.448, lng: -2.605 }, // M Shed
      { lat: 51.4495, lng: -2.6 }, // Return via harbour
      { lat: 51.4515, lng: -2.5958 }, // Queen Square
    ],
  },
  {
    id: "leigh-woods-hike",
    name: "Leigh Woods Hike",
    type: "walk",
    distanceKm: 4.5,
    description: "A brisk, refreshing solo walk through the oak and ash trees overlooking the Avon Gorge.",
    startLat: 51.4558,
    startLng: -2.6448,
    polyline: [
      { lat: 51.4558, lng: -2.6448 }, // Leigh Woods car park
      { lat: 51.4565, lng: -2.642 }, // Purple loop start
      { lat: 51.4575, lng: -2.638 }, // Woodland trail
      { lat: 51.458, lng: -2.635 }, // Avon Gorge view
      { lat: 51.457, lng: -2.632 }, // River path
      { lat: 51.4555, lng: -2.636 }, // Return trail
      { lat: 51.4558, lng: -2.6448 }, // Back to car park
    ],
  },
  {
    id: "victoria-park-loop",
    name: "Victoria Park Loop",
    type: "run",
    distanceKm: 2.5,
    description: "Flat park loop ideal for a quick solo run in South Bristol.",
    startLat: 51.4348,
    startLng: -2.598,
    polyline: [
      { lat: 51.4348, lng: -2.598 }, // Victoria Park entrance
      { lat: 51.4355, lng: -2.595 }, // East side
      { lat: 51.436, lng: -2.592 }, // North corner
      { lat: 51.4352, lng: -2.59 }, // West side
      { lat: 51.4345, lng: -2.593 }, // South path
      { lat: 51.4348, lng: -2.598 }, // Back to start
    ],
  },
  {
    id: "ashton-court-estate",
    name: "Ashton Court Estate Walk",
    type: "walk",
    distanceKm: 5.5,
    description: "Explore the historic estate grounds and deer park on peaceful paths.",
    startLat: 51.4378,
    startLng: -2.6472,
    polyline: [
      { lat: 51.4378, lng: -2.6472 }, // Ashton Court
      { lat: 51.439, lng: -2.645 }, // Estate path
      { lat: 51.441, lng: -2.642 }, // Deer park
      { lat: 51.4425, lng: -2.64 }, // North boundary
      { lat: 51.441, lng: -2.648 }, // West loop
      { lat: 51.4385, lng: -2.65 }, // Return
      { lat: 51.4378, lng: -2.6472 }, // Back to start
    ],
  },
  {
    id: "brandon-hill-loop",
    name: "Brandon Hill & Cabot Tower",
    type: "walk",
    distanceKm: 2,
    description: "Short urban walk with panoramic views from Cabot Tower.",
    startLat: 51.4545,
    startLng: -2.605,
    polyline: [
      { lat: 51.4545, lng: -2.605 }, // Park entrance
      { lat: 51.4555, lng: -2.6045 }, // Cabot Tower
      { lat: 51.456, lng: -2.603 }, // Summit
      { lat: 51.4552, lng: -2.602 }, // West descent
      { lat: 51.4545, lng: -2.605 }, // Back to start
    ],
  },
  {
    id: "strawberry-line-walk",
    name: "Strawberry Line Walk",
    type: "walk",
    distanceKm: 6,
    description: "A peaceful walk along the flat, scenic trails of the old railway line.",
    startLat: 51.44,
    startLng: -2.595,
    polyline: [
      { lat: 51.44, lng: -2.595 }, // Bedminster
      { lat: 51.438, lng: -2.585 }, // East along railway
      { lat: 51.436, lng: -2.575 }, // Mid section
      { lat: 51.434, lng: -2.565 }, // Further east
      { lat: 51.436, lng: -2.575 }, // Return
      { lat: 51.438, lng: -2.585 },
      { lat: 51.44, lng: -2.595 },
    ],
  },
  {
    id: "harbourside-walk",
    name: "Harbourside Stroll",
    type: "walk",
    distanceKm: 3,
    description: "A relaxed walk along the harbour with cafes and landmarks.",
    startLat: 51.4515,
    startLng: -2.5958,
    polyline: [
      { lat: 51.4515, lng: -2.5958 }, // Queen Square
      { lat: 51.452, lng: -2.598 }, // Pero's Bridge
      { lat: 51.4518, lng: -2.602 }, // Millennium Square
      { lat: 51.4505, lng: -2.608 }, // Watershed
      { lat: 51.4488, lng: -2.6132 }, // SS Great Britain
      { lat: 51.4505, lng: -2.608 }, // Return
      { lat: 51.4515, lng: -2.5958 },
    ],
  },
  {
    id: "clifton-downs-run",
    name: "Clifton Downs Run",
    type: "run",
    distanceKm: 4,
    description: "Open grassland run with views of the Suspension Bridge.",
    startLat: 51.463,
    startLng: -2.612,
    polyline: [
      { lat: 51.463, lng: -2.612 }, // Downs
      { lat: 51.4645, lng: -2.608 }, // North
      { lat: 51.465, lng: -2.602 }, // Bridge view
      { lat: 51.464, lng: -2.598 }, // West
      { lat: 51.4625, lng: -2.602 }, // South
      { lat: 51.463, lng: -2.612 }, // Back
    ],
  },
  {
    id: "eastville-park-loop",
    name: "Eastville Park Loop",
    type: "run",
    distanceKm: 2.2,
    description: "Compact loop around the lake and park paths.",
    startLat: 51.4685,
    startLng: -2.562,
    polyline: [
      { lat: 51.4685, lng: -2.562 }, // Eastville Park
      { lat: 51.4695, lng: -2.558 }, // Lake
      { lat: 51.47, lng: -2.555 }, // North
      { lat: 51.469, lng: -2.557 }, // West
      { lat: 51.4685, lng: -2.562 }, // Back
    ],
  },
  {
    id: "river-avon-towpath",
    name: "River Avon Towpath",
    type: "walk",
    distanceKm: 4,
    description: "Riverside walk along the Avon with views of the gorge.",
    startLat: 51.451,
    startLng: -2.62,
    polyline: [
      { lat: 51.451, lng: -2.62 }, // Hotwells
      { lat: 51.452, lng: -2.618 }, // North
      { lat: 51.4535, lng: -2.615 }, // Gorge view
      { lat: 51.457, lng: -2.612 }, // Leigh Woods opposite
      { lat: 51.455, lng: -2.616 }, // Return
      { lat: 51.451, lng: -2.62 },
    ],
  },
  // Cycling routes
  {
    id: "strawberry-line-cycle",
    name: "Cycling the Strawberry Line",
    type: "cycle",
    distanceKm: 12,
    description: "A peaceful solo ride along the flat, scenic trails of the old railway line.",
    startLat: 51.44,
    startLng: -2.595,
    polyline: [
      { lat: 51.44, lng: -2.595 }, // Bedminster
      { lat: 51.438, lng: -2.585 }, // East along railway
      { lat: 51.436, lng: -2.575 }, // Mid section
      { lat: 51.434, lng: -2.565 }, // Further east
      { lat: 51.43, lng: -2.55 }, // Yatton direction
      { lat: 51.434, lng: -2.565 }, // Return
      { lat: 51.436, lng: -2.575 },
      { lat: 51.438, lng: -2.585 },
      { lat: 51.44, lng: -2.595 },
    ],
  },
  {
    id: "harbourside-cycle",
    name: "Harbourside Cycle Loop",
    type: "cycle",
    distanceKm: 8,
    description: "Scenic cycle around the harbour with dedicated paths and waterfront views.",
    startLat: 51.4515,
    startLng: -2.5958,
    polyline: [
      { lat: 51.4515, lng: -2.5958 }, // Queen Square
      { lat: 51.452, lng: -2.598 }, // Pero's Bridge
      { lat: 51.4518, lng: -2.602 }, // Millennium Square
      { lat: 51.4505, lng: -2.608 }, // Watershed
      { lat: 51.4488, lng: -2.6132 }, // SS Great Britain
      { lat: 51.4475, lng: -2.615 }, // Underfall Yard
      { lat: 51.447, lng: -2.612 }, // Spike Island
      { lat: 51.445, lng: -2.605 }, // South of harbour
      { lat: 51.448, lng: -2.598 }, // Return via south
      { lat: 51.4515, lng: -2.5958 }, // Queen Square
    ],
  },
  {
    id: "bristol-bath-cycle",
    name: "Bristol to Bath Railway Path",
    type: "cycle",
    distanceKm: 24,
    description: "Traffic-free path along the old railway line to Bath. Mostly flat.",
    startLat: 51.448,
    startLng: -2.583,
    polyline: [
      { lat: 51.448, lng: -2.583 }, // Bristol end
      { lat: 51.445, lng: -2.57 }, // St Anne's
      { lat: 51.442, lng: -2.565 }, // Bitton
      { lat: 51.438, lng: -2.555 }, // Warmley
      { lat: 51.435, lng: -2.545 }, // Saltford
      { lat: 51.438, lng: -2.555 }, // Return
      { lat: 51.442, lng: -2.565 },
      { lat: 51.445, lng: -2.57 },
      { lat: 51.448, lng: -2.583 },
    ],
  },
  {
    id: "ashton-court-cycle",
    name: "Ashton Court Estate Cycle",
    type: "cycle",
    distanceKm: 6,
    description: "Cycle through the estate grounds and along Sustrans Route 41.",
    startLat: 51.4378,
    startLng: -2.6472,
    polyline: [
      { lat: 51.4378, lng: -2.6472 }, // Ashton Court
      { lat: 51.439, lng: -2.645 }, // Estate path
      { lat: 51.441, lng: -2.642 }, // Deer park
      { lat: 51.443, lng: -2.638 }, // North boundary
      { lat: 51.441, lng: -2.648 }, // West loop
      { lat: 51.4385, lng: -2.65 }, // Return
      { lat: 51.4378, lng: -2.6472 }, // Back to start
    ],
  },
  {
    id: "avon-gorge-cycle",
    name: "Avon Gorge Cycle Route",
    type: "cycle",
    distanceKm: 10,
    description: "Challenging ride with stunning views of the Suspension Bridge and gorge.",
    startLat: 51.4545,
    startLng: -2.605,
    polyline: [
      { lat: 51.4545, lng: -2.605 }, // Clifton
      { lat: 51.456, lng: -2.612 }, // Bridge approach
      { lat: 51.458, lng: -2.62 }, // Gorge road
      { lat: 51.457, lng: -2.628 }, // Leigh Woods
      { lat: 51.455, lng: -2.635 }, // South
      { lat: 51.452, lng: -2.628 }, // Return via Portway
      { lat: 51.4545, lng: -2.605 }, // Back to Clifton
    ],
  },
];

// @ts-nocheck: don't even try

// Define the sports ticker types
export interface Game {
  id: string;
  opponent: string;
  location: "Home" | "Away";
  scsScore: string;
  opponentScore: string;
  date: string;
  place?: number;
}

export interface Team {
  id: string;
  name: string;
  games: Game[];
}

export interface SportsTicker {
  id: string;
  teams: Team[];
}

export interface Gallery {
  photoGallery: any;
}

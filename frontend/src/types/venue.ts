export interface Venue {
    id: string;
    cinemaId: number;
    capacity: number;
    rows: { row: string; seats: string[] }[];
}

export interface Show {
    id: number;
    movie: number;
    cinema: number;
    venue_id?: string | null;
    date: string;
    time: string;
    seats: number;
    capacity?: number;
    movie_name?: string;
    movie_img?: string;
    cinema_name?: string;
    description: string;
    adult_price_cents: number;
    student_price_cents: number;
    senior_price_cents: number;
    child_price_cents: number;
}

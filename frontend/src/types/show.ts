export interface Show {
    id: number;
    movie: number;
    cinema: number;
    date: string;
    time: string;
    seats: number;
    movie_name?: string;
    movie_img?: string;
    cinema_name?: string;
    description: string;
}

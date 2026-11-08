export interface Seat {
    id: number;
    label: string;
    row?: string;
    selected: boolean;
    reserved: boolean;
}

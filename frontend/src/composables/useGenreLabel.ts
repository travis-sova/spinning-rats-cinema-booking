import { useI18n } from 'vue-i18n';

export function useGenreLabel() {
    const { t, te } = useI18n();

    return (genre: string) => {
        const key = `shows.genres.${genre}`;
        return te(key) ? t(key) : genre;
    };
}

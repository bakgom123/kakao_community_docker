export function formatKoreanTime(utcDateString) {
    const utcDate = new Date(utcDateString);
    const koreanDate = new Date(
        utcDate.getTime() - utcDate.getTimezoneOffset() * 60000,
    );

    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(koreanDate);
}
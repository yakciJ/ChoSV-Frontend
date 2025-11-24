export function formatDateLocal(isoString) {
    return new Date(isoString).toLocaleDateString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

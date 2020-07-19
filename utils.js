/**
 * Get formatted date
 * @param {string} timezone 
 * @param {integer} daysOffset 
 */
function getFormattedDate(timezone, daysOffset = 0) {
    const now = new Date();

    if (daysOffset === 0) {
        const year = now.getYear() + 1900;
        const month = now.getMonth() + 1;
        const day = now.getDate();
        return `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
    }

    const date = new Date(now.setDate(now.getDate() + daysOffset));
    const year = date.getYear() + 1900;
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
}

module.exports = {
    getFormattedDate
};

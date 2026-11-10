const currentOrder = new WeakMap();

function sortTable(table, columnIndex) {

    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.querySelectorAll("tr"));
    let state = currentOrder.get(table) || { column: null, order: 'asc' };

    if (state.column === columnIndex) {
        state.order = state.order === 'asc' ? 'desc' : 'asc';
    } else {
        state.order = 'asc';
    }
    state.column = columnIndex;

    currentOrder.set(table, state);

    const sortedRows = rows.sort((a, b) => {
        const A = a.children[columnIndex].textContent.trim();
        const B = b.children[columnIndex].textContent.trim();
        if (state.order === 'asc') {
            return A.localeCompare(B, undefined, { numeric: true });
        } else {
            return B.localeCompare(A, undefined, { numeric: true });
        }
    });

    tbody.innerHTML = "";
    sortedRows.forEach(row => tbody.appendChild(row));
}
document.querySelectorAll("table").forEach(table => {
    table.querySelectorAll("th").forEach((th, index) => {
        th.addEventListener("click", () => sortTable(table, index));
    });
});
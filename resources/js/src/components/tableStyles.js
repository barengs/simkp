import React from "react";

/**
 * Single source of truth for DataTable styling across the whole app.
 * Every list page MUST spread `tableCustomStyles` into its <DataTable>
 * so the table header, rows and cells look identical everywhere.
 */
export const tableCustomStyles = {
    header: {
        style: {
            display: "none",
        },
    },
    headRow: {
        style: {
            backgroundColor: "#f8fafc",
            borderBottomWidth: "1px",
            borderBottomColor: "#e2e8f0",
            minHeight: "52px",
        },
    },
    headCells: {
        style: {
            color: "#475569",
            fontSize: "0.75rem",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            paddingTop: "14px",
            paddingBottom: "14px",
        },
    },
    rows: {
        style: {
            minHeight: "56px",
            fontSize: "0.875rem",
            color: "#334155",
        },
        stripedStyle: {
            backgroundColor: "#f8fafc",
        },
    },
    cells: {
        style: {
            paddingTop: "10px",
            paddingBottom: "10px",
        },
    },
    pagination: {
        style: {
            borderTopWidth: "1px",
            borderTopColor: "#e2e8f0",
            fontSize: "0.875rem",
        },
    },
};

/**
 * Builds the leading "No" (STT) column.
 * Numbering stays correct across pages using the tracked current page.
 *
 * @param {number} page    current DataTable page (1-based)
 * @param {number} perPage rows per page
 */
export const makeNumberColumn = (page = 1, perPage = 10) => ({
    name: "No",
    width: "70px",
    center: true,
    sortable: false,
    cell: (_row, index) => (page - 1) * perPage + index + 1,
});

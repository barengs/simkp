import React, { useMemo } from 'react';
import DataTable from 'react-data-table-component';

const customStyles = {
    headRow: {
        style: {
            backgroundColor: '#f9fafb',
            borderTop: '1px solid #e5e7eb',
            borderBottom: '1px solid #e5e7eb',
        },
    },
    headCells: {
        style: {
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
        },
    },
    rows: {
        style: {
            fontSize: '14px',
            color: '#374151',
            '&:hover': {
                backgroundColor: '#f0fdf4',
            },
        },
    },
    pagination: {
        style: {
            borderTop: '1px solid #e5e7eb',
        },
        pageButtonsStyle: {
            color: '#059669',
            fill: '#059669',
            '&:disabled': {
                color: '#9ca3af',
                fill: '#9ca3af',
            },
            '&:hover:not(:disabled)': {
                backgroundColor: '#d1fae5',
            },
        },
    },
};

const DataTableWrapper = ({ columns, data, loading, emptyMessage, ...props }) => {
    const mappedColumns = useMemo(() => {
        return columns.map((col) => ({
            ...col,
            id: col.id || col.key,
            name: col.name || col.label,
            cell: col.cell || col.render,
            selector: col.selector || (col.key ? (row) => row[col.key] : undefined),
        }));
    }, [columns]);

    const noDataComponent = emptyMessage ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
            {emptyMessage}
        </div>
    ) : undefined;

    return (
        <DataTable
            columns={mappedColumns}
            data={data || []}
            customStyles={customStyles}
            highlightOnHover
            pointerOnHover
            responsive
            progressPending={loading}
            noDataComponent={noDataComponent}
            {...props}
        />
    );
};

export default DataTableWrapper;

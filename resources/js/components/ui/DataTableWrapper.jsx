import React from 'react';
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

const DataTableWrapper = ({ columns, data, loading, ...props }) => {
    return (
        <DataTable
            columns={columns}
            data={data || []}
            customStyles={customStyles}
            highlightOnHover
            pointerOnHover
            responsive
            progressPending={loading}
            {...props}
        />
    );
};

export default DataTableWrapper;

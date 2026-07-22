import React from 'react';

/**
 * DataTable component - supports two APIs:
 *
 * API 1 (Legacy): headers + children
 * <DataTable headers={['Name', 'Email']}>
 *   <tr><td>John</td><td>john@example.com</td></tr>
 * </DataTable>
 *
 * API 2 (New): columns + data (auto-rendering with custom render functions)
 * <DataTable
 *   columns={[
 *     { key: 'name', label: 'Name' },
 *     { key: 'email', label: 'Email', render: (row) => <a>{row.email}</a> }
 *   ]}
 *   data={[{ name: 'John', email: 'john@example.com' }]}
 * />
 */
export default function DataTable({ headers, columns, data, children }) {
  // Support both APIs: columns (new) or headers (legacy)
  const actualColumns = columns || headers || [];

  // Render table header
  const renderHeader = () => {
    return actualColumns.map((col, idx) => {
      // Support string headers (legacy) or column objects (new)
      const label = typeof col === 'string' ? col : col.label;
      return <th key={idx}>{label}</th>;
    });
  };

  // Render table body
  const renderBody = () => {
    // If data and columns provided, auto-render rows
    if (data && columns) {
      return data.map((row, rowIndex) => (
        <tr key={rowIndex}>
          {columns.map((col, colIndex) => (
            <td key={colIndex}>
              {col.render ? col.render(row) : row[col.key]}
            </td>
          ))}
        </tr>
      ));
    }
    // Fallback to manual children rendering (legacy API)
    return children;
  };

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>{renderHeader()}</tr>
        </thead>
        <tbody>{renderBody()}</tbody>
      </table>
    </div>
  );
}

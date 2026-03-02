export function buildClientColumns({ currentLocationId, getLocationName, ActionMenu }) {
  const base = [
    { accessor: 'clientNumber', Header: 'No. de cliente' },
    { accessor: 'clientName', Header: 'Nombre' },
    { accessor: 'inCharge', Header: 'Encargado' },
    {
      accessor: 'address',
      Header: 'Dirección',
      Cell: ({ value }) => value.length > 50 ? `${value.substring(0, 25)}...` : value,
    },
    { accessor: 'email', Header: 'Correo electrónico' },
  ];

  const sucursal = currentLocationId === 'TODOS'
    ? { id: 'sucursal-colum', Header: 'Sucursal', accessor: (row) => getLocationName(row.locationId) }
    : null;

  const action = {
    accessor: 'action',
    Header: '',
    Cell: ({ row }) => <ActionMenu row={row} />,
  };

  return sucursal ? [...base, sucursal, action] : [...base, action];
};
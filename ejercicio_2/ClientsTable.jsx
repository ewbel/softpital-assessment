import React, {Fragment,useMemo,useState,useEffect, useContext} from 'react';
import {useExpanded,useTable,useFilters,useGlobalFilter,usePagination} from 'react-table';
import { Col, Row, Table} from 'react-bootstrap';
import 'regenerator-runtime';
import _get from 'lodash/get';
import Pagination from '../../../components/elements/advance-table/Pagination';
import ClientFilters from './ClientFilters';
// Detecta si el usuario está en un dispositivo móvil
function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}
import ExpandedClientsViewTable from './ExpandedClientsViewTable.jsx';
import { DashboardContext } from '../../../context/Context';

const ClientsTable = (props) => {
  let rawData = props.inv_data;
  const {locations, currentLocationId} = useContext(DashboardContext)
  const [equipmentData, setEquipmentData] = useState(rawData);
  const [showFilter, setShowFilter] = useState(false);

  // Usar los filtros y setFilters recibidos por props, como en los otros módulos
  const { filters, setFilters } = props;

  const ActionMenu = ({ row, fl }) => {
    return (
      <i
        className={`fi fs-3 fi-rs-angle-circle-${
          row.isExpanded ? 'up' : 'down'
        }`}
        {...row.getToggleRowExpandedProps()}
      />
    );
  };

  const locationMap = React.useMemo(() => {
      const map = {};
      locations?.forEach(loc => {
        map[loc.locationId] = loc.name;
      });
      return map;
    }, [locations]);
  
    const getLocationName = React.useCallback(
      (locationId) => locationMap[locationId] ?? locationId,
      [locationMap]
    );

  const allData = useMemo(()=>{
    const baseColumns = [
      { accessor: 'clientNumber', Header: 'No. de cliente' },
      { accessor: 'clientName', Header: 'Nombre' },
      { accessor: 'inCharge', Header: 'Encargado' },
      {
        accessor: 'address',
        Header: 'Dirección',
        Cell: ({ value }) =>
          value.length > 50 ? `${value.substring(0, 25)}...` : value,
      },
      { accessor: 'email', Header: 'Correo electrónico' },
    ];
    const dynamicColumn = currentLocationId === 'TODOS' 
    ? {
        id: 'sucursal-colum',
        Header: 'Sucursal',
        accessor: (row) => getLocationName (row.locationId)
      }
    : null;
    const remainingColumns = [
      {
        accessor: 'action',
        Header: '',
        Cell: ({ row }) => {
          return <ActionMenu row={row} fl="c" />;
        },
      },
    ]
    return dynamicColumn ? [...baseColumns, dynamicColumn, ...remainingColumns] : [...baseColumns,...remainingColumns]
  
  },[currentLocationId,locations])
  

  const columns = useMemo(() => allData, []);

  useEffect(() => {
    if (props.inv_data && Array.isArray(props.inv_data)) {
      setEquipmentData(props.inv_data);
      rawData = props.inv_data;
    }
  }, [props.inv_data]);

  const filteredAndSortedData = useMemo(() => {
    if (!rawData || !Array.isArray(rawData)) return [];

    // Si no hay filtro, mostrar todos los clientes
    let searchValue = filters.searchValue;
    // Si el filtro está vacío, mostrar todos los clientes
    const isEmpty =
      !filters.filterType ||
      searchValue == null ||
      (Array.isArray(searchValue) && searchValue.length === 0) ||
      (typeof searchValue === 'string' && searchValue.trim() === '');
    if (isEmpty) {
      return [...rawData].sort((a, b) => {
        switch (filters.sortBy) {
          case 0:
            return String(a.clientName || '').localeCompare(String(b.clientName || ''));
          case 1:
            return String(b.clientName || '').localeCompare(String(a.clientName || ''));
          default:
            return 0;
        }
      });
    }

    // Filtrar por el tipo y valor seleccionado (soporta array y string, igual que Biomedical/Tickets)
    const searchResults = rawData.filter((client) => {
      const fieldValue = String(client[filters.filterType] || '').toLowerCase();
      if (Array.isArray(searchValue)) {
        // Si el array tiene solo un valor, filtra por coincidencia parcial
        if (searchValue.length === 1) {
          return fieldValue.includes(searchValue[0].toLowerCase());
        }
        // Si el array tiene varios valores, filtra si alguno coincide exactamente
        return searchValue.some(val => fieldValue === val.toLowerCase());
      } else if (typeof searchValue === 'string') {
        return fieldValue.includes(searchValue.toLowerCase());
      }
      return true;

      // Filtro por estado
      const statusMatch =
        filters.status === '' ||
        (filters.status === true
          ? client?.status === 'Vigente'
          : client?.status === 'No Vigente');
      
      const locationMatch =
          filters.location === '' ||
          filters.location === getLocationName(client.locationId);
      return searchMatch && statusMatch && locationMatch;
    });

    // Ordenamiento
    return [...searchResults].sort((a, b) => {
      switch (filters.sortBy) {
        case 0:
          return String(a[filters.filterType] || '').localeCompare(String(b[filters.filterType] || ''));
        case 1:
          return String(b[filters.filterType] || '').localeCompare(String(a[filters.filterType] || ''));
        default:
          return 0;
      }
    });
  }, [filters, rawData]);

  // Actualizar el estado cuando cambien los datos filtrados
  useEffect(() => {
    setEquipmentData(filteredAndSortedData);
  }, [filteredAndSortedData]);

  const data = useMemo(() => equipmentData || [], [equipmentData, currentLocationId]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    nextPage,
    previousPage,
    state,
    gotoPage,
    pageCount,
    prepareRow,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
      initialState: {
        pageSize: 40,
        hiddenColumns: columns.map((column) => {
          if (column.show === false) return column.accessor || column.id;
          else return false;
        }),
      },
    },
    useFilters,
    useGlobalFilter,
    useExpanded,
    usePagination,
    // useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => {
        return columns;
      });
    }
  );

  const { pageIndex = 0 } = state || {};

  const dinamicHeight = () => {
    return pageCount > 1
      ? '64vh'
      : '67.3vh';
  };

  const handleNameFilter = (e) => {
    setFilters({ ...filters, name: e.target.value });
  };

  return (
    <Fragment>
      {!isMobileDevice() && (
        <Row>
          <Col lg={11} md={11} sm={11} className="mb-lg-0 py-2 mx-2 ">
            <ClientFilters
              setFilters={setFilters}
              filters={filters}
              equipments={rawData}
              locationIds={props.locationIds}
            />
          </Col>
        </Row>
      )}

      <Row>
        <Col lg={12} md={12} sm={12}>
          <div
            className="table-responsive border-0 hide-scrollbar"
            style={{
              overflowY: 'scroll',
              height: dinamicHeight(),
            }}
          >
            <Table
              hover
              {...getTableProps()}
              className="text-nowrap table-centered table-maintenance"
            >
              <thead className="sticky-header">
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps()}
                        className="bg-light-primary text-primary fw-semi-bold"
                      >
                        {column.render('Header')}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              {equipmentData && equipmentData.length > 0 ? (
                <tbody {...getTableBodyProps()}>
                  {page.map((row) => {
                    prepareRow(row);
                    return (
                      <Fragment key={row.id}>
                        <tr {...row.getRowProps()} className="text-center">
                          {row.cells.map((cell) => {
                            return (
                              <td
                                className="text-dark bg-white"
                                {...cell.getCellProps()}
                              >
                                {cell.render('Cell')}
                              </td>
                            );
                          })}
                        </tr>
                        {row.isExpanded && (
                          <tr>
                            <td
                              colSpan={columns.length}
                              className="bg-white pb-2 pt-0 m-0 px-0"
                            >
                              <ExpandedClientsViewTable
                                props={props}
                                rawData={rawData}
                                client={row.original}
                              />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              ) : (
                ''
              )}
            </Table>
            {!!equipmentData && equipmentData.length <= 0 ? (
              <Row className="text-center p-0 m-0">
                <span className="text-center text-secondary py-5 fw-bold">
                  Aún no hay clientes registrados
                </span>
              </Row>
            ) : (
              ''
            )}
          </div>
          {pageCount > 1 && (
            <Pagination
              previousPage={previousPage}
              pageCount={pageCount}
              pageIndex={pageIndex}
              gotoPage={gotoPage}
              nextPage={nextPage}
            />
          )}
        </Col>
      </Row>
    </Fragment>
  );
};

export default ClientsTable;

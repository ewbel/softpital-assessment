import React, {
  Fragment,
  useMemo,
  useState,
  useEffect,
  useContext
} from 'react';
import {
  useExpanded,
  useTable,
  useFilters,
  useGlobalFilter,
  usePagination
} from 'react-table';
import { 
  Col,
  Row,
  Table
} from 'react-bootstrap';
import 'regenerator-runtime';
import _get from 'lodash/get';
import Pagination from '../../../components/elements/advance-table/Pagination';
import ClientFilters from './ClientFilters';
import ExpandedClientsViewTable from './ExpandedClientsViewTable.jsx';
import { DashboardContext } from '../../../context/Context';
import { buildClientColumns } from './columns/ClientColumns.jsx';
import { useClientFilters } from './hooks/useClientFilters';

// Detecta si el usuario está en un dispositivo móvil
function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
};

const ActionMenu = ({ row }) => {
  return (
    <i
      className={`fi fs-3 fi-rs-angle-circle-${row.isExpanded ? 'up' : 'down'}`}
      {...row.getToggleRowExpandedProps()}
    />
  );
};

const ClientsTable = (props) => {
  const {locations, currentLocationId} = useContext(DashboardContext)

  // Usar los filtros y setFilters recibidos por props, como en los otros módulos
  const { filters, setFilters } = props;

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

  const columns = useMemo(
    () => buildClientColumns({ currentLocationId, getLocationName, ActionMenu }),
    [currentLocationId, getLocationName]
  );

  const rawData = useMemo(() => (
    Array.isArray(props.inv_data) ? props.inv_data : []
    ),
      [props.inv_data]
  );

  const filteredAndSortedData = useClientFilters(rawData, filters);

  // Actualizar el estado cuando cambien los datos filtrados
  //Deprecado por hacer un update de un valor que 
  //ya esta calculandose en el scope(filteredAndSortedData), lo que causaba un render innecesario
  /* useEffect(() => {
    setEquipmentData(filteredAndSortedData);
  }, [filteredAndSortedData]); */

  const data = useMemo(() => filteredAndSortedData, [filteredAndSortedData]);

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

  const tableHeight = pageCount > 1 ? '64vh' : '67.3vh';

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
              height: tableHeight,
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
              {filteredAndSortedData && filteredAndSortedData.length > 0 ? (
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
            {!filteredAndSortedData.length ? (
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

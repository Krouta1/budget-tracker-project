'use client';
import { GetTransactionsResponseType } from '@/app/api/transactions-history/route';
import { DateToUTCDate } from '@/lib/helpers';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { DataTableColumnHeader } from '@/components/DataTable/ColumnHeader';
import { cn } from '@/lib/utils';
import { DataTableFacetedFilter } from '@/components/DataTable/FacetedFilters';
import { DataTableViewOptions } from '@/components/DataTable/ColumnToggle';
import { DataTablePagination } from '@/components/DataTable/Pagination';
import { download, generateCsv, mkConfig } from 'export-to-csv';
import { Button } from '@/components/ui/button';
import {
  DownloadIcon,
  MoreHorizontal,
  MoreHorizontalIcon,
  TrashIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DeleteTransactionDialog from './DeleteTransactionDialog';

type Props = {
  from: Date;
  to: Date;
};
type TransactionHistoryRow = GetTransactionsResponseType[0];

export const columns: ColumnDef<TransactionHistoryRow>[] = [
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Category' />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    cell: ({ row }) => (
      <div className=' flex gap-2 capitalize'>
        {row.original.categoryIcon}
        <div className=' capitalize'>{row.original.category}</div>
      </div>
    ),
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => (
      <div className=' capitalize'>{row.original.description}</div>
    ),
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => {
      const date = new Date(row.original.date);
      const formatedDate = date.toLocaleDateString('default', {
        timeZone: 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      return <div className=' text-muted-foreground'>{formatedDate}</div>;
    },
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    cell: ({ row }) => (
      <div
        className={cn(
          'capitalize rounded-lg p-2',
          row.original.type === 'income' &&
            'bg-emerald-400/10 text-emerald-500',
          row.original.type === 'expense' && 'bg-rose-400/10 text-rose-500'
        )}
      >
        {row.original.type}
      </div>
    ),
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Amount' />
    ),
    cell: ({ row }) => (
      <p className=' text-md rounded-lg bg-gray-400/5 p-2 text-center'>
        {row.original.formattedAmount}
      </p>
    ),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => <RowActions transaction={row.original} />,
  },
];

const csvConfig = mkConfig({
  fieldSeparator: ',',
  decimalSeparator: '.',
  useKeysAsHeaders: true,
});

const TransatcionTable = ({ from, to }: Props) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const history = useQuery<GetTransactionsResponseType>({
    queryKey: ['transactions', from, to],
    queryFn: async () => {
      const response = await fetch(
        `/api/transactions-history?from=${DateToUTCDate(
          from
        )}&to=${DateToUTCDate(to)}`
      );
      return response.json();
    },
  });

  const handleExsportCsv = (data: any[]) => {
    const csv = generateCsv(csvConfig)(data);
    download(csvConfig)(csv);
  };

  const emptyData: any[] = [];
  const table = useReactTable({
    columns,
    data: history.data || emptyData,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const categoriesOpitons = useMemo(() => {
    const categoriesMap = new Map();
    history.data?.forEach((transaction) => {
      categoriesMap.set(transaction.category, {
        value: transaction.category,
        label: `${transaction.categoryIcon} (${transaction.category})`,
      });
    });

    const uniqueCategories = new Set(categoriesMap.values());
    return Array.from(uniqueCategories);
  }, [history.data]);

  return (
    <div className='w-full'>
      <div className=' flex items-end justify-between gap-2 py-4'>
        <div className=' flex gap-2'>
          {table.getColumn('category') && (
            <DataTableFacetedFilter
              title='Category'
              column={table.getColumn('category')}
              options={categoriesOpitons}
            />
          )}
          {table.getColumn('type') && (
            <DataTableFacetedFilter
              title='Type'
              column={table.getColumn('type')}
              options={[
                {
                  label: 'Income',
                  value: 'income',
                },
                {
                  label: 'Expense',
                  value: 'expense',
                },
              ]}
            />
          )}
        </div>
        <div className=' flex flex-wrap gap-2'>
          <Button
            variant={'outline'}
            size={'sm'}
            className='ml-auto h-8 lg:flex'
            onClick={() => {
              const data = table.getFilteredRowModel().rows.map((row) => ({
                category: row.original.category,
                description: row.original.description,
                date: row.original.date,
                type: row.original.type,
                amount: row.original.amount,
                formattedAmount: row.original.formattedAmount,
                categoryIcon: row.original.categoryIcon,
              }));
              handleExsportCsv(data);
            }}
          >
            <DownloadIcon className='w-4 h-4 mr-2' />
            Export CSV
          </Button>
          <DataTableViewOptions table={table} />
        </div>
      </div>
      <SkeletonWrapper isLoading={history.isFetching}>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className=' mt-2'>
          <DataTablePagination table={table} />
        </div>
      </SkeletonWrapper>
    </div>
  );
};

export default TransatcionTable;

function RowActions({ transaction }: { transaction: TransactionHistoryRow }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <DeleteTransactionDialog
        open={showDeleteDialog}
        setOpen={setShowDeleteDialog}
        transactionId={transaction.id}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={'ghost'} className=' h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontalIcon className='w-4 h-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className='flex items-center gap-2'
            onSelect={() => {
              setShowDeleteDialog((prev) => !prev);
            }}
          >
            <TrashIcon className='w-4 h-4 text-muted-foreground' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

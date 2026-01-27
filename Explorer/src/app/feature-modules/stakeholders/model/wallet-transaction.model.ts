export interface WalletTransactionDto {
  id: number;
  createdAtUtc: string;
  amountAc: number;
  type: number;
  description: string;
  referenceType?: string | null;
  referenceId?: number | null;
}

export interface PagedResultDto<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
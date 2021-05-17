import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map, tap } from 'rxjs/operators';
import { Observable, merge, BehaviorSubject } from 'rxjs';
import { BackendService } from '../backend.service';

export interface ListViewItem {
  id?: number;
  name?: string;
  completed?: boolean;
}

/**
 * Data source for the ListView view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class ListViewDataSource extends DataSource<ListViewItem> {
  data: ListViewItem[] = [];
  paginator: MatPaginator | undefined;
  sort: MatSort | undefined;
  hideCompleted = new BehaviorSubject(false);
  private dataSub;
  private routeSub;
  private _data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private url: Observable<any>, private backend: BackendService) {
    super();
    this.hideCompleted.next(false);
    this.routeSub = this.url.pipe(
      tap(() => {
        // console.log('fetch data')
        this._data = this.backend.tickets();
      })).subscribe();
    this.dataSub = this._data.subscribe(data => this.data = data);
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<ListViewItem[]> {
    if (this.paginator && this.sort) {
      // Combine everything that affects the rendered data into one update
      // stream for the data-table to consume.
      return merge(this._data, this.paginator.page, this.sort.sortChange, this.url, this.hideCompleted)
        .pipe(map(() => {
          const shouldHideCompleted = this.hideCompleted.getValue();
          const d = shouldHideCompleted
            ? [...this.data].filter(x => !x.completed)
            : [...this.data]
          return this.getPagedData(
            this.getSortedData(d)
          );
        }));
    } else {
      throw Error('Please set the paginator and sort on the data source before connecting.');
    }
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect(): void {
    this.dataSub.unsubscribe();
    this.routeSub.unsubscribe();
  }

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getPagedData(data: ListViewItem[]): ListViewItem[] {
    if (this.paginator) {
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      return data.splice(startIndex, this.paginator.pageSize);
    } else {
      return data;
    }
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: ListViewItem[]): ListViewItem[] {
    if (!this.sort || !this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort?.direction === 'asc';
      switch (this.sort?.active) {
        case 'name': return compare(a.name, b.name, isAsc);
        case 'id': return compare(+a.id, +b.id, isAsc);
        default: return 0;
      }
    });
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a: string | number, b: string | number, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

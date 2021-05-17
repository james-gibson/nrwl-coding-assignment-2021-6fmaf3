import { OnInit, AfterViewInit, Component, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { MatCheckbox } from '@angular/material/checkbox';

import { ListViewDataSource, ListViewItem } from './list-view-datasource';


import { BackendService } from '../backend.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'take-home-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss']
})
export class ListViewComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatCheckbox) hideCompletedInput!: MatCheckbox;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<ListViewItem>;
  dataSource: ListViewDataSource;
  isLoading: Observable<boolean>;
  filterAssignee$: Observable<string>;
  displayedColumns = ['id', 'name', 'completed'];

  loadingSubscription;
  completedSubscription;
  assigneeSubscription;
  constructor(private route: ActivatedRoute, private backend: BackendService) {
    this.dataSource = new ListViewDataSource(this.route.url, this.backend);
    this.isLoading = of(false);

    this.loadingSubscription = this.backend.isLoading().subscribe((loading) => {
      this.isLoading = of(loading);
    });
  }
  ngOnDestroy() {
    this.loadingSubscription.unsubscribe();
  }

  ngOnInit() {
    this.dataSource.hideCompleted.next(true);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
    this.hideCompletedInput.registerOnChange((input) => {
      this.dataSource.hideCompleted.next(input)
    })
  }
}

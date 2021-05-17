import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { BackendService, Ticket, User } from '../backend.service';
import { Observable, BehaviorSubject, of, combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'take-home-details-view',
  templateUrl: './details-view.component.html',
  styleUrls: ['./details-view.component.scss']
})
export class DetailsViewComponent implements OnInit, OnDestroy {
  ticketNumber: BehaviorSubject<number>;
  ticket: Ticket;
  ticketSub;
  ticketNumberSub;
  usersSub;
  isLoadingSub;
  saving = false;
  loading = false;
  users: Observable<User[]>
  loadingTicket: BehaviorSubject<boolean>;
  loadingUsers: BehaviorSubject<boolean>;
  createMode: boolean;

  name = new FormControl('', Validators.required);
  description = new FormControl('', Validators.required);
  assigneeId = new FormControl({ value: null, disabled: this.loading });
  completed = new FormControl(false);
  editTicketForm = this.fb.group({
    id: null,
    name: this.name,
    description: this.description,
    assigneeId: this.assigneeId,
    completed: this.completed,
  });

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute, private backend: BackendService) {
    this.ticketNumber = new BehaviorSubject(null);
    this.loading = true;
    this.saving = true;
    this.loadingTicket = new BehaviorSubject(false);
    this.loadingUsers = new BehaviorSubject(false);
  }
  ngOnInit() {
    this.editTicketForm.reset();

    this.loadingTicket.next(true);

    this.ticketNumberSub = this.ticketNumber.pipe(
      tap((newTicketId) => {
        if (!newTicketId) { return; }

        this.ticketSub = this.backend.ticket(newTicketId).pipe(tap((ticket) => {
          this.ticket = ticket;
          this.name.setValue(ticket?.name)
          this.assigneeId.setValue(ticket?.assigneeId)
          this.completed.setValue(ticket?.completed)
          this.loadingTicket.next(false);
          this.ticketSub.unsubscribe();
        })).subscribe()
      })
    ).subscribe()

    this.loading = true;

    this.loadingTicket.next(true);
    combineLatest([this.backend.users(), this.route.url, this.ticketNumber, this.loadingTicket]).pipe(
      tap((inputs) => {
        this.users = of(inputs[0]);
        this.loadingUsers.next(false);
      }),
      tap(() => {
        if (!this.loadingTicket.getValue()) { return; }
        const routeParams = this.route.snapshot.paramMap;
        const isNewTicketUrl = this.router.url == '/new-ticket';
        const ticketIdFromRoute = Number(routeParams.get('id'));

        if (isNewTicketUrl) {
          this.createMode = true;
          this.ticket = {} as Ticket;
          this.loadingTicket.next(false);
          return;
        }
        if (this.ticketNumber.getValue() === ticketIdFromRoute) { return; }
        this.createMode = false;
        this.ticketNumber.next(ticketIdFromRoute);
      }),
      tap(() => {
        const status = {
          isLoadingTicket: this.loadingTicket.getValue(),
          isLoadingUsers: this.loadingUsers.getValue(),
          hasTicket: !!this.ticket,
          ticket: this.ticket,
          isLoading: !this.loadingUsers.getValue() && !this.loadingTicket.getValue(),
        }

        if (status.isLoading && status.ticket) {
          this.loading = false;
        } else if (status.isLoading && !status.ticket) {
          console.error('Ticket not found, redirecting home');
          this.router.navigate([''], { relativeTo: this.route });
        }
      }),
    ).subscribe()
  }

  ngOnDestroy() {
    this.ticketNumberSub.unsubscribe();
  }

  onSubmit(): void {
    if (this.ticket.id) {
      this.backend.update(this.ticketNumber.getValue(), {
        name: this.name.value,
        completed: this.completed.value,
        assigneeId: this.assigneeId.value,
      });
    } else {
      this.backend.newTicket({
        id: null,
        name: this.name.value,
        completed: this.completed.value,
        assigneeId: this.assigneeId.value,
      })
    }

    this.editTicketForm.reset();
    this.router.navigate([''], { relativeTo: this.route });
  }
}

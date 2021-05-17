import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
/**
 * This service acts as a mock backend.
 *
 * You are free to modify it as you see.
 */
export enum State {
  LOADING = 'loading',
  SAVING = 'saving',
  ERROR = 'error',
  DEFAULT = 'default',
}

export type User = {
  id: number;
  name: string;
};

export type Ticket = {
  id: number;
  name: string;
  description?: string;
  assigneeId?: number;
  completed?: boolean;
};

function randomDelay() {
  return Math.random() * 100;
}

@Injectable()
export class BackendService {
  storedTickets: Ticket[] = [
    {
      id: 1,
      name: 'Improve monitor at workstation',
      assigneeId: 111,
      completed: false
    },
    {
      id: 2,
      name: 'Move workstation',
      assigneeId: 222,
      completed: true
    },
    {
      id: 3,
      name: 'Move Desk',
      assigneeId: null,
      completed: false
    }
  ];

  storedUsers: User[] = [
    { id: 111, name: 'Victor' },
    { id: 222, name: 'Jack' }
  ];

  lastId = 3;

  // Simple state
  loading = new BehaviorSubject(false);
  state = new BehaviorSubject(State.DEFAULT);
  message = of('');

  private findTicketById = id =>
    this.storedTickets.find(ticket => ticket.id === +id);

  private findUserById = id => this.storedUsers.find(user => user.id === +id);

  tickets() {
    return of(this.storedTickets).pipe(
      tap(() => {
        this.loading.next(true);
      }),
      delay(randomDelay()),
      tap(() => {
        this.loading.next(false);
      }),
    );
  }

  ticket(id: number): Observable<Ticket> {
    // console.log(this.findTicketById(id))
    return of(this.findTicketById(id)).pipe(
      tap(() => {
        this.loading.next(true);
      }),
      delay(randomDelay()),
      tap(() => {
        this.loading.next(false);
      }),
    );
  }

  users() {
    return of(this.storedUsers).pipe(delay(randomDelay()));
  }

  user(id: number) {
    return of(this.findUserById(id)).pipe(delay(randomDelay()));
  }

  newTicket(payload: Ticket) {
    const newTicket: Ticket = {
      id: ++this.lastId,
      name: payload.name,
      assigneeId: payload.assigneeId,
      completed: payload.completed,
    };

    this.storedTickets = this.storedTickets.concat(newTicket);

    return of(newTicket).pipe(delay(randomDelay()));
  }

  assign(ticketId: number, userId: number) {
    return this.update(ticketId, { assigneeId: userId });
  }

  complete(ticketId: number, completed: boolean) {
    return this.update(ticketId, { completed });
  }

  update(ticketId: number, updates: Partial<Omit<Ticket, 'id'>>) {
    const foundTicket = this.findTicketById(ticketId);

    if (!foundTicket) {
      return throwError(new Error('ticket not found'));
    }

    const updatedTicket = { ...foundTicket, ...updates };
    this.storedTickets = this.storedTickets.map(t =>
      t.id === ticketId ? updatedTicket : t
    );

    return of(updatedTicket).pipe(delay(randomDelay()));
  }



  isLoading() {
    return this.loading;
  }

  stateMessage() {
    return this.message;
  }
}

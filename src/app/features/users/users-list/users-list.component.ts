import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersService } from '../../../core/users/services/users.service';
import { User } from '../../../core/models/user.model';
import { getErrorMessage } from '../../../shared/utils/error-message';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css',
})
export class UsersListComponent implements OnInit {
  private readonly usersService = inject(UsersService);

  readonly users = signal<User[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadUsers();
  }

  banUser(user: User): void {
    if (!confirm(`Bannir l'utilisateur "${user.username}" ?`)) return;

    this.users.update((list) => list.filter((u) => u.id !== user.id));
    this.successMessage.set(`L'utilisateur "${user.username}" a été banni.`);

    setTimeout(() => this.successMessage.set(null), 3000);
  }

  trackById(_: number, user: User): number {
    return user.id;
  }

  roleClass(role: User['role']): string {
    return role === 'ADMIN' ? 'badge badge--admin' : 'badge badge--user';
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.usersService.loadAll().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(getErrorMessage(err, 'Impossible de charger les utilisateurs'));
        this.loading.set(false);
      },
    });
  }
}

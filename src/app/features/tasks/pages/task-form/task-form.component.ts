import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TasksService } from '../../../../core/tasks/services/tasks.service';
import { UsersService } from '../../../../core/users/services/users.service';
import { AuthService } from '../../../../core/auth/services/auth.service';

import { User } from '../../../../core/models/user.model';
import { Task, TaskStatus, CreateTaskRequest, UpdateTaskRequest } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './task-form.component.html',
})
export class TaskFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tasksService = inject(TasksService);
  private usersService = inject(UsersService);
  private auth = inject(AuthService);

  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = this.tasksService.loading;
  error = this.tasksService.error;

  isAdmin = this.auth.isAdmin;
  users = signal<User[]>([]);

  statuses: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'DONE'];

  id = computed(() => {
    const raw = this.route.snapshot.paramMap.get('id');
    return raw ? Number(raw) : null;
  });

  isEdit = computed(() => this.id() !== null);

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    status: ['PENDING' as TaskStatus, [Validators.required]],

    // ✅ TON API : targetUserId (admin only)
    targetUserId: [null as number | null],
  });

  ngOnInit(): void {
    // Admin: charger la liste des users (GET /users)
    if (this.isAdmin()) {
      this.usersService.loadAll().subscribe({
        next: (u) => this.users.set(u),
        error: (err) => {
          console.log('LOAD USERS ERROR', err);
          this.tasksService.setError(err?.error?.message ?? 'Impossible de charger les utilisateurs');
        },
      });
    }

    // Edit: charger la task et pré-remplir
    const id = this.id();
    if (!id) return;

    this.tasksService.getById(id).subscribe({
      next: (t: Task) => {
        this.form.setValue({
          title: t.title,
          description: t.description ?? '',
          status: t.status,
          targetUserId: t.user?.id ?? null,
        });
      },
      error: (err) => {
        console.log('GET TASK ERROR', err);
        this.tasksService.setError(err?.error?.message ?? 'Tâche introuvable');
      },
    });
  }

  submit(): void {
    this.tasksService.setError(null);

    if (this.form.invalid) return;

    const id = this.id();
    const raw = this.form.getRawValue();

    const basePayload = {
      title: raw.title,
      description: raw.description ? raw.description : undefined,
      status: raw.status,
    };

    // USER: n'envoie jamais targetUserId
    // ADMIN: envoie targetUserId seulement si choisi
    const adminAssign =
      this.isAdmin() && raw.targetUserId != null
        ? { targetUserId: raw.targetUserId }
        : {};

    if (!id) {
      const payload: CreateTaskRequest = {
        ...basePayload,
        ...adminAssign,
      };

      this.tasksService.create(payload).subscribe({
        next: () => this.router.navigateByUrl('/tasks'),
        error: (err) => {
          console.log('CREATE TASK ERROR', err);
          this.tasksService.setError(err?.error?.message ?? 'Création impossible');
        },
      });

      return;
    }

    const payload: UpdateTaskRequest = {
      ...basePayload,
      ...adminAssign,
    };

    this.tasksService.update(id, payload).subscribe({
      next: () => this.router.navigateByUrl('/tasks'),
      error: (err) => {
        console.log('UPDATE TASK ERROR', err);
        this.tasksService.setError(err?.error?.message ?? 'Modification impossible');
      },
    });
  }
}

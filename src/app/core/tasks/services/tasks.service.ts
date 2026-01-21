import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private _tasks = signal<Task[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  tasks = this._tasks.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  hasTasks = computed(() => this._tasks().length > 0);

  setError(message: string | null) {
    this._error.set(message);
  }

  /** GET /tasks */
  loadAll() {
    this._error.set(null);
    this._loading.set(true);

    return this.http.get<Task[]>(`${this.apiUrl}/tasks`).pipe(
      tap((tasks) => this._tasks.set(tasks)),
      finalize(() => this._loading.set(false))
    );
  }

  /** ✅ GET /tasks/:id */
  getTaskById(id: number) {
    this._error.set(null);
    return this.http.get<Task>(`${this.apiUrl}/tasks/${id}`);
  }

  /** POST /tasks */
  create(payload: CreateTaskRequest) {
    this._error.set(null);

    return this.http.post<Task>(`${this.apiUrl}/tasks`, payload).pipe(
      tap((created) => this._tasks.update((arr) => [created, ...arr]))
    );
  }

  /** PATCH /tasks/:id */
  update(id: number, payload: UpdateTaskRequest) {
    this._error.set(null);

    return this.http.patch<Task>(`${this.apiUrl}/tasks/${id}`, payload).pipe(
      tap((updated) => {
        this._tasks.update((arr) =>
          arr.map((t) => (t.id === id ? updated : t))
        );
      })
    );
  }

  /** DELETE /tasks/:id */
  remove(id: number) {
    this._error.set(null);

    return this.http.delete<void>(`${this.apiUrl}/tasks/${id}`).pipe(
      tap(() => this._tasks.update((arr) => arr.filter((t) => t.id !== id)))
    );
  }

  getById(id: number) {
    return this.getTaskById(id);
  }

}

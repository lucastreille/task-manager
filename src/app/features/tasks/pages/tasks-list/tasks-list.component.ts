import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { TasksService } from '../../../../core/tasks/services/tasks.service';
import { Task, TaskStatus } from '../../../../core/models/task.model';
import { getErrorMessage } from '../../../../shared/utils/error-message';

type FilterType = 'ALL' | 'PENDING' | 'DONE';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tasks-list.component.html',
  styleUrl: './tasks-list.component.css',
})
export class TasksListComponent implements OnInit {
  private readonly tasksService = inject(TasksService);

  readonly tasks = this.tasksService.tasks;
  readonly loading = this.tasksService.loading;
  readonly error = this.tasksService.error;

  readonly activeFilter = signal<FilterType>('ALL');

  private readonly filteredTasks = computed(() => {
    const filter = this.activeFilter();
    const allTasks = this.tasks();

    switch (filter) {
      case 'PENDING':
        return allTasks.filter((t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS');
      case 'DONE':
        return allTasks.filter((t) => t.status === 'DONE');
      default:
        return allTasks;
    }
  });

  readonly pendingTasks = computed(() =>
    this.filteredTasks()
      .filter((t) => t.status === 'PENDING')
      .sort(this.sortByUpdatedDesc)
  );

  readonly inProgressTasks = computed(() =>
    this.filteredTasks()
      .filter((t) => t.status === 'IN_PROGRESS')
      .sort(this.sortByUpdatedDesc)
  );

  readonly doneTasks = computed(() =>
    this.filteredTasks()
      .filter((t) => t.status === 'DONE')
      .sort(this.sortByUpdatedDesc)
  );

  ngOnInit(): void {
    this.tasksService.loadAll().subscribe({
      error: (err: unknown) => {
        this.tasksService.setError(getErrorMessage(err, 'Impossible de charger les tâches'));
      },
    });
  }

  setFilter(filter: FilterType): void {
    this.activeFilter.set(filter);
  }

  trackById(_: number, task: Task): number {
    return task.id;
  }

  delete(id: number): void {
    if (!confirm('Supprimer cette tâche ?')) return;

    this.tasksService.remove(id).subscribe({
      error: (err: unknown) => {
        this.tasksService.setError(getErrorMessage(err, 'Suppression impossible'));
      },
    });
  }

  badgeClass(status: TaskStatus): string {
    const classes: Record<TaskStatus, string> = {
      DONE: 'badge badge--done',
      IN_PROGRESS: 'badge badge--progress',
      PENDING: 'badge badge--todo',
    };
    return classes[status];
  }

  private sortByUpdatedDesc(a: Task, b: Task): number {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  }
}

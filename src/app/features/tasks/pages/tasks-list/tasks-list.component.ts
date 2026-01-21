import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TasksService } from '../../../../core/tasks/services/tasks.service';
import { Task } from '../../../../core/models/task.model';
import { getErrorMessage } from '../../../../shared/utils/error-message';

type BoardStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tasks-list.component.html',
  styleUrl: './tasks-list.component.css',
})
export class TasksListComponent implements OnInit {
  private tasksService = inject(TasksService);

  tasks = this.tasksService.tasks;
  loading = this.tasksService.loading;
  error = this.tasksService.error;

  // ✅ Colonnes façon Jira (tri & group)
  readonly pendingTasks = computed(() =>
    this.tasks()
      .filter((t) => t.status === 'PENDING')
      .sort(this.sortByUpdatedDesc)
  );

  readonly inProgressTasks = computed(() =>
    this.tasks()
      .filter((t) => t.status === 'IN_PROGRESS')
      .sort(this.sortByUpdatedDesc)
  );

  readonly doneTasks = computed(() =>
    this.tasks()
      .filter((t) => t.status === 'DONE')
      .sort(this.sortByUpdatedDesc)
  );

  ngOnInit(): void {
    this.tasksService.loadAll().subscribe({
      error: (err: unknown) => {
        console.log('LOAD TASKS ERROR', err);
        this.tasksService.setError(getErrorMessage(err, 'Impossible de charger les tâches'));
      },
    });
  }

  trackById(_: number, t: Task) {
    return t.id;
  }

  delete(id: number): void {
    if (!confirm('Supprimer cette tâche ?')) return;

    this.tasksService.remove(id).subscribe({
      error: (err: unknown) => {
        console.log('DELETE TASK ERROR', err);
        this.tasksService.setError(getErrorMessage(err, 'Suppression impossible'));
      },
    });
  }

  private sortByUpdatedDesc(a: Task, b: Task): number {
    const ad = new Date(a.updatedAt).getTime();
    const bd = new Date(b.updatedAt).getTime();
    return bd - ad;
  }

  // helper pour badge (class css)
  badgeClass(status: BoardStatus): string {
    if (status === 'DONE') return 'badge badge--done';
    if (status === 'IN_PROGRESS') return 'badge badge--progress';
    return 'badge badge--todo';
  }
}

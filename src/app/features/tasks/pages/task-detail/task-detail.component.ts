import { Component, Input, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TasksService } from '../../../../core/tasks/services/tasks.service';
import { Task } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './task-detail.component.html',
})
export class TaskDetailComponent {
  private tasksService = inject(TasksService);

  @Input({ required: true }) id!: string;

  private _task = signal<Task | null>(null);
  task = computed(() => this._task());

  badgeClass = computed(() => {
    const t = this._task();
    if (!t) return '';
    if (t.status === 'DONE') return 'badge-done';
    if (t.status === 'IN_PROGRESS') return 'badge-inprogress';
    return 'badge-pending';
  });

  ngOnInit(): void {
    const taskId = Number(this.id);

    this.tasksService.getById(taskId).subscribe({
      next: (t: Task) => this._task.set(t),
      error: () => this._task.set(null),
    });
  }
}

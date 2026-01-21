import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { TasksService } from '../../core/tasks/services/tasks.service';
import { AuthService } from '../../core/auth/services/auth.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
    private tasksService = inject(TasksService);
    private authService = inject(AuthService);
    private router = inject(Router);

    tasks = this.tasksService.tasks;
    loading = this.tasksService.loading;
    error = this.tasksService.error;

    username = this.authService.username;
    isAdmin = this.authService.isAdmin;

    totalTasks = computed(() => {
        if (!this.isAdmin()) return null;
        return this.tasks().length;
    });

    completedTasks = computed(() => {
        return this.tasks().filter(task => task.status === 'DONE').length;
    });

    myTasks = computed(() => {
        const currentUsername = this.username();
        if (!currentUsername) return 0;
        return this.tasks().filter(task => task.user.username === currentUsername).length;
    });

    completionPercentage = computed(() => {
        const total = this.tasks().length;
        if (total === 0) return 0;
        const completed = this.completedTasks();
        return Math.round((completed / total) * 100);
    });

    ngOnInit(): void {
        this.tasksService.loadAll().subscribe({
            error: (err) => {
                console.error('Erreur lors du chargement des tâches:', err);
                this.tasksService.setError('Impossible de charger les statistiques');
            }
        });
    }

    navigateToTasks(): void {
        this.router.navigateByUrl('/tasks');
    }
}

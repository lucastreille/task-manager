import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommentsService } from '../../../core/comments/services/comments.service';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Comment } from '../../../core/models/comment.model';

/**
 * Composant affichant la liste des commentaires d'une tâche
 * avec un formulaire pour en ajouter de nouveaux.
 */
@Component({
    selector: 'app-comments-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './comments-list.component.html',
    styleUrl: './comments-list.component.css',
})
export class CommentsListComponent implements OnInit {
    /** ID de la tâche (reçu du parent) */
    @Input({ required: true }) taskId!: number;

    private commentsService = inject(CommentsService);
    private authService = inject(AuthService);
    private fb = inject(FormBuilder);

    /** Signal des commentaires filtrés par tâche */
    private _taskComments = signal<Comment[]>([]);
    taskComments = computed(() => this._taskComments());

    /** Formulaire réactif pour ajouter un commentaire */
    commentForm = this.fb.nonNullable.group({
        message: ['', [Validators.required, Validators.minLength(1)]],
    });

    /** Pseudo de l'utilisateur connecté */
    currentUsername = computed(() => this.authService.username() ?? 'Anonyme');

    ngOnInit(): void {
        this.loadComments();
    }

    /**
     * Charge les commentaires pour la tâche courante.
     */
    private loadComments(): void {
        const commentsSignal = this.commentsService.getCommentsByTaskId(this.taskId);
        this._taskComments.set(commentsSignal());
    }

    /**
     * Soumet le formulaire et ajoute un nouveau commentaire.
     */
    onSubmit(): void {
        if (this.commentForm.invalid) {
            return;
        }

        const message = this.commentForm.getRawValue().message.trim();
        if (!message) {
            return;
        }

        this.commentsService.addComment({
            taskId: this.taskId,
            author: this.currentUsername(),
            message,
        });

        // Recharge les commentaires depuis le service
        this.loadComments();

        // Reset le formulaire
        this.commentForm.reset();
    }
}

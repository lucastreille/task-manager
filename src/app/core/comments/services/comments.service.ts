import { Injectable, computed, signal } from '@angular/core';
import { Comment, CreateCommentRequest } from '../../models/comment.model';

/**
 * Service de gestion des commentaires (stockage local avec Signals).
 * Les commentaires sont stockés en mémoire et filtrés par tâche.
 */
@Injectable({ providedIn: 'root' })
export class CommentsService {
    /** Liste de tous les commentaires (données fictives initiales) */
    private _comments = signal<Comment[]>([
        {
            id: 1,
            taskId: 1,
            author: 'alice',
            message: 'Super tâche, je commence tout de suite !',
            createdAt: new Date('2024-01-15T10:30:00'),
        },
        {
            id: 2,
            taskId: 1,
            author: 'bob',
            message: "N'oublie pas de vérifier les tests unitaires.",
            createdAt: new Date('2024-01-15T11:45:00'),
        },
        {
            id: 3,
            taskId: 2,
            author: 'charlie',
            message: 'Cette fonctionnalité est prioritaire pour le sprint.',
            createdAt: new Date('2024-01-16T09:00:00'),
        },
    ]);

    /** Compteur pour générer des IDs uniques */
    private _nextId = signal(4);

    /** Signal public en lecture seule */
    comments = this._comments.asReadonly();

    /**
     * Retourne les commentaires filtrés pour une tâche spécifique.
     * @param taskId - ID de la tâche
     * @returns Signal computed des commentaires triés par date (récent en dernier)
     */
    getCommentsByTaskId(taskId: number) {
        return computed(() =>
            this._comments()
                .filter((c) => c.taskId === taskId)
                .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        );
    }

    /**
     * Ajoute un nouveau commentaire à la liste locale.
     * @param request - Données du commentaire à créer
     * @returns Le commentaire créé
     */
    addComment(request: CreateCommentRequest): Comment {
        const newComment: Comment = {
            id: this._nextId(),
            taskId: request.taskId,
            author: request.author,
            message: request.message,
            createdAt: new Date(),
        };

        this._comments.update((current) => [...current, newComment]);
        this._nextId.update((id) => id + 1);

        return newComment;
    }
}

/**
 * Modèle représentant un commentaire sur une tâche.
 */
export interface Comment {
  id: number;
  taskId: number;
  author: string;
  message: string;
  createdAt: Date;
}

/**
 * Payload pour créer un nouveau commentaire.
 */
export interface CreateCommentRequest {
  taskId: number;
  author: string;
  message: string;
}

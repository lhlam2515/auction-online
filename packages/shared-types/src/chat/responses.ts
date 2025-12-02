/**
 * Chat room response
 */
export interface ChatRoomResponse {
  id: string;
  name: string;
  participants: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Unread count response
 */
export interface UnreadCountResponse {
  count: number;
}

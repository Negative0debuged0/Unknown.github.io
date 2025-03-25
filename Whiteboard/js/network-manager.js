// Handles real-time synchronization
export class NetworkManager {
    constructor(roomId, elementManager, historyManager) {
        this.roomId = roomId;
        this.elementManager = elementManager;
        this.historyManager = historyManager;
        this.userId = `user_${Math.random().toString(36).substring(2, 15)}`;
    }
    
    initialize() {
        // Simplified initialization without network connectivity
        document.getElementById('users-count').textContent = '1';
    }
    
    joinRoom() {
        // No network room to join
    }
    
    startHeartbeat() {
        // No need for heartbeat without network
    }
    
    updateUserCount() {
        // Always show 1 user
        const countElement = document.getElementById('users-count');
        if (countElement) {
            countElement.textContent = '1';
        }
    }
    
    listenForElements() {
        // No network elements to listen for
    }
    
    syncElement(element) {
        // No sync needed
    }
    
    removeElement(elementId) {
        // No sync needed
    }
    
    syncClearWhiteboard() {
        // No sync needed
    }
    
    updateURL() {
        // No need to update URL with room ID
    }
    
    setupResizeSync() {
        // No resize sync needed
    }
}
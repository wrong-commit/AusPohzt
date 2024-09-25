export { deleteQueued };

/**
 * Deletes a parcel from the API
 * @param trackingId tracking id 
 * @returns true on delete
 */
async function deleteQueued(trackingId: string): Promise<boolean> {
    const request = new Request(`${API_URL}/v0/queue/${trackingId}`);
    return fetch(request, {
        method: 'DELETE'
    }).then(res => {
        if (!res.ok) {
            throw new Error('API failed deleting queued')
        }
        return true;
    })
        .catch(err => {
            console.error(`Could not delete queued ${trackingId}`, err)
            return false;
        })
}
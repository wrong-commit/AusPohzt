export { deleteParcel };

/**
 * Deletes a parcel from the API
 * @param id 
 * @returns 
 */
async function deleteParcel(id: number): Promise<boolean> {
    const request = new Request(`${API_URL}/v0/parcel/${id}`);
    return fetch(request, {
        method: 'DELETE'
    }).then(res => {
        if (!res.ok) {
            throw new Error('API failed deleting parcel')
        }
        return true;
    })
        .catch(err => {
            console.error(`Could not delete parcel ${id}`, err)
            return false;
        })
}
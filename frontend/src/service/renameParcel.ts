export { renameParcel };

/**
 * Renames a parcel from the API
 * @param id 
 * @returns 
 */
async function renameParcel(id: number, nickname: string): Promise<boolean> {
    const request = new Request(`http://localhost:3000/v0/parcel/${id}/nickname?nickname=${nickname}`);
    return fetch(request, {
        method: 'PUT',
    }).then(res => {
        if (!res.ok) {
            throw new Error('API failed renaming parcel')
        }
        return true;
    })
        .catch(err => {
            console.error(`Could not rename parcel ${id}`, err)
            return false;
        })
}
export { addParcel }

async function addParcel(trackingId: string): Promise<boolean | undefined> {
    const request = new Request(`http://localhost:3000/v0/queue/${trackingId}`);
    return await fetch(request, {
        method: 'POST'
    }).then(res => {
        if (!res.ok) {
            throw new Error('API failed queueing parcel')
        }
        return true;
    })
        .catch(err => {
            console.error(`Could not queue parcel ${trackingId}`, err)
            return false;
        })
}
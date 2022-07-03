import { api } from "@boganpost/backend/src/services/api";
import e from "cors";
import React, { useEffect, useState } from "react"
import { useAsync } from "../hooks/useAsync";

export { Login }

type Props = {
    children: (userId: number) => React.ReactChildren | React.ReactChild;
}
const Login = ({ children }: Props) => {
    const [userId, setUserId] = useState<null | number>(null);

    const [user, setUser] = useState('admin');
    const [pass, setPass] = useState('nimda');

    const [result, trigger, loading] = useAsync(async () => {
        const client = api.init('http://localhost:3000/');
        let resp = await client.post('/v0/auth/login', {
            headers: {
                'Authorization': 'Bearer: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.95BEPOhEI6NVx-QD3Ssikum3qQuvTRdSBoQr7aAuDHA',
            },
            params: {
                'username': user,
                'password': pass,
            },
        }).catch(err => {
            console.error(`Error fetching queued`, err);
            return false;
        });
        return true;
    }, undefined);

    useEffect(() => {
        setUserId(0);
    }, [result]);
    return (
        <>
            {userId != null && children(userId)}
            {userId == null && (
                <div className={'login'}>
                    <input type={'text'} value={user} onChange={e => setUser(e.target.value)} />
                    <input type={'password'} value={pass} onChange={e => setPass(e.target.value)} />
                    <button onClick={() => trigger()}>
                        sign in
                    </button>
                    {loading && (
                        <span>waiting...</span>
                    )}
                    {result && (
                        <span>AUTHENTICATED</span>
                    )}
                </div>
            )}
        </>
    )
}
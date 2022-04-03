// import { api } from "@boganpost/backend/src/services/api";
import { api } from "@boganpost/backend/src/services/api";
import { jwtApi } from "@boganpost/backend/src/services/jwtApi";
import React, { useEffect, useRef, useState } from "react"
import { useAsync } from "../hooks/useAsync";

export { Login }

type LoginResp = {

}

type Props = {
    children: (userId: number, client: api) => React.ReactChildren | React.ReactChild;
}
const Login = ({ children }: Props) => {
    const apiRef = useRef(jwtApi.initWithToken('http://localhost:3000/', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.95BEPOhEI6NVx-QD3Ssikum3qQuvTRdSBoQr7aAuDHA'));
    const mountRef = useRef<any>(undefined);
    const [userId, setUserId] = useState<null | number>(null);

    const [user, setUser] = useState('admin');
    const [pass, setPass] = useState('nimda');

    const [result, trigger, loading] = useAsync(async () => {
        return apiRef.current.login(user, pass);
    }, undefined);

    useEffect(() => {
        if (result) {
            setUserId(0);
            alert('token ' + result.token);
        }
    }, [result]);

    useEffect(() => {
        if (!mountRef.current) {
            // check if use authed
            const client = jwtApi.init('http://localhost:3000/');
            let resp = client.get('/v0/auth/')
                .then(r => r.json())
                .catch(e => {
                    console.error(`Error fetching queued`, e);
                    return false;
                });
            if (typeof resp === 'boolean' && resp) {
                setUserId(0);
            }
        }
        return function () { mountRef.current = true };
    });

    return (
        <>
            {userId != null && children(userId, apiRef.current)}
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
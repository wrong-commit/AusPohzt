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
    // FIXME: this should be set by a Webpack environment variable
    const apiRef = useRef((jwtApi.init(process.env.API_URL) as jwtApi));
    // const apiRef = useRef(jwtApi.initWithToken('http://localhost:3000/', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.95BEPOhEI6NVx-QD3Ssikum3qQuvTRdSBoQr7aAuDHA'));
    const mountRef = useRef<any>(undefined);
    const [userId, setUserId] = useState<null | number>(null);

    const [user, setUser] = useState('admin');
    const [pass, setPass] = useState('nimda');

    const [result, trigger, loading] = useAsync(async () => {
        return (apiRef.current).login(user, pass);
    }, undefined);

    useEffect(() => {
        if (result) {
            setUserId(0);
        }
    }, [result]);

    useEffect(() => {
        if (!mountRef.current) {
            // check if use authed
            const client = jwtApi.init(process.env.API_URL);
            let resp = client.get('/v0/auth')
                .then(r => r.json())
                .catch(e => {
                    console.error(`Error fetching queued`, e);
                    return false;
                }).then(resp => { 
                    if(typeof resp === 'boolean' && resp) { 
                        if(mountRef.current == false) { 
                            setUserId(0)
                        }
                    }
                })
            if (typeof resp === 'boolean' && resp) {
                setUserId(0);
            }
        }
        return function () { mountRef.current = true };
    });

    return (
        <LoginUi apiRef={apiRef}
        children={children}
        loading={loading}
        pass={pass}
        result={result}
        setPass={setPass}
        setUser={setUser}
        trigger={trigger}
        user={user}
        userId={userId}
        />
    )
}

type UIProps = { 
userId: number | null;
apiRef: React.MutableRefObject<jwtApi>,
children: (userId: number, client: api) => React.ReactChildren | React.ReactChild;
user: string;
pass: string;
setUser: (x:string)=>void;
setPass: (x:string)=>void;
trigger: () => void;
loading: boolean;
result:{ token: string; } | undefined
}
function LoginUi(props:UIProps) { 
    return (
        <>
            {props.userId != null && props.children(props.userId, props.apiRef.current)}
            {props.userId == null && (
                <div className={'login'}>
                    <input type={'text'} value={props.user} onChange={e => props.setUser(e.target.value)} />
                    <input type={'password'} value={props.pass} onChange={e => props.setPass(e.target.value)} />
                    <button onClick={() => props.trigger()}>
                        sign in
                    </button>
                    {props.loading && (
                        <span style={{color:'white'}}>waiting...</span>
                    )}
                    {props.result && (
                        <span style={{color:'white'}}>AUTHENTICATED</span>
                    )}
                </div>
            )}
        </>
    )
}
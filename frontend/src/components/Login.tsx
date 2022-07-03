import React, { useState } from "react"

export { Login }

type Props = {
    children: (userId: number) => React.ReactChildren | React.ReactChild;
}
const Login = ({ children }: Props) => {
    const [userId, setUserId] = useState<null | number>(0);

    return (
        <>
            {userId != null && children(userId)}
            {userId == null && (
                <div className={'login'}>
                    <input type={'text'} />
                    <input type={'password'} />
                </div>
            )}
        </>
    )
}
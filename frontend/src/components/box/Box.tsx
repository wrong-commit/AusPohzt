import React from "react"

import '../../styles/components/Box.css';

export { Box }
type Props = {
    children: React.ReactNode;
    title: string;
    /**
     * If defined, close button is visible. Called when close button pressed
     */
    onClose?: () => void;
}

const Box = (props: Props) => {
    // TODO: make draggable
    // TODO: make resizable with minimum dimensions
    // TODO: make 
    return (
        <div className={'Box'}>
            <div data-box-header>
                <h3>{props.title}</h3>
                {props.onClose && (
                    <span onClick={() => props.onClose!()}
                        style={{
                            width: '1rem',
                            height: '1rem',
                            cursor: 'pointer'
                        }}>X</span>
                )}
            </div>
            <div data-box-body>
                {props.children}
            </div>
        </div>
    )
}
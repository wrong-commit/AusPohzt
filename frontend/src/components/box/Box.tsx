import React, { useRef } from "react"
import { useDraggable } from "../../hooks/useDraggable";

import '../../styles/components/Box.css';
import '../../styles/components/draggable.css';

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
    const ref = useRef<HTMLDivElement | null>(null);
    const [draggableProps, position, setPosition] = useDraggable(ref);
    // TODO: make resizable with minimum dimensions
    // TODO: make 
    return (
        <div {...draggableProps} //ref={r => ref.current = r} draggable
            className={'Box draggable'}
            style={{
                left: position.x ?? 0,
                top: position.y ?? 0,
            }}>
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
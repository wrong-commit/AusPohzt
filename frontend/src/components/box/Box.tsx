import React, { useEffect, useRef } from "react"
import { useWindowDispatch } from "../../context/WindowContext";
import { useDraggable } from "../../hooks/useDraggable";

import '../../styles/components/Box.css';
import '../../styles/components/draggable.css';

export { Box, BoxUI}

type Props = {
    id: string;
    children: React.ReactNode;
    title: string;
    /* Minimum width     */
    minWidth?: number;
    /* Minimum height */
    minHeight?: number;
    /* Default X */
    defaultX?: number;
    /* Default Y */
    defaultY?: number;
    /**
     * If defined, close button is visible. Called when close button pressed
     */
    onClose?: () => void;
}

const Box = (props: Props) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const windowDispatch = useWindowDispatch();
    const [draggableProps, position, setPosition] = useDraggable(ref, {
        x: props.defaultX,
        y: props.defaultY,
    });

    useEffect(() => {
        windowDispatch({
            type: 'add',
            id: props.id,
            ref,
            name: props.title,
            dim: [0, 0],
            pos: [position.x!, position.y!],
        })
    }, [ref]);

    useEffect(() => {
        if (position.x && position.y) {
            windowDispatch({
                id: props.id,
                type: 'position',
                pos: [position.x, position.y],
            })
        }
    }, [position])

    const close = () => {
        windowDispatch({
            id: props.id,
            type: 'remove',
        })
        props.onClose && props.onClose();
    }

    // TODO: save positions
    return (
        <BoxUI children={props.children}
        id={props.id}
        title={props.title}
        minHeight={props.minHeight}
        minWidth={props.minWidth}
        onClose={close} 
        // x={position.x}
        // y={position.y}
        />
    )
}

type UIProps = { 
    id:string;
    children: React.ReactNode
    title:string;
    onClose?: VoidFunction
    
    minWidth?: number;
    minHeight?: number;
}
function BoxUI(props:UIProps) { 
    return (
        <div
            className={'Box'}
            data-box-id={props.id}
            style={{
                minWidth: props.minWidth,
                minHeight:props.minHeight,
                maxWidth: props.minWidth,
                maxHeight:props.minHeight,
            }}>
            <div data-box-header>
                <h3>{props.title}</h3>
                {/* {props.onClose && (
                    <span onClick={close}
                        style={{
                            width: '1rem',
                            height: '1rem',
                            cursor: 'pointer'
                        }}>X</span>
                )} */}
            </div>
            <div data-box-body>
                {props.children}
            </div>
        </div>
    )
}

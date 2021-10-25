import React, { useEffect, useRef } from "react"
import { useWindowDispatch } from "../../context/WindowContext";
import { useDraggable } from "../../hooks/useDraggable";

import '../../styles/components/Box.css';
import '../../styles/components/draggable.css';

export { Box }

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
        <div {...draggableProps}
            ref={r => ref.current = r}
            className={'Box draggable'}
            style={{
                left: position.x ?? 0,
                top: position.y ?? 0,
            }}>
            <div data-box-header>
                <h3>{props.title}</h3>
                {props.onClose && (
                    <span onClick={close}
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
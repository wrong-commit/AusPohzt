import { useCallback, useEffect, useRef, useState } from "react";

export { useDraggable };

type MouseHandler = (e: MouseEvent) => void;

type Position = {
    x: number | undefined,
    y: number | undefined,
}
type DraggableProps = {
    draggable: boolean;
}

const useDraggable = <T extends HTMLElement>(
    container: React.MutableRefObject<T | null>,
    defaultPosition?: Position):
    [DraggableProps, Position, React.Dispatch<React.SetStateAction<Position>>] => {
    if (container.current && !container.current?.draggable) {
        console.warn(`Element ${container} is not draggable=true`, container)
        throw new Error(`Element ${container} is not draggable=true`);
    }
    /* Store position of draggable originally clicked. */
    const originalDisplayStyle = useRef('');
    const start = useRef({ x: 0, y: 0 });
    const [position, setPosition] = useState({
        x: defaultPosition?.x ?? container.current?.clientLeft,
        y: defaultPosition?.y ?? container.current?.clientTop,
    })

    const onDragStart: MouseHandler = useCallback(e => {
        if (e.target != e.currentTarget) {
            console.log('Didnt click header')
        }
        // setup event listeners for move and mouse up
        // console.debug('Started Dragging')
        originalDisplayStyle.current = (e.target as HTMLElement).style.display

        // setup event listeners now dragging has started
        container.current?.removeEventListener('dragstart', onDragStart);
        document.addEventListener('drop', onDrop);
        document.addEventListener('dragover', onDragOver)
        container.current?.addEventListener('dragend', onDragEnd);

        start.current = {
            x: e.clientX,
            y: e.clientY,
        }

        setTimeout(() => (e.target as HTMLElement).style.display = 'none', 1)
    }, [container]);

    const onDragEnd: MouseHandler = useCallback(e => {
        // console.debug('Ended Dragging');
        const target = (e.target as HTMLElement);
        target.style.display = originalDisplayStyle.current;

        const adjustedX = start.current.x - e.clientX
        const adjustedY = start.current.y - e.clientY;

        if (container.current) {
            container.current!.style.top = `${target.offsetTop - adjustedY}px`;
            container.current!.style.left = `${target.offsetLeft - adjustedX}px`;
        }
        // reset event listeners now dragging has handed
        document.removeEventListener('drop', onDrop);
        document.removeEventListener('dragover', onDragOver)
        container.current?.removeEventListener('dragend', onDragEnd);
        container.current?.addEventListener('dragstart', onDragStart);
    }, [container]);

    const onDrop: MouseHandler = useCallback(e => {
        // console.debug('Dropped');
        e.preventDefault();
    }, [container]);

    const onDragOver: MouseHandler = useCallback(e => {
        // console.debug('Drag Over');
        e.preventDefault();
    }, [container]);

    useEffect(() => {
        console.log('Registering Drag Start');
        container.current?.addEventListener('dragstart', onDragStart);

        return function cleanup() {
            console.log('Unregistering Drag events');
            container.current?.removeEventListener('dragstart', onDragStart);
            document.removeEventListener('drop', onDrop);
            document.removeEventListener('dragover', onDragOver)
            container.current?.removeEventListener('dragend', onDragEnd);
        }
    }, [container, container.current])

    return [
        {
            draggable: true
        },
        position,
        setPosition];
}

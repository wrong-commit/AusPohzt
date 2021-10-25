import React from 'react';
import { useWindowDispatch, useWindowState, WindowState } from '../../context/WindowContext';

import '../../styles/components/taskbar/TaskBar.css';

export { TaskBar }

type Props = {}

const TaskBar = (props: Props) => {

    const windowState = useWindowState();
    const windowDispatch = useWindowDispatch();

    return (<div className={'TaskBar'}>
        {Object.keys(windowState).map((id: keyof WindowState) => (
            <TaskBarItem key={id}
                hidden={windowState[id]!.hidden}
                onClick={(show) =>
                    windowDispatch({
                        id,
                        type: show ? 'show' : 'hide',
                    })
                }>
                {windowState[id]!.name}
            </TaskBarItem>
        ))}
    </div>)
};

type ItemProps = {
    children: string;
    hidden: boolean;
    onClick: (hidden: boolean) => void;
    // TODO: add onHover 
}
const TaskBarItem = (props: ItemProps) => {
    return (
        <div className={'TaskBarItem'} data-hidden={props.hidden} onClick={() => props.onClick(props.hidden)}>
            {props.children}
        </div>
    )
}
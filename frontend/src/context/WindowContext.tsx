import React from 'react';

type State = {

    /* example: { 
        '1-2-3-4': {hidden: boolean, pos: [x,y], dim: [w,h] }
    }
    */
    [uuid in string]: {
        name: string;
        ref: React.MutableRefObject<HTMLDivElement | null>;
        hidden: boolean,
        pos: [number, number],
        dim: [number, number],
    };
}
type Action = {
    type: 'add' | 'remove' | 'hide' | 'show' | 'position';
    id: string;
    ref?: React.MutableRefObject<HTMLDivElement | null>;
    name?: string;
    pos?: [number, number];
    dim?: [number, number];
}

type Children = { children?: React.ReactNode; }

function LockReducer(state: State, action: Action): State {
    let newState: State;
    switch (action.type) {
        // add a window, requires initial position and dimension
        case 'add': {
            newState = { ...state };
            if (action.pos && action.dim && action.name && action.ref) {
                newState[action.id] = {
                    hidden: false,
                    ref: action.ref,
                    name: action.name,
                    dim: action.dim!,
                    pos: action.pos!,
                };
            }
            break;
        }
        // FIXME: add remove
        case 'remove': {
            newState = { ...state };
            delete newState[action.id];
            break;
        }
        // reposition existing window
        case 'position': {
            newState = { ...state };
            if (action.pos && newState[action.id]) {
                newState[action.id]!.pos = action.pos;
            };
            break;
        }
        // hide existing window
        case 'hide': {
            newState = { ...state, };
            if (newState[action.id]) {
                newState[action.id]!.hidden = true;
                newState[action.id]!.ref.current!.style.display = 'none';
            }
            break;
        }
        // show existing window
        case 'show': {
            newState = { ...state, };
            if (newState[action.id]) {
                newState[action.id]!.hidden = false;
                newState[action.id]!.ref.current!.style.display = 'initial';
            }
            break;
        }
        default: {
            throw new Error(`Unhandled action type: ${action.type}`)
        }
    }
    return newState;
}


const WindowContext = React.createContext<{ state: State, action: React.Dispatch<Action> }>({
    state: {},
    action: () => null,
});

/**
 * 
 */
const WindowProvider = ({ children }: Children) => {
    const [state, dispatch] = React.useReducer(LockReducer, {});

    return (
        <WindowContext.Provider value={{
            action: dispatch,
            state,
        }}>
            {children}
        </WindowContext.Provider>
    )
}

function useWindowState(): State {
    const context = React.useContext(WindowContext)
    if (context === undefined) {
        throw new Error('useWindowState must be used within a WindowContext')
    }
    return context.state;
}
function useWindowDispatch() {
    const context = React.useContext(WindowContext)
    if (context === undefined) {
        throw new Error('useWindowDispatch must be used within a WindowContext')
    }
    return context.action;
}

export { State as WindowState }
/** Exported Provider */
export { WindowProvider }
/** Exported for Context  */
export { WindowContext }
/** Exported context hooks methods */
export { useWindowState, useWindowDispatch }

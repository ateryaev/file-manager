import { create } from "zustand";

interface PaneState {
    // locations: Record<number, string>;
    // cursors: Record<number, string>;
    activePane: number;
    panes: {
        location: string;
        //cursor: string;
        scrollHistory: Record<string, number>;
        cursorHistory: Record<string, string>;
    }[];
    setActivePane: (index: number) => void;
    getPanesCount: () => number;
    getLocation: (paneIndex: number) => string;
    setLocation: (paneIndex: number, location: string) => void;
    getCursor: (paneIndex: number) => string;
    setCursor: (paneIndex: number, cursor: string) => void;
    getScrollHistory: (paneIndex: number) => number;
    setScrollHistory: (paneIndex: number, scroll: number) => void;
    getCursorHistory: (paneIndex: number) => string;
    setCursorHistory: (paneIndex: number, cursor: string) => void;
}

const updatePane = (state: PaneState, index: number, updates: Partial<PaneState["panes"][number]>) => ({
    ...state,
    panes: state.panes.map((pane, i) =>
        i === index ? { ...pane, ...updates } : pane
    )
});

export const usePaneStore = create<PaneState>((set, get) => ({
    panes: [
        {
            location: "RAM://",
            cursorHistory: { "RAM://": "src" },
            scrollHistory: { "RAM://": 45 },
        },
        {
            location: "RAM://",
            cursorHistory: { "RAM://": "docs" },
            scrollHistory: { "RAM://": 15 },
        }
    ],
    activePane: 0,

    setActivePane: (index: number) => set({ activePane: index % get().panes.length }),
    getPanesCount: () => get().panes.length,
    getLocation: (paneIndex) => get().panes[paneIndex].location,
    setLocation: (paneIndex, location) => set(state => updatePane(state, paneIndex, {
        location: location,
    })),

    getScrollHistory: (paneIndex) => get().panes[paneIndex]?.scrollHistory[get().panes[paneIndex]?.location] || 0,

    setScrollHistory: (paneIndex, scroll) => set(state => updatePane(state, paneIndex, {
        scrollHistory: {
            ...state.panes[paneIndex].scrollHistory,
            [state.panes[paneIndex].location]: scroll
        }
    })),

    getCursorHistory: (paneIndex) => get().panes[paneIndex]?.cursorHistory[get().panes[paneIndex]?.location] || "..",

    setCursorHistory: (paneIndex, cursor) => set(state => updatePane(state, paneIndex, {
        cursorHistory: {
            ...state.panes[paneIndex].cursorHistory,
            [state.panes[paneIndex].location]: cursor
        }
    })),

    getCursor: (paneIndex) => get().panes[paneIndex].cursorHistory[get().panes[paneIndex].location] || "..",

    setCursor: (paneIndex, cursor) => set(state => updatePane(state, paneIndex, {
        cursorHistory: {
            ...state.panes[paneIndex].cursorHistory,
            [state.panes[paneIndex].location]: cursor
        }
    })),





    // locations: { 0: "RAM://", 1: "RAM://src/docs" },
    // cursors: { 0: "docs", 1: ".." },


    //cursorHistory: [],
    //scrollHistory: { 0: {}, 1: {} },
    //navigate
}));

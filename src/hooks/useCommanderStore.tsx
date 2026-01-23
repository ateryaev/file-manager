// store/useCommanderStore.ts
import { create } from 'zustand';
import { FileEntry, VFS } from '../vfs/vfs';

interface PaneState {
    location: string;
    items: FileEntry[];
    selectedIndex: number;
    history: Record<string, { name: string; scrollTop: number }>;
}

interface CommanderState {
    locations: string[];
    panes: PaneState[];
    focusedPane: number;

    currentDialog: 'mkdir' | 'view' | 'delete' | null;
    showDialog: (type: 'mkdir' | 'view' | 'delete') => void;
    hideDialog: () => void;

    setFocused: (index: number) => void;
    init: (locations: string[]) => Promise<void>;
    loadItems: (index: number) => Promise<FileEntry[]>;
    rememberState: (paneIndex: number, path: string, selectedName: string, scrollTop: number) => void;
    navigate: (paneIndex: number, newPath: string, currentScrollTop: number) => Promise<number>;

    setSelectedIndex: (paneIndex: number, itemIndex: number) => void;
    getSelectedIndex: (paneIndex: number) => number;
    moveSelection: (paneIndex: number, delta: number) => void;

    mkdir: (name: string) => Promise<void>;
}

const updatePane = (state: CommanderState, index: number, updates: Partial<PaneState>): CommanderState => ({
    ...state,
    panes: state.panes.map((pane, i) =>
        i === index ? { ...pane, ...updates } : pane
    )
});

export const useCommanderStore = create<CommanderState>((set, get) => ({

    locations: [],
    panes: [],
    focusedPane: 0,
    setFocused: (index: number) => set({ focusedPane: index % get().panes.length }),

    currentDialog: null,
    showDialog: (type: 'mkdir' | 'view' | 'delete') => set({ currentDialog: type }),
    hideDialog: () => set({ currentDialog: null }),

    init: async (locations: string[]) => {

        set({
            locations: locations,
            panes: locations.map(loc => ({
                location: loc,
                items: [],
                selectedIndex: 0,
                history: {}
            }))
        });
        await Promise.all(locations.map((_, index) => get().loadItems(index)));
    },

    getSelectedIndex: (paneIndex: number) => {
        const pane = get().panes[paneIndex];
        return pane.selectedIndex;
    },
    loadItems: async (index: number): Promise<FileEntry[]> => {
        const pane = get().panes[index];
        const items = await VFS.ls(pane.location);
        set((state) => updatePane(state, index, { items }));
        return items;
    },

    rememberState: (paneIndex: number, path: string, selectedName: string, scrollTop: number) => {
        set((state) => updatePane(state, paneIndex, {
            history: { ...state.panes[paneIndex].history, [path]: { name: selectedName, scrollTop } }
        }));
    },

    navigate: async (paneIndex: number, newPath: string, currentScrollTop: number) => {
        const oldPane = get().panes[paneIndex];
        const oldPath = oldPane.location;
        const oldName = oldPane.items[oldPane.selectedIndex]?.name || "";
        get().rememberState(paneIndex, oldPath, oldName, currentScrollTop);

        set((state) => ({
            ...state,
            locations: state.locations.map((loc, i) =>
                i === paneIndex ? newPath : loc
            )
        }));

        set((state) => updatePane(state, paneIndex, { location: newPath }));

        const newItems = await get().loadItems(paneIndex);

        const historyEntry = get().panes[paneIndex].history[newPath];
        let targetName = historyEntry?.name || "";

        if (oldPath.startsWith(newPath) && oldPath !== newPath) {
            targetName = oldPath.split('/').filter(Boolean).pop() || "";
        }

        const index = newItems.findIndex(item => item.name === targetName);
        get().setSelectedIndex(paneIndex, index >= 0 ? index : 0);
        return historyEntry?.scrollTop || 0;
    },

    setSelectedIndex: (paneIndex: number, itemIndex: number) => {
        const pane = get().panes[paneIndex];
        // Ensure the index stays within bounds
        const safeIndex = Math.max(0, Math.min(itemIndex, pane.items.length - 1));
        set((state) => updatePane(state, paneIndex, { selectedIndex: safeIndex }));
    },

    moveSelection: (paneIndex: number, delta: number) => {
        const pane = get().panes[paneIndex];
        const newIndex = pane.selectedIndex + delta;
        get().setSelectedIndex(paneIndex, newIndex);
    },



    mkdir: async (name: string) => {
        const { focusedPane, panes, loadItems, setSelectedIndex } = get();

        // 1. Capture old selections for all panes
        const oldSelections = panes.map(pane =>
            pane.items[pane.selectedIndex]?.name
        );

        // 2. DO THE WORK
        await VFS.mkdir(panes[focusedPane].location, name);

        // 3. REFRESH ALL PANES (Parallel)
        const allNewItems = await Promise.all(
            panes.map((_, index) => loadItems(index))
        );

        // 4. RESTORE / SET SELECTION FOR ALL PANES
        allNewItems.forEach((newItems, paneIndex) => {
            if (paneIndex === focusedPane) {
                // For the active pane: Focus the newly created folder
                const newDirIndex = newItems.findIndex(item => item.name === name);
                setSelectedIndex(paneIndex, newDirIndex >= 0 ? newDirIndex : 0);
            } else {
                // For other panes: Restore old selection by name
                const oldName = oldSelections[paneIndex];
                const restoredIndex = newItems.findIndex(item => item.name === oldName);
                setSelectedIndex(paneIndex, restoredIndex >= 0 ? restoredIndex : 0);
            }
        });
    },
}));

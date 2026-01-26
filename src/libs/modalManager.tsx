import { createRoot, Root } from 'react-dom/client';
import { ComponentType, createElement } from 'react';

class ModalManager {
    private activeModals = new Map<symbol, { root: Root; container: HTMLDivElement }>();

    show<T, P = {}>(
        Component: ComponentType<P & { onResolve: (value: T) => void }>,
        props?: P
    ): Promise<T> {
        return new Promise<T>((resolve) => {
            const id = Symbol();
            const container = document.createElement('div');
            document.body.appendChild(container);
            const root = createRoot(container);

            const handleResolve = (value: T) => {
                resolve(value);
                this.close(id);
            };

            root.render(createElement(Component, {
                ...props as any,
                onResolve: handleResolve
            }));

            this.activeModals.set(id, { root, container });
        });
    }

    private close(id: symbol) {
        const modal = this.activeModals.get(id);
        if (modal) {
            modal.root.unmount();
            document.body.removeChild(modal.container);
            this.activeModals.delete(id);
        }
    }
}

export const modalManager = new ModalManager();
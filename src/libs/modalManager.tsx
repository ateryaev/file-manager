import { createRoot, Root } from 'react-dom/client';
import { ComponentType, createElement } from 'react';
import { ModalConfirm } from '../dialogs/ModalConfirm';
import { ModalBusy } from '../dialogs/ModalBusy';
import { ModalAlert } from '../dialogs/ModalAlert';
import { ModalPrompt } from '../dialogs/ModalPrompt';

class ModalManager {
    private showingCount = 0;
    private activeModals = new Map<symbol, { root: Root; container: HTMLDivElement }>();

    isShowing(): boolean {
        return this.showingCount > 0;
    }

    show<T, P = {}>(
        Component: ComponentType<P & { onResolve: (value: T) => void }>,
        props?: P
    ): Promise<T> {
        this.showingCount++;
        const previouslyFocused = document.activeElement as HTMLElement | null;
        return new Promise<T>((resolve) => {
            const id = Symbol();
            const container = document.createElement('div');
            document.body.appendChild(container);
            const root = createRoot(container);

            const handleResolve = (value: T) => {
                resolve(value);
                this.close(id);
                setTimeout(() => {
                    this.showingCount--;
                    previouslyFocused?.focus();
                });
            };

            root.render(createElement(Component, {
                ...props as any,
                onResolve: handleResolve
            }));

            this.activeModals.set(id, { root, container });
        });
    }

    showConfirm(message: string): Promise<boolean> {
        return this.show(ModalConfirm, { message });
    }

    showBusy(message: string, func: () => Promise<void>): Promise<boolean> {
        return this.show(ModalBusy, { message, func });
    }

    showAlert(message: string, variant: "info" | "warning" | "error" = "info"): Promise<void> {
        return this.show(ModalAlert, { message, variant });
    }

    showPrompt(title: string, defaultValue?: string, validate?: (value: string) => boolean, action?: string): Promise<string | null> {
        return this.show(ModalPrompt, { title, defaultValue, validate, action });
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


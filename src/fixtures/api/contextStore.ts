/**
 * @file contextStore.ts
 *
 * Acts like Postman's environment – a simple in-memory key-value store
 * for persisting tokens, IDs, and any runtime data during test execution.
 */

type Store = Record<string, unknown>;

class ContextStore {
    private store: Store = {};

    /**
     * Set a key-value pair in the store.
     */
    set(key: string, value: unknown) {
        this.store[key] = value;
    }

    /**
     * Retrieve a value by key.
     */
    get<T = unknown>(key: string): T {
        const value = this.store[key];
        if (value === undefined) {
            throw new Error(`No value found for key: ${key}`);
        }
        return value as T;
    }

    /**
     * Clear the store (optional).
     */
    clear() {
        this.store = {};
    }

    /**
     * List all stored keys and values.
     */
    debug() {
        console.log('ContextStore contents:', this.store);
    }
}

export const contextStore = new ContextStore();

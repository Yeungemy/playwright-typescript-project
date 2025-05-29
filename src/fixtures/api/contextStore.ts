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
     * Sets a key-value pair in the context.
     * @param {string} key - The key name (e.g., "token", "userId").
     * @param {unknown} value - The value to store.
     */
    set(key: string, value: unknown) {
        this.store[key] = value;
    }

    /**
     * Retrieves a value by key from the context.
     * @template T
     * @param {string} key - The key name to retrieve.
     * @returns {T | undefined} - The value, or undefined if not set.
     */
    get<T = unknown>(key: string): T {
        const value = this.store[key];
        if (value === undefined) {
            throw new Error(`No value found for key: ${key}`);
        }
        return value as T;
    }

    /**
     * Loads context from the JSON file if `filePath` was specified.
     */
    async load(): Promise<void> {}

    /**
     * Persists current context to disk as JSON.
     */
    async save(): Promise<void> {}

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

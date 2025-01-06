
export interface RefMessage {
    type: RefFromClientType
    payload: any
}

/**
 * I tipi di messaggi che possono arrivare dal client
*/
export enum RefFromClientType {
    /**
     * Richiede l'albero dei nodi
     */
    GET_STATE = "c-ref:get-state",
}

export enum RefFromServerType {
    STATE = "s-ref:state",
}

export enum RefAction {
    /**
     * Aggiunge un nodo
     */
    ADD_NODE = "ref:add-node",
    /**
     * Rimuove un nodo
     */
    REMOVE_NODE = "ref:remove-node",
    /**
     * Aggiorna un nodo
     */
    UPDATE_NODE = "ref:update-node",
    /**
     * Aggiorna un nodo
     */
    GET_NODES = "ref:get-nodes",
}

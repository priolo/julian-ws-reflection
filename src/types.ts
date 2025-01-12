
export interface ClientMessage {
    type: ClientMessageType
    payload: any
}
export interface ServerMessage {
    type: ServerMessageType
    payload: any
}
export interface ServerLogMessage extends ServerMessage{
    name: string
    source: string
}

/**
 * I tipi di messaggi che possono arrivare dal client
*/
export enum ClientMessageType {
    /**
     * Richiede l'albero dei nodi
     */
    GET_STRUCT = "ref-c:get-struct",
    /**
     * Esegue un'azione
     */
    EXECUTE_ACTION = "ref-c:execute-action",
}

export enum ServerMessageType {
    /**
     * Risponde con lo stato dell'albero
     */
    STRUCT = "ref-s:struct",
    /**
     * Risponde con l'esito dell'azione
     */
    ACTION_RESULT = "ref-s:action-result",
    /**
     * Notifica un LOG al client
     */
    LOG = "ref-s:log",
}

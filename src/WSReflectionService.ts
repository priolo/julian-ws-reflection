import { NodeState, utils, ws, types, ServiceBase } from "typexpress"
import { ServerMessage, ClientMessageType, ServerMessageType, ServerLogMessage, ClientMessage } from "./types.js"



export type WSReflectionConf = Partial<WSReflectionService['stateDefault']>

/**
 * 
 */
export class WSReflectionService extends ws.route {

	get stateDefault() {
		return {
			...super.stateDefault,
			name: "ws-reflection",
			/* nodo da cui ascoltare gli eventi */
			nodeListened: "/",
		}
	}

	async onMessage(client: ws.IClient, message: string) {
		if (!client || !message) return
		const msg: ClientMessage = JSON.parse(message)
		switch (msg.type) {

			case ClientMessageType.GET_STRUCT: {
				const { path } = msg.payload
				const node = this.nodeByPath(path ?? "/")
				const struct = utils.nodeToStruct(node)
				const stateStr = JSON.stringify(<ServerMessage>{
					type: ServerMessageType.STRUCT,
					payload: struct,
				})
				this.sendToClient(client, stateStr)
				break
			}

			case ClientMessageType.EXECUTE_ACTION: {
				const { path, action } = msg?.payload as { path: string, action: types.IAction } ?? {}
				const node = this.nodeByPath<NodeState>(path ?? "/")
				if ( !node ) return
				const result = await node.execute(action)
				const resultStr = JSON.stringify(<ServerMessage>{
					type: ServerMessageType.ACTION_RESULT,
					payload: result,
				})
				this.sendToClient(client, resultStr)
				break
			}

		}
		super.onMessage(client, message)
	}

	/**
	 * mi metto in ascolto di tutti gli eventi del parent
	 */
	protected async onInitAfter(): Promise<void> {
		super.onInitAfter()
		const parent = this.nodeByPath<ServiceBase>(this.state.nodeListened)

		parent.emitter.on("$", msg => {
			if (![types.NamesLog.STATE_CHANGED, types.NamesLog.NODE_DELETED].includes(msg.event as types.NamesLog)) return

			const log: types.ILog = msg.payload
			let payload = log.payload
			switch (msg.event) {
				case types.NamesLog.STATE_CHANGED:
					payload = log.payload.partial
					break
			}

			this.sendToAll(JSON.stringify(<ServerLogMessage>{
				type: ServerMessageType.LOG,
				name: log.name,
				source: log.source,
				payload
			}))
		})
	}

}


import { utils, PathFinder, ws } from "typexpress"
import { RefMessage, RefFromClientType, RefFromServerType } from "./types.js"



export type WSReflectionConf = Partial<WSReflectionService['stateDefault']>

/**
 * 
 */
export class WSReflectionService extends ws.route {

	get stateDefault() {
		return {
			...super.stateDefault,
			name: "ws-reflection",
		}
	}

	onMessage(client: ws.IClient, message: string) {
		if (!client || !message) return
		const msg: RefMessage = JSON.parse(message)
		switch (msg.type) {
			case RefFromClientType.GET_STATE: {
				const { path } = msg.payload
				const node = PathFinder.Get(this, path ?? "/")
				const struct = utils.nodeToStruct(node)
				const stateStr = JSON.stringify({
					type: RefFromServerType.STATE,
					payload: struct,
				})
				this.sendToClient(client, stateStr)
				break
			}
		}
		super.onMessage(client, message)
	}

}

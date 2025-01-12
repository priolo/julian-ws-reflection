import { RootService, ws } from "typexpress"
import WebSocket from "ws"
import WSReflectionService, { ClientMessageType, ServerMessageType, ServerMessage, ClientMessage } from "./index.js"



describe("REFLECTION SERVICE", () => {

	let PORT: number
	let root: RootService

	beforeAll(async () => {
		PORT = await ws.getFreePort()
		root = await RootService.Start(
			{
				class: "ws",
				port: PORT,
				children: [
					{ class: WSReflectionService }
				]
			}
		)
	})

	afterAll(async () => {
		await RootService.Stop(root)
	})

	test("su creazione", async () => {
		let srs = root.nodeByPath('/ws-server/ws-reflection')
		expect(srs).toBeInstanceOf(WSReflectionService)
	})

	test("message on subpath", async () => {
		let results: string[] = []

		// creo il client ws e sull'apertura mando dei dati
		const wsclient = new WebSocket(`ws://localhost:${PORT}/`)

		// su connessione chiedo la struttura dell'albero
		wsclient.on('open', () => {
			wsclient.send(JSON.stringify(<ClientMessage>{
				type: ClientMessageType.GET_STRUCT,
				payload: { path: "/" }
			}))
		})

		// se ricevo una risposta la memorizzo
		wsclient.on('message', (message: any) => {
			const msgStr = message.toString()
			results.push(msgStr)
			if (results.length == 1) wsclient.close()
		})

		// aspetto che il socket si chiuda
		await new Promise<void>((res, rej) => wsclient.on('close', res))

		const result = JSON.parse(results[0])
		expect(result.type).toBe(ServerMessageType.STRUCT)
		expect(result.payload.children[1]).toMatchObject({ name: "ws-server" })
		expect(result.payload.children[1].children[0]).toMatchObject({ name: "ws-reflection" })
	})

})
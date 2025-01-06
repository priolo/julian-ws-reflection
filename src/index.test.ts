import { PathFinder, RootService, ws } from "typexpress"
import WebSocket from "ws"



describe("WEBSOCKET REFLECTION", () => {

	let PORT: number
	let root: RootService

	beforeAll(async () => {
		PORT = await ws.getFreePort()
		root = await RootService.Start(
			{
				class: "ws",
				port: PORT,
				onLog: function ({ name, payload }) {
					if (name != ws.SocketLog.MESSAGE) return
					const { client, message } = payload
					try {
						if (JSON.parse(message.toString()).path != null) return
					} catch (error) { }
					this.sendToClient(client, `root::receive:${message}`)
				},
				children: [
					{
						class: "ws/route",
						path: "command",
						onLog: function ({ name, payload }) {
							if (name != ws.SocketLog.MESSAGE) return
							const { client, message } = payload
							try {
								if (JSON.parse(message.toString()).path != this.state.path) return
							} catch (error) { }
							this.sendToClient(client, `command::receive:${message}`)
						},
					},
					{
						class: "ws/route",
						path: "room1",
						children: [{
							class: "ws/route",
							path: "pos2",
							onLog: function ({ name, payload }) {
								if (name != ws.SocketLog.MESSAGE) return
								const { client, message } = payload
								try {
									if (!(JSON.parse(message.toString()).path as string).endsWith(`/${this.state.path}`)) return
								} catch (error) { }
								this.sendToClient(client, `room1/pos2::receive:${message}`)
							},
						}],
					},
				]
			}
		)
	})

	afterAll(async () => {
		await RootService.Stop(root)
	})

	test("su creazione", async () => {
		let srs = new PathFinder(root).getNode<ws.route>('/ws-server/{"path":"command"}')
		expect(srs).toBeInstanceOf(ws.route)
		srs = new PathFinder(root).getNode<ws.route>('/ws-server/{"path":"room1"}')
		expect(srs).toBeInstanceOf(ws.route)
	})

	test("message on subpath", async () => {
		let result: string[] = []

		// creo il client ws e sull'apertura mando dei dati
		const wsclient = new WebSocket(`ws://localhost:${PORT}/`)

		wsclient.on('open', () => {
			wsclient.send("only string")
			wsclient.send(JSON.stringify({
				path: "room1/pos2", action: "message",
				payload: { message: "<room1-pos2>" },
			}))
			wsclient.send(JSON.stringify({
				path: "command", action: "message",
				payload: { message: "<command>" },
			}))
		})

		// se ricevo una risposta la memorizzo
		wsclient.on('message', (message: any) => {
			const msgStr = message.toString()
			result.push(msgStr)
			if (result.length == 5) wsclient.close()
		})

		// aspetto che il socket si chiuda
		await new Promise<void>((res, rej) => wsclient.on('close', res))

		expect(result).toEqual([
			`root::receive:only string`,
			`command::receive:only string`,
			`room1/pos2::receive:only string`,
			`room1/pos2::receive:{\"path\":\"room1/pos2\",\"action\":\"message\",\"payload\":{\"message\":\"<room1-pos2>\"}}`,
			`command::receive:{\"path\":\"command\",\"action\":\"message\",\"payload\":{\"message\":\"<command>\"}}`,
		])
	})

})
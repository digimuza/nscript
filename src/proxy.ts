import express, { Request } from 'express'
import { Observable, tap } from 'rxjs'

export namespace Proxy {
	export function server(args: { port: number }) {
		return new Observable<Request>((observer) => {
			const app = express()

			// log info about ALL requests to ALL paths
			app.all('*', (req, res) => {
				observer.next(req)
				res.status(200)
				res.send({
					ok: true,
				})
			})

			const se = app.listen(args.port, () => {
				console.log('as')
			})
			return () => {
				se.close()
			}
		})
	}
}

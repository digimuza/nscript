import * as child from 'child_process'
import { Observable, firstValueFrom } from 'rxjs'

export type InfoMessage = {
	type: 'info'
	data: string
}

export interface ErrorMessage {
	type: 'error'
	data: string
}

export interface ExitMessage {
	type: 'exit'
	code: number
}

export class ExecutionObservable extends Observable<InfoMessage | ErrorMessage | ExitMessage> {
	toPromise(): Promise<InfoMessage | ErrorMessage | ExitMessage> {
		return firstValueFrom(this)
	}
}

export function exec(script: string, options?: child.ExecOptions) {
	return new ExecutionObservable((observe) => {
		const program = child.exec(script, options)
		program.stdout?.on('data', (data: string) => {
			observe.next({ type: 'info', data })
		})
		program.stderr?.on('data', (c) => {
			observe.next({ type: 'error', data: c })
		})
		program.on('exit', (d: number) => {
			if (d !== 0) {
				observe.error({ type: 'exit', code: d })
				process.exit(d)
			}
			observe.next({ type: 'exit', code: d })
			observe.complete()
		})
	})
}

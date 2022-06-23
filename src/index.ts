import * as child from 'child_process'
import * as Jet from 'fs-jetpack'
import * as Path from 'path'
import { PackageJson } from 'type-fest'
import * as P from 'ts-prime'
import * as Parse from 'iterparse'
import Axios from 'axios'
import * as Semver from 'semver'
export { Proxy } from './proxy'
export { Jet, Path, Parse, Axios, Semver }

export namespace PackageJSON {
	export function file() {
		let path = 'package.json'
		for (const index of P.range(1, 50)) {
			const r = Jet.exists(path)
			if (r) {
				return path
			}
			const f = P.range(0, index)
				.map(() => '../')
				.join('')

			path = Path.resolve(f, 'package.json')
		}
		throw new Error('Failed to find package.json')
	}
	export function closest() {
		const packageJsonPath = file()
		return Jet.read(packageJsonPath, 'json') as PackageJson
	}
}
export namespace Exec {
	export function script(name: string, script: string, options?: child.ExecOptions) {
		return new Promise<void>((resolve, reject) => {
			const program = child.exec(script, options)
			program.stdout?.on('data', (data: string) => {
				const log = data
					.split('\n')
					.filter((q) => q)
					.map((q, index) => `${index === 0 ? name.padEnd(20) : ''.padEnd(20)} | ${q}`)
					.join('\n')
				console.log(log)
			})
			program.stderr?.on('data', (c) => {
				console.log(`${name.padEnd(20)} | ${c}`)
			})
			program.on('exit', (d: number) => {
				if (d !== 0) {
					console.log(`${name.padEnd(20)}`, 'Exit code', d)
					reject()
				}
				resolve()
			})
		})
	}
}

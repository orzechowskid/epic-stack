import {
	Transform
} from "stream";

import {
	type HandleDocumentRequestFunction,
	Response
} from "@remix-run/node";
import {
	RemixServer
} from "@remix-run/react";
import isbot from "isbot";
import {
	getInstanceInfo
} from "litefs-js";
import {
	renderToPipeableStream,
	renderToString
} from "react-dom/server";
import {
	ServerStyleSheet
} from "styled-components";

import {
	getEnv,
	init
} from "./utils/env.server.ts";
import {
	NonceProvider
} from "./utils/nonce-provider.ts";
import {
	makeTimings
} from "./utils/timing.server.ts";

const ABORT_DELAY = 5000;

init();
global.ENV = getEnv();

if (ENV.MODE === "production" && ENV.SENTRY_DSN) {
	import("~/utils/monitoring.server.ts").then(({ init }) => {return init()});
}

type DocRequestArgs = Parameters<HandleDocumentRequestFunction>;

export default async function handleRequest(...args: DocRequestArgs) {
	const [
		request,
		responseStatusCode,
		responseHeaders,
		remixContext,
		loadContext
	] = args;
	const context =
		process.env.NODE_ENV === 'development'
			? await import('remix-development-tools').then(
					({ initRouteBoundariesServer }) =>
						initRouteBoundariesServer(remixContext),
			  )
			: remixContext;
	const { currentInstance, primaryInstance } = await getInstanceInfo();
	responseHeaders.set("fly-region", process.env.FLY_REGION ?? "unknown");
	responseHeaders.set("fly-app", process.env.FLY_APP_NAME ?? "unknown");
	responseHeaders.set("fly-primary-instance", primaryInstance);
	responseHeaders.set("fly-instance", currentInstance);

	const callbackName = isbot(request.headers.get("user-agent"))
		? "onAllReady"
		: "onShellReady";

	const nonce = String(loadContext.cspNonce) ?? undefined;
	return new Promise((resolve, reject) => {
		let didError = false;

		const sheet = new ServerStyleSheet();
		let markup = renderToString(
			sheet.collectStyles(
				<NonceProvider value={nonce}>
					<RemixServer context={remixContext} url={request.url} />
				</NonceProvider>
			)
		);
		const styles = sheet.getStyleTags();
		markup = markup.replace("__STYLES__", styles);
		// NOTE: this timing will only include things that are rendered in the shell
		// and will not include suspended components and deferred loaders
		const timings = makeTimings("render", "renderToPipeableStream");

		const { pipe, abort } = renderToPipeableStream(
			<NonceProvider value={nonce}>
				<RemixServer context={context} url={request.url} />
			</NonceProvider>,
			{
				[callbackName]: () => {
					const body = new Transform({
						transform(chunk, _enc, next) {
							this.push(chunk.toString().replace("__STYLES__", styles));
							next();
						}
					});
					responseHeaders.set("Content-Type", "text/html");
					responseHeaders.append("Server-Timing", timings.toString());
					resolve(
						new Response(body, {
							headers: responseHeaders,
							status: didError ? 500 : responseStatusCode
						})
					);
					pipe(body);
				},
				onShellError: (err: unknown) => {
					reject(err);
				},
				onError: (error: unknown) => {
					didError = true;

					console.error(error);
				}
			}
		);

		setTimeout(abort, ABORT_DELAY);
	});
}

export async function handleDataRequest(response: Response) {
	const { currentInstance, primaryInstance } = await getInstanceInfo();
	response.headers.set("fly-region", process.env.FLY_REGION ?? "unknown");
	response.headers.set("fly-app", process.env.FLY_APP_NAME ?? "unknown");
	response.headers.set("fly-primary-instance", primaryInstance);
	response.headers.set("fly-instance", currentInstance);

	return response;
}

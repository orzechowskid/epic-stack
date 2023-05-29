import {
	type HeadersFunction,
	json,
	type LinksFunction,
	type V2_MetaFunction
} from "@remix-run/node";
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration
} from "@remix-run/react";
import {
	withSentry
} from "@sentry/remix";
import {
	styled
} from "styled-components";

import {
	ClientHintCheck
} from "./utils/client-hints.tsx";
import {
	useNonce
} from "./utils/nonce-provider.ts";

const MyButton = styled.button`
	padding: 1px;
	font-size: 32px;
	background-color: tomato;
`;

export const links: LinksFunction = () => {
	return [].filter(Boolean);
};

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
	return [
		{ title: "508bytes" },
		{ name: "description", content: "A full-service web development agency" }
	];
};

export async function loader() {
	return json({});
}

export const headers: HeadersFunction = () => {
	const headers = {};

	return headers;
};

function App() {
	const nonce = useNonce();

	return (
		<html lang="en">
			<head>
				<ClientHintCheck nonce={nonce} />
				<Meta />
				<meta charSet="utf-8" />
				<meta content="width=device-width,initial-scale=1" name="viewport" />
				<Links />
				{typeof document === "undefined" ? "__STYLES__" : null}
			</head>
			<body>
				<header>
					<MyButton>
						hello from button
					</MyButton>
				</header>

				<div>
					<Outlet />
				</div>

				<ScrollRestoration nonce={nonce} />
				<Scripts nonce={nonce} />
				<script
					dangerouslySetInnerHTML={{
						__html: `window.ENV = 'development';`
					}}
					nonce={nonce}
				/>
				<LiveReload nonce={nonce} />
			</body>
		</html>
	);
}

export default withSentry(App);

globalThis.__nitro_main__ = import.meta.url;
import { a as FastResponse, n as HTTPError, r as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/assets/StatCard-Bz_73RJc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"373-Q5QXdsjgMe2tv6adKmWAY4I4S40\"",
		"mtime": "2026-07-14T17:13:12.091Z",
		"size": 883,
		"path": "../public/assets/StatCard-Bz_73RJc.js"
	},
	"/assets/badge-B94GrHeH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"302-jN1C0vvSaR6FdfKYlutGRuoQx6Q\"",
		"mtime": "2026-07-14T17:13:12.091Z",
		"size": 770,
		"path": "../public/assets/badge-B94GrHeH.js"
	},
	"/assets/card-BNvBr7N9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3f5-XKhxWQY7FcHDZL1g3uCqurbNbss\"",
		"mtime": "2026-07-14T17:13:12.091Z",
		"size": 1013,
		"path": "../public/assets/card-BNvBr7N9.js"
	},
	"/assets/categories-AA9Rs1nT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"df4-o86MMHh9CptWZZacl3Lft1zDepk\"",
		"mtime": "2026-07-14T17:13:12.091Z",
		"size": 3572,
		"path": "../public/assets/categories-AA9Rs1nT.js"
	},
	"/assets/customers-B1_3hg1j.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1497-6W7v7Kpnb3IK2cTl+K8TmGDhefw\"",
		"mtime": "2026-07-14T17:13:12.091Z",
		"size": 5271,
		"path": "../public/assets/customers-B1_3hg1j.js"
	},
	"/assets/delivery-partners-CLoIT8Ci.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"db4-zs8yoEkzW9u/ZSoEus+0Vp+n4UA\"",
		"mtime": "2026-07-14T17:13:12.091Z",
		"size": 3508,
		"path": "../public/assets/delivery-partners-CLoIT8Ci.js"
	},
	"/assets/dist-C9ZPRuUd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8dd-tyDJ+JQxWovjarGZUdELjBbND+4\"",
		"mtime": "2026-07-14T17:13:12.091Z",
		"size": 2269,
		"path": "../public/assets/dist-C9ZPRuUd.js"
	},
	"/assets/dist-DJy6JV99.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bd4-7HvM8u3Yx+a3x0RKz3f+bvODl4w\"",
		"mtime": "2026-07-14T17:13:12.091Z",
		"size": 3028,
		"path": "../public/assets/dist-DJy6JV99.js"
	},
	"/assets/dialog-CyegCIde.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b1f-NPvi53D3OWdaS9TFxrgpyECGX04\"",
		"mtime": "2026-07-14T17:13:12.091Z",
		"size": 2847,
		"path": "../public/assets/dialog-CyegCIde.js"
	},
	"/assets/offers-Cy4lrxMZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1442-G7AxADCycLAqhZH+l5ouohuxwRc\"",
		"mtime": "2026-07-14T17:13:12.091Z",
		"size": 5186,
		"path": "../public/assets/offers-Cy4lrxMZ.js"
	},
	"/assets/dist-JncFsuXu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"53e-kwjbQlcZwKP25WyFCkGT07Rromw\"",
		"mtime": "2026-07-14T17:13:12.091Z",
		"size": 1342,
		"path": "../public/assets/dist-JncFsuXu.js"
	},
	"/assets/inventory-Dmv4QBtk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"eaa-zhkQH/qA7+tyaeE+8Pui2kJ6EqE\"",
		"mtime": "2026-07-14T17:13:12.091Z",
		"size": 3754,
		"path": "../public/assets/inventory-Dmv4QBtk.js"
	},
	"/assets/pencil-CGvLwUou.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"109-wnO5KzlhGDz1NkzZK5wQT5iwUdY\"",
		"mtime": "2026-07-14T17:13:12.092Z",
		"size": 265,
		"path": "../public/assets/pencil-CGvLwUou.js"
	},
	"/assets/orders-BOKn5q-C.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"102a-TA24hRn80fcPwrlnVLBYKb6lzWk\"",
		"mtime": "2026-07-14T17:13:12.092Z",
		"size": 4138,
		"path": "../public/assets/orders-BOKn5q-C.js"
	},
	"/assets/plus-BKDNg88D.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8e-1HcjuoEXdieTY1AUsoOYA+4n+fc\"",
		"mtime": "2026-07-14T17:13:12.092Z",
		"size": 142,
		"path": "../public/assets/plus-BKDNg88D.js"
	},
	"/assets/react-dom-zxTq3OiM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"dd4-zkHz/7wZDlt8nTmFo653DgGXLSc\"",
		"mtime": "2026-07-14T17:13:12.092Z",
		"size": 3540,
		"path": "../public/assets/react-dom-zxTq3OiM.js"
	},
	"/assets/routes-B_OaoKvA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11ef-fUQlWo1uD39QpyiXoYdj7xdPi9E\"",
		"mtime": "2026-07-14T17:13:12.092Z",
		"size": 4591,
		"path": "../public/assets/routes-B_OaoKvA.js"
	},
	"/assets/index-BfW75Z_J.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7131e-QSsNlNcmFKmWiM9jjLfG1k0BAJs\"",
		"mtime": "2026-07-14T17:13:12.091Z",
		"size": 463646,
		"path": "../public/assets/index-BfW75Z_J.js"
	},
	"/assets/search-CNVzandk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a3-xOM6V6tu0UHln1O6Ci/FNf9E6NA\"",
		"mtime": "2026-07-14T17:13:12.092Z",
		"size": 163,
		"path": "../public/assets/search-CNVzandk.js"
	},
	"/assets/products-B3BYoX8v.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1e02-fjF1uySDEi42WWaRUZAmXbHUw2M\"",
		"mtime": "2026-07-14T17:13:12.092Z",
		"size": 7682,
		"path": "../public/assets/products-B3BYoX8v.js"
	},
	"/assets/styles-atDgV-FS.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"12a7f-dJCi1uZz0mhk4bCD+xAugexKmaw\"",
		"mtime": "2026-07-14T17:13:12.093Z",
		"size": 76415,
		"path": "../public/assets/styles-atDgV-FS.css"
	},
	"/assets/select-DzU1T5F0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"56a2-MvqPrjN8axd5pmZv3amXs2Ad4VA\"",
		"mtime": "2026-07-14T17:13:12.092Z",
		"size": 22178,
		"path": "../public/assets/select-DzU1T5F0.js"
	},
	"/assets/switch-BBIWk6ky.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f0f-zACwJLdHyJQ0JLPig8HyJIlIbSY\"",
		"mtime": "2026-07-14T17:13:12.092Z",
		"size": 3855,
		"path": "../public/assets/switch-BBIWk6ky.js"
	},
	"/assets/table-D4z4yw1_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"645-L9NbYwgoS5jTenyMXy8UTCtkva8\"",
		"mtime": "2026-07-14T17:13:12.092Z",
		"size": 1605,
		"path": "../public/assets/table-D4z4yw1_.js"
	},
	"/assets/reports-DhoTTmQE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"645a8-BoO/HBq6BF4FSxfJYTdWY2AQrAI\"",
		"mtime": "2026-07-14T17:13:12.092Z",
		"size": 411048,
		"path": "../public/assets/reports-DhoTTmQE.js"
	},
	"/assets/tabs-B_XvF1eb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1b66-FCILKdooTMfBJih95Las/ozBV+c\"",
		"mtime": "2026-07-14T17:13:12.093Z",
		"size": 7014,
		"path": "../public/assets/tabs-B_XvF1eb.js"
	},
	"/assets/utils-8gOzUdrg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"906e-RypVt2NtEhM+3vFB1YWBsLsp3Xw\"",
		"mtime": "2026-07-14T17:13:12.093Z",
		"size": 36974,
		"path": "../public/assets/utils-8gOzUdrg.js"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_vJEl2e = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_vJEl2e
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };

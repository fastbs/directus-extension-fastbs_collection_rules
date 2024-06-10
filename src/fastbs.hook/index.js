//import { useApi } from '@directus/extensions-sdk';
import util from "util";
import { createError } from '@directus/errors';
import get from 'lodash.get';

/*
The register function receives an object containing the type-specific register functions as the first parameter:
	filter — Listen for a filter event (before the event is emitted)
	action — Listen for an action event (after a defined event)
	init — Listen for an init event
	schedule — Execute a function at certain points in time
	embed — Inject custom JavaScript or CSS within the Data Studio

The second parameter is a context object with the following properties:
	services — All API internal services
	database — Knex instance that is connected to the current database
	getSchema — Async function that reads the full available schema for use in services
	env — Parsed environment variables
	logger — Pino instance.
	emitter — Event emitter instance that can be used to emit custom events for other extensions.


(<collection>.)items.query		The items query			collection
(<collection>.)items.read		The read item			query, collection
(<collection>.)items.create		The new item			collection
(<collection>.)items.update		The updated item		keys, collection
(<collection>.)items.promote	The promoted item		collection, item, version
(<collection>.)items.delete		The keys of the item	collection


The filter register function receives two parameters:
	The event name
	A callback function that is executed whenever the event is emitted.

The callback function itself receives three parameters:
	The modifiable payload
	An event-specific meta object
	A context object

The context object has the following properties:
	database — The current database transaction
	schema — The current API schema in use
	accountability — Information about the current user
*/



export default async ({ filter, action }, ctx) => {
	console.log("************* Enter fastbs.hook ************* ");
	
	const { database } = ctx;
	const { ItemsService } = ctx.services;

	const $DB_FASTBS_BUNDLE_SETTINGS_COLLECTION = ctx.env["DB_FASTBS_BUNDLE_SETTINGS_COLLECTION"] ?? "";
	const settings = (await database.select().from($DB_FASTBS_BUNDLE_SETTINGS_COLLECTION))[0];

	util.inspect.defaultOptions.depth = null;

	const $MACROS = {};

	function replaceMacro(item) {
		const exp = /^\s*{{\s*((\$\w+)(\.\w+)*)\s*}}\s*$/gi;
		if (item instanceof Object) {
			for (const key in item) {
				if (item[key] instanceof Object) {
					replaceMacro(item[key]);
				}
				else {
					const result = exp.exec(item[key]);
					if (result[1]) {
						item[key] = item[key].replace(exp, get($MACROS, result[1]));
					}
				}
			}
		}
	}

	async function rulesCheck(payload, meta, context) {
		const { schema, accountability, database } = context;

		$MACROS.$CURRENT_USER = accountability.user;
		$MACROS.$CURRENT_ROLE = accountability.role;
		$MACROS.$NOW = Math.round(Date.now() / 1000);
		$MACROS.$PAYLOAD = payload;
		$MACROS.$KEYS = Array.isArray(meta.keys) ? meta.keys : {};

		console.log("\n\n********** My hook:", meta.event, " **********");
		console.log("********** payload:", payload);
		console.log("********** meta:", meta);
		console.log("********** $MACROS:", $MACROS);

		let event = meta.event.replace("items.", "").toUpperCase();

		if (typeof $MACROS !== 'undefined' && ["QUERY", "READ", "CREATE", "UPDATE", "PROMOTE", "DELETE"].includes(event)) {
			const rulesService = new ItemsService(settings.rules_collection, { schema, database });
			const rules = await rulesService.readByQuery({
				fields: ['*'],
				filter: {
					event: {
						_eq: event,
					},
					collection: {
						_eq: meta.collection,
					},
					active: {
						_eq: true,
					}
				},
			});

			for (const rule of rules) {
				console.log("*** RULE:", rule)
				const relService = new ItemsService(rule.related_collection, { schema, database });
				replaceMacro(rule.rule);
				console.log("*** RULE.rule after:", rule.rule);
				const query = {
					fields: ['*'],
					filter: rule.rule,
					limit: 1,
				};

				const rel = await relService.readByQuery(query);

				if (Boolean(rel.length) == rule.success) {
					await ctx.logger.info(rule.name + " succesful");
				} else {
					let mes = ` [${event}] ${rule.name} : ${rule.errorMessage}`;
					await ctx.logger.error(mes);
					const PayloadError = createError('INVALID_PAYLOAD', mes, 400);
					throw new PayloadError();
				}
			}
		}

		return payload;
	}

	filter('items.create', rulesCheck);
	filter('items.update', rulesCheck);
	filter('items.delete', rulesCheck);
	//filter('items.query', rulesCheck);
	//filter('items.read', rulesCheck);
	//filter('items.promote', rulesCheck);
};

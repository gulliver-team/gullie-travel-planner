/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as schemas_city from "../schemas/city.js";
import type * as schemas_date from "../schemas/date.js";
import type * as schemas_flight from "../schemas/flight.js";
import type * as schemas_message from "../schemas/message.js";
import type * as schemas_rental from "../schemas/rental.js";
import type * as schemas_user from "../schemas/user.js";
import type * as schemas_visa from "../schemas/visa.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "schemas/city": typeof schemas_city;
  "schemas/date": typeof schemas_date;
  "schemas/flight": typeof schemas_flight;
  "schemas/message": typeof schemas_message;
  "schemas/rental": typeof schemas_rental;
  "schemas/user": typeof schemas_user;
  "schemas/visa": typeof schemas_visa;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

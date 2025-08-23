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
import type * as city from "../city.js";
import type * as conversations from "../conversations.js";
import type * as emails_RelocationReport from "../emails/RelocationReport.js";
import type * as http from "../http.js";
import type * as mcp from "../mcp.js";
import type * as mutate_city from "../mutate/city.js";
import type * as mutate_date from "../mutate/date.js";
import type * as mutate_flight from "../mutate/flight.js";
import type * as mutate_rental from "../mutate/rental.js";
import type * as query_city from "../query/city.js";
import type * as schemas_city from "../schemas/city.js";
import type * as schemas_conversation from "../schemas/conversation.js";
import type * as schemas_date from "../schemas/date.js";
import type * as schemas_document from "../schemas/document.js";
import type * as schemas_flight from "../schemas/flight.js";
import type * as schemas_message from "../schemas/message.js";
import type * as schemas_rental from "../schemas/rental.js";
import type * as schemas_subscription from "../schemas/subscription.js";
import type * as schemas_user from "../schemas/user.js";
import type * as schemas_visa from "../schemas/visa.js";
import type * as schemas_zod_schemas from "../schemas/zod_schemas.js";
import type * as simulations from "../simulations.js";
import type * as storage from "../storage.js";
import type * as subscriptions from "../subscriptions.js";
import type * as tools_citySearch from "../tools/citySearch.js";
import type * as tools_conversationTracker from "../tools/conversationTracker.js";
import type * as tools_costEstimation from "../tools/costEstimation.js";
import type * as tools_documentDetails from "../tools/documentDetails.js";
import type * as tools_emailCapture from "../tools/emailCapture.js";
import type * as tools_pdfSender from "../tools/pdfSender.js";
import type * as tools_updateUserReport from "../tools/updateUserReport.js";
import type * as tools_visaRequirements from "../tools/visaRequirements.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  city: typeof city;
  conversations: typeof conversations;
  "emails/RelocationReport": typeof emails_RelocationReport;
  http: typeof http;
  mcp: typeof mcp;
  "mutate/city": typeof mutate_city;
  "mutate/date": typeof mutate_date;
  "mutate/flight": typeof mutate_flight;
  "mutate/rental": typeof mutate_rental;
  "query/city": typeof query_city;
  "schemas/city": typeof schemas_city;
  "schemas/conversation": typeof schemas_conversation;
  "schemas/date": typeof schemas_date;
  "schemas/document": typeof schemas_document;
  "schemas/flight": typeof schemas_flight;
  "schemas/message": typeof schemas_message;
  "schemas/rental": typeof schemas_rental;
  "schemas/subscription": typeof schemas_subscription;
  "schemas/user": typeof schemas_user;
  "schemas/visa": typeof schemas_visa;
  "schemas/zod_schemas": typeof schemas_zod_schemas;
  simulations: typeof simulations;
  storage: typeof storage;
  subscriptions: typeof subscriptions;
  "tools/citySearch": typeof tools_citySearch;
  "tools/conversationTracker": typeof tools_conversationTracker;
  "tools/costEstimation": typeof tools_costEstimation;
  "tools/documentDetails": typeof tools_documentDetails;
  "tools/emailCapture": typeof tools_emailCapture;
  "tools/pdfSender": typeof tools_pdfSender;
  "tools/updateUserReport": typeof tools_updateUserReport;
  "tools/visaRequirements": typeof tools_visaRequirements;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

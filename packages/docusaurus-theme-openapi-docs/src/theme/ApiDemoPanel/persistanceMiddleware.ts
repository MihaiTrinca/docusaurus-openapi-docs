/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { Middleware } from "@reduxjs/toolkit";

import { ThemeConfig } from "../../types";
import { AppDispatch, RootState } from "../ApiItem/store";
import { setAuthData, setSelectedAuth } from "./Authorization/slice";
import { createStorage, hashArray } from "./storage-utils";

export function createPersistanceMiddleware(options: ThemeConfig["api"]) {
  const persistanceMiddleware: Middleware<{}, RootState, AppDispatch> =
    (storeAPI) => (next) => (action) => {
      const result = next(action);

      const state = storeAPI.getState();

      const storage = createStorage("sessionStorage");

      if (action.type === setAuthData.type) {
        for (const [key, value] of Object.entries(state.auth.data)) {
          if (Object.values(value).filter(Boolean).length > 0) {
            storage.setItem(key, JSON.stringify(value));
          } else {
            storage.removeItem(key);
          }
        }
      }

      if (action.type === setSelectedAuth.type) {
        if (state.auth.selected) {
          storage.setItem(
            hashArray(Object.keys(state.auth.options)),
            state.auth.selected
          );
        }
      }

      if (action.type === "contentType/setContentType") {
        storage.setItem("contentType", action.payload);
      }

      if (action.type === "accept/setAccept") {
        storage.setItem("accept", action.payload);
      }

      if (action.type === "server/setServer") {
        storage.setItem("server", action.payload);
      }

      if (action.type === "server/setServerVariable") {
        const server = storage.getItem("server") ?? "{}";
        const variables = JSON.parse(action.payload);
        let serverObject = JSON.parse(server);
        serverObject.variables[variables.key].default = variables.value;
        storage.setItem("server", JSON.stringify(serverObject));
      }

      return result;
    };
  return persistanceMiddleware;
}

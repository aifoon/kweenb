import { contextBridge } from "electron";
import methods from "./methods";
import actions from "./actions";
import events from "./events";

contextBridge.exposeInMainWorld("kweenb", {
  methods,
  actions,
  events,
});

declare class Error {
  message: string;
}

declare class chromeRuntime {
  id: string;
  lastError: Error;
}

declare class chromeExtension {
  sendRequest(extensionId: string, request: any, responseCallback: function): void;
  getURL(path: string): string;
  getViews(fetchProperties: any): any;
  getBackgroundPage(): any;
  getExtensionTabs(windowId: number): any;
  isAllowedIncognitoAccess(callback: function): any;
  isAllowedFileSchemeAccess(callback: function): any;
  setUpdateUrlData(data: string): any;

  onRequest: function;
  onRequestExternal: function;
}

/* https://developer.chrome.com/extensions/tabs */
declare class chromeTabs {
  get(tabId: number, callback: function): void;
  getCurrent(callback: function): void;
  connect(tabId: number, connectInfo: any): void;
  sendRequest(tabId: number, request: any, responseCallback: function): void;
  sendMessage(tabId: number, message: any, options: any, responseCallback:function | void): void;
  getSelected(windowId: ?number, callback: function): void;
  getAllInWindow(windowId: number, callback: function): void;
  create(createProperties: any, callback: function): void;
  duplicate(tabId: number, callback: function): void;
  query(queryInfo: any, callback: function): void;
  highlight(highlightInfo: any, callback: function): void;
  update(tabId: number, updateProperties: any, callback: function | void): void;
  move(tabIds: Array<number> | number, moveProperties: any, callback: function): void;
  reload(tabId: number, reloadProperties: any, callback: function): void;
  remove(tabIds: Array<number> | number, callback: function): void;
  detectLanguage(tabId: number, callback: function): void;
  captureVisibleTab(windowId: number, options: any, callback: function): void;
  executeScript(tabId: number, details: any, callback: function): void;
  insertCSS(tabId: number, details: any, callback: function): void;
  setZoom(tabId: number, zoomFactor: number, callback: function): void;
  getZoom(tabId: number, callback: function): void;
  setZoomSettings(tabId: number, zoomSettings: any, callback: function): void;
  getZoomSettings(tabId: number, callback: function): void;

  onCreated: function;
  onUpdated: function;
  onMoved: function;
  onSelectionChanged: function;
  onActiveChanged: function;
  onActivated: function;
  onHighlightChanged: function;
  onHighlighted: function;
  onDetached: function;
  onAttached: function;
  onRemoved: function;
  onReplaced: function;
  onZoomChange: function;
}

declare class chromeStorage {
  sync: any;
  local: any;
  managed: any;

  onChanged: function;
}

declare class chromeCookies {
  get(details: any, callback: function | void): void;
  getAll(details: any, callback: function | void): void;
  set(details: any, callback: function | void): void;
  remove(details: any, callback: function | void): void;
  getAllCookieStores(callback: function | void): void;
}

declare class chrome {
  static runtime: chromeRuntime;
  static extension: chromeExtension;
  static tabs: chromeTabs;
  static storage: chromeStorage;
  static contextMenus: any; // TODO
  static browserAction: any; // TODO
  static cookies: chromeCookies;
}

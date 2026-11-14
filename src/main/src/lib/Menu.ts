import { AppMode, AppViews } from "@shared/enums";
import {
  app,
  Menu,
  BrowserWindow,
  MenuItemConstructorOptions,
  dialog,
  shell,
} from "electron";
import { KweenB, KweenBGlobal } from "../kweenb";
import BeeHelpers from "./KweenB/BeeHelpers";
import SettingsHelper from "./KweenB/SettingHelpers";
import { PRESETS_FOLDER_PATH, USER_DATA } from "../consts";
import { removeActionListeners, removeMethodHandlers } from "../register";
import { DEFAULT_APP_MODE, DEFAULT_APP_VIEWS } from "@shared/consts";
import path from "node:path";
import fs from "node:fs";

interface CustomMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: CustomMenuItemConstructorOptions[] | Menu;
}

export default class MenuBuilder {
  private mainWindow: BrowserWindow;

  private isDevelopment: boolean;

  constructor(mainWindow: BrowserWindow, isDevelopment: boolean) {
    this.mainWindow = mainWindow;
    this.isDevelopment = isDevelopment;
  }

  /**
   * Building the Electron Application
   *
   * @returns
   */
  buildMenu(): Menu {
    if (this.isDevelopment || !this.isDevelopment) {
      this.setupDevelopmentEnvironment();
    }

    // get the template based on the OS
    let template;
    if (process.platform === "darwin") {
      template = this.buildDarwinTemplate();
    } else {
      template = this.buildLinuxTemplate();
    }

    // create the menu and set it as application menu
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  /**
   * Adds menu items based needed for development purposes
   */
  setupDevelopmentEnvironment(): void {
    this.mainWindow.webContents.on("context-menu", (_, props) => {
      const { x, y } = props;
      Menu.buildFromTemplate([
        {
          label: "Inspect element",
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }

  /**
   * The File menu, the same on every platform
   */
  buildFileMenu(): CustomMenuItemConstructorOptions {
    const jsonFile = [{ name: "JSON", extensions: ["json"] }];

    return {
      label: "File",
      submenu: [
        {
          label: "Add Speaker",
          submenu: [
            {
              label: "New Speaker…",
              accelerator: "CmdOrCtrl+N",
              click: () => {
                this.mainWindow.webContents.send("new-speaker");
              },
            },
            {
              label: "By Hand…",
              click: () => {
                this.mainWindow.webContents.send("add-bee");
              },
            },
          ],
        },
        {
          label: "Save Sounds to This Computer…",
          accelerator: "CmdOrCtrl+S",
          click: () => {
            this.mainWindow.webContents.send("save-sounds");
          },
        },
        { type: "separator" },
        {
          label: "Import",
          submenu: [
            {
              label: "Bees…",
              click: () => {
                dialog
                  .showOpenDialog(this.mainWindow, {
                    properties: ["openFile"],
                    filters: jsonFile,
                  })
                  .then((result) => {
                    if (result.filePaths && result.filePaths.length > 0) {
                      BeeHelpers.importBees(result.filePaths[0]);
                      this.mainWindow.webContents.send("imported-bees");
                    }
                  });
              },
            },
            {
              label: "Settings…",
              click: () => {
                dialog
                  .showOpenDialog(this.mainWindow, {
                    properties: ["openFile"],
                    filters: jsonFile,
                  })
                  .then((result) => {
                    if (result.filePaths && result.filePaths.length > 0) {
                      SettingsHelper.importSettings(result.filePaths[0]);
                      this.mainWindow.webContents.send("imported-settings");
                    }
                  });
              },
            },
          ],
        },
        {
          label: "Export",
          submenu: [
            {
              label: "Bees…",
              click: () => {
                dialog
                  .showSaveDialog(this.mainWindow, {
                    defaultPath: "kweenb-bees.json",
                    filters: jsonFile,
                  })
                  .then((result) => {
                    BeeHelpers.exportBees(result.filePath || "");
                  });
              },
            },
            {
              label: "Settings…",
              click: () => {
                dialog
                  .showSaveDialog(this.mainWindow, {
                    defaultPath: "kweenb-settings.json",
                    filters: jsonFile,
                  })
                  .then((result) => {
                    SettingsHelper.exportSettings(result.filePath || "");
                  });
              },
            },
          ],
        },
        { type: "separator" },
        {
          label: "Open Presets Folder",
          click: () => {
            shell.openPath(PRESETS_FOLDER_PATH);
          },
        },
        {
          label: "Show App Logging",
          click: () => {
            // Get the path to the log file
            const logPath = path.join(app.getPath("userData"), "app.log");

            // Check if the log file exists
            if (!fs.existsSync(logPath)) {
              dialog.showErrorBox(
                "Log File Not Found",
                "The log file does not exist."
              );
              return;
            }

            // Open the log file in the default text editor
            shell.openPath(logPath);
          },
        },
        {
          label: "Open QjackCtl",
          click: () => {
            shell.openPath(`${USER_DATA}/jack/QjackCtl.app`);
          },
        },
      ],
    };
  }

  /**
   * Builds the Darwin Template
   *
   * @returns The MenuItems needed for the template
   */
  buildDarwinTemplate(): MenuItemConstructorOptions[] {
    // The About Menu
    const subMenuAbout: CustomMenuItemConstructorOptions = {
      label: "kweenb",
      submenu: [
        {
          label: "About kweenb",
          click: () => {
            this.mainWindow.webContents.send("about-kweenb");
          },
        },
        { type: "separator" },
        {
          label: "Hide kweenb",
          accelerator: "Command+H",
          selector: "hide:",
        },
        {
          label: "Hide Others",
          accelerator: "Command+Shift+H",
          selector: "hideOtherApplications:",
        },
        { label: "Show All", selector: "unhideAllApplications:" },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: "Command+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    };

    // The file menu
    const subMenuFile = this.buildFileMenu();

    /**
     * The Edit menu
     */
    const subMenuEdit: CustomMenuItemConstructorOptions = {
      label: "Edit",
      submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        {
          label: "Select All",
          accelerator: "CmdOrCtrl+A",
          selector: "selectAll:",
        },
      ],
    };

    // The Mode Menu
    const subMenuMode: CustomMenuItemConstructorOptions = {
      label: "Mode",
      submenu: [
        {
          label: "Hub",
          type: "radio",
          checked: (DEFAULT_APP_MODE as string) == AppMode.Hub,
          click: () => {
            this.mainWindow.webContents.send("app-mode", AppMode.Hub);
            KweenBGlobal.kweenb.appMode = AppMode.Hub;
          },
        },
        {
          label: "P2P",
          type: "radio",
          checked: (DEFAULT_APP_MODE as string) == AppMode.P2P,
          click: () => {
            this.mainWindow.webContents.send("app-mode", AppMode.P2P);
            KweenBGlobal.kweenb.appMode = AppMode.P2P;
          },
        },
      ],
    };

    // The Developer View Menu
    const subMenuViewDev: CustomMenuItemConstructorOptions = {
      label: "View",
      submenu: [
        {
          label: "Reload",
          accelerator: "Command+R",
          click: () => {
            removeMethodHandlers();
            removeActionListeners();
            KweenBGlobal.kweenb.beeStatesWorker.stopWorkers();
            this.mainWindow.webContents.reload();
          },
        },
        {
          label: "Toggle Full Screen",
          accelerator: "Ctrl+Command+F",
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
        {
          label: "Toggle Developer Tools",
          accelerator: "Alt+Command+I",
          click: () => {
            this.mainWindow.webContents.toggleDevTools();
          },
        },
        { type: "separator" },
        ...Object.values(AppViews).map((view) => ({
          label: view.charAt(0).toUpperCase() + view.slice(1),
          type: "checkbox" as const,
          checked: DEFAULT_APP_VIEWS.includes(view),
          click: (e: Electron.MenuItem) => {
            this.mainWindow.webContents.send("show-view", view, e.checked);
          },
        })),
      ],
    };

    // The Production View Menu
    const subMenuViewProd: CustomMenuItemConstructorOptions = {
      label: "View",
      submenu: [
        {
          label: "Toggle Full Screen",
          accelerator: "Ctrl+Command+F",
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
        { type: "separator" },
        ...Object.values(AppViews).map((view) => ({
          label: view.charAt(0).toUpperCase() + view.slice(1),
          type: "checkbox" as const,
          checked: DEFAULT_APP_VIEWS.includes(view),
          click: (e: Electron.MenuItem) => {
            this.mainWindow.webContents.send("show-view", view, e.checked);
          },
        })),
      ],
    };

    // The Window Menu
    const subMenuWindow: CustomMenuItemConstructorOptions = {
      label: "Window",
      submenu: [
        {
          label: "Minimize",
          accelerator: "Command+M",
          selector: "performMiniaturize:",
        },
        { type: "separator" },
        { label: "Bring All to Front", selector: "arrangeInFront:" },
      ],
    };

    return [
      subMenuAbout,
      subMenuFile,
      subMenuEdit,
      subMenuMode,
      this.isDevelopment ? subMenuViewDev : subMenuViewProd,
      subMenuWindow,
    ];
  }

  /**
   * Builds the Linux Template
   *
   * @returns The MenuItems needed for the template
   */
  buildLinuxTemplate(): MenuItemConstructorOptions[] {
    // The About Menu
    const subMenuAbout: CustomMenuItemConstructorOptions = {
      label: "kweenb",
      submenu: [
        {
          label: "About kweenb",
          click: () => {
            this.mainWindow.webContents.send("about-kweenb");
          },
        },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: "CTRL+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    };

    // The file menu
    const subMenuFile = this.buildFileMenu();

    // The Mode Menu
    const subMenuMode: CustomMenuItemConstructorOptions = {
      label: "Mode",
      submenu: [
        {
          label: "Hub",
          type: "radio",
          click: () => {
            this.mainWindow.webContents.send("app-mode", AppMode.Hub);
            KweenBGlobal.kweenb.appMode = AppMode.Hub;
          },
        },
        {
          label: "P2P",
          type: "radio",
          checked: true,
          click: () => {
            this.mainWindow.webContents.send("app-mode", AppMode.P2P);
            KweenBGlobal.kweenb.appMode = AppMode.P2P;
          },
        },
      ],
    };

    return [subMenuAbout, subMenuFile, subMenuMode];
  }

  /**
   * Build The Default Template
   *
   * @returns
   */
  buildDefaultTemplate() {
    const templateDefault = [
      {
        label: "&File",
        submenu: [
          {
            label: "&Open",
            accelerator: "Ctrl+O",
          },
          {
            label: "&Close",
            accelerator: "Ctrl+W",
            click: () => {
              this.mainWindow.close();
            },
          },
        ],
      },
      {
        label: "&View",
        submenu: this.isDevelopment
          ? [
              {
                label: "&Reload",
                accelerator: "Ctrl+R",
                click: () => {
                  this.mainWindow.webContents.reload();
                },
              },
              {
                label: "Toggle &Full Screen",
                accelerator: "F11",
                click: () => {
                  this.mainWindow.setFullScreen(
                    !this.mainWindow.isFullScreen()
                  );
                },
              },
              {
                label: "Toggle &Developer Tools",
                accelerator: "Alt+Ctrl+I",
                click: () => {
                  this.mainWindow.webContents.toggleDevTools();
                },
              },
            ]
          : [
              {
                label: "Toggle &Full Screen",
                accelerator: "F11",
                click: () => {
                  this.mainWindow.setFullScreen(
                    !this.mainWindow.isFullScreen()
                  );
                },
              },
            ],
      },
    ];

    return templateDefault;
  }
}

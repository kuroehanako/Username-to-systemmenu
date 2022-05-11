// Import nescessary libs
const Main = imports.ui.main;
const Util = imports.misc.util;
const Shell = imports.gi.Shell;
const PopupMenu = imports.ui.popupMenu;
const { AccountsService, Clutter, GLib, St } = imports.gi;
const { Avatar } = imports.ui.userWidget;
const Config = imports.misc.config;
const GObject = imports.gi.GObject;

const SystemActions = imports.misc.systemActions;

//Import extension preferences
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

//Creates temporary iconMenuItem variable
var iconMenuItem = null;

//Creates some global variables
let shell_Version = Config.PACKAGE_VERSION;

function init() {
    DefaultActions = new SystemActions.getDefault();
}

//Run when enabled
function enable() {
	
}

//Run when disabled
function disable() {
    //Disconnects systemMenu
    if (this._menuOpenStateChangedId) {
        this.systemMenu.menu.disconnect(this._menuOpenStateChangedId);
        this._menuOpenStateChangedId = 0;
    }
    //Destroys iconMenuItem (basically removes the option from the menu)
    iconMenuItem.destroy();
    Main.panel._leftBox.remove_child(hostname_lbl);
    hostname_lbl.destroy();
    hostname_lbl = null;
}

//Destroys everything and creates a new one
function resetPre() {
    //Disconnects systemMenu
    if (this._menuOpenStateChangedId) {
        this.systemMenu.menu.disconnect(this._menuOpenStateChangedId);
        this._menuOpenStateChangedId = 0;
    }
    //Destroys iconMenuItem (basically removes the option from the menu)
    iconMenuItem.destroy();
    updateExtensionAppearence()
}

function updateExtensionAppearence() {
    //Creates new PopupMenuItem
    this.iconMenuItem = new PopupMenu.PopupMenuItem('');
    //Adds a box where we are going to store picture and avatar
    this.iconMenuItem.add_child(new St.BoxLayout({
                                    x_align: Clutter.ActorAlign.START,
                                    x_expand: true,
                                    y_expand: true,
                                    vertical: false,
                                }));

    this.iconMenuItem.connect('activate', (function() {
        let def = Shell.AppSystem.get_default();
        let app = def.lookup_app('gnome-user-accounts-panel.desktop');
        app.activate();
	}).bind(this));

    //Adds item to menu
    Main.panel.statusArea.aggregateMenu.menu.addMenuItem(this.iconMenuItem, 0);
    this.systemMenu = Main.panel.statusArea['aggregateMenu']._system;

    //When the popup menu opens do this:
    //Check if on compact mode
    this._menuOpenStateChangedId = this.systemMenu.menu.connect('open-state-changed', 
        (menu, open) => {
            if (!open)
                return;
	        //Get user avatar and name
            var userManager = AccountsService.UserManager.get_default();
            var user = userManager.get_user(GLib.get_user_name());
            //Get user icon
            var avatar = new Avatar(user, {
                iconSize: 48,
            });

            //Get user name and center it vertically
            var userString = new St.Label ({
                style_class: 'userDisplaName',
              	text: GLib.get_real_name()
            });

            var usernameString = new St.Label ({
                style_class: 'userName',
                text: GLib.get_user_name()
            });
            var userBox = new St.BoxLayout({
                style_class: 'userNameBox',
                y_align: Clutter.ActorAlign.CENTER,
                vertical: true,
            });

            userBox.add_child(userString);
            userBox.add_child(usernameString);

            avatar.update();

            //Remove all created menu itens
            this.iconMenuItem.actor.get_last_child().remove_all_children();

            //Add the avatar picture
            this.iconMenuItem.actor.get_last_child().add_child(avatar.actor);

            //Add name
            this.iconMenuItem.actor.get_last_child().add_child(userBox);
    });
}

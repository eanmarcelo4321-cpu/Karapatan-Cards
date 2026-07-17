#import <Capacitor/Capacitor.h>

// Registers the Swift LocalMultiplayerPlugin class with Capacitor's plugin
// bridge and declares which JS-callable methods it exposes. Required for
// any locally-defined (non-npm) Capacitor plugin — see:
// https://capacitorjs.com/docs/plugins/ios#export-to-capacitor
CAP_PLUGIN(LocalMultiplayerPlugin, "LocalMultiplayer",
    CAP_PLUGIN_METHOD(startServer, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(stopServer, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(send, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(broadcast, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getLocalIP, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(startAdvertising, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(stopAdvertising, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(startDiscovery, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(stopDiscovery, CAPPluginReturnPromise);
)

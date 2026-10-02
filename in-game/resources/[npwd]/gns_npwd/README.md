# gns_npwd

**This is a compatibility resource that enables [npwd](https://github.com/project-error/npwd) to function properly with [gns_core](https://github.com/Genesis-project/gns_core). Please ensure that you have the latest *release* of [npwd](https://github.com/project-error/npwd) and [gns_core](https://github.com/Genesis-project/gns_core) installed**

## Installation Steps:
1. Download this repository and place it in the `resources` directory
2. Run the `patch.sql` to patch the database for [npwd](https://github.com/project-error/npwd)
3. Add `ensure gns_npwd` to your `server.cfg` (Start this resource after `gns_core` and `ox_inventory` and before `npwd` have been started)

## Other Features
1. Double clicking any phone items in the inventory will open the phone. If you want to be able to drag and drop phone items over the Use button in the inventory, you must navigate to `gns_core/shared/items.lua`, find your phone item, and change `usable` to `true` and `shouldClose` to `true`.
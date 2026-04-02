/**
 * Z-index values used througout UI
 * NOTE: globals.css also uses z-index: 1001 for .maplibregl-ctrl-bottom-left
 *       which matches `mapPopover` below. Keep in sync manually.
 */
export const zIndex = {
  sideNav: 100,
  mapControl: 1000, // legend, basemap btn, recenter btn, panel toggle btns
  mapPopover: 1001, // basemap popover, opacity popover
  menu: 1002, // header dropdown, model switcher
  mainPanel: 1010, // left control panel
  combobox: 1012, // combobox dropdown (must beat mainPanel)
  mobileSummary: 1100, // summary panel (mobile drawer)
  drawerBackdrop: 1700, // mobile nav drawer backdrop
  drawer: 1800, // mobile nav drawer
  toggleTip: 100000, // info toggle tips
} as const;

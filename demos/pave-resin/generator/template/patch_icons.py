p = '/Users/daniilsgoloveckis/dev/trade-demos/template/build.mjs'
s = open(p).read()
icons = r"""
  drive: sv('<path d="M3 10.5L12 4l9 6.5"/><path d="M5 9.5V20h14V9.5"/><path d="M9 20l1-6h4l1 6"/><path d="M10.4 17h3.2"/>'),
  patio: sv('<rect x="3" y="3" width="18" height="18" rx="1.5"/><path d="M3 9h18M3 15h18M10 3v6M15 9v6M8 15v6M16 15v6"/>'),
  block: sv('<path d="M3 5h8v4H3zM11 5h10v4H11zM3 9h5v4H3zM8 9h9v4H8zM17 9h4v4h-4zM3 13h8v4H3zM11 13h10v4H11zM3 17h5v3H3zM8 17h9v3H8z"/>', ' stroke-width="1.5"'),
  resin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="7" cy="8" r="1.1"/><circle cx="11" cy="9.5" r=".9"/><circle cx="15.5" cy="8" r="1.2"/><circle cx="8.5" cy="12.5" r="1"/><circle cx="13" cy="13" r="1.2"/><circle cx="17" cy="12" r=".9"/><circle cx="6.5" cy="16" r="1"/><circle cx="10.5" cy="16.5" r="1.2"/><circle cx="15" cy="16.5" r="1"/></svg>',
  fence: sv('<path d="M4 21V7l2-3 2 3v14M10 21V7l2-3 2 3v14M16 21V7l2-3 2 3v14M2 11h20M2 17h20"/>'),
  garden: sv('<path d="M12 22v-7"/><path d="M12 15c-4 0-6-3-6-6 3 0 6 2 6 6zM12 13c0-4 2-7 6-8 0 4-2 8-6 8z"/><path d="M3 22h18"/>'),
  tarmac: sv('<path d="M5 21L9 3M19 21L15 3M12 5v2.5M12 11v2.5M12 17v2.5"/>'),
  floor: sv('<path d="M2 20l5-8h10l5 8z"/><path d="M7 12V4h10v8"/><path d="M9 16h6"/>'),
  wall: sv('<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 7c2 1 6 1 8 0M8 12c3 1 5 1 8-.5M8 17c2 .8 6 .8 8 0"/>'),
  bath: sv('<path d="M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z"/><path d="M6 12V5a2 2 0 0 1 4 0"/><path d="M7 20l-1 2M17 20l1 2"/>'),
  worktop: sv('<path d="M2 9h20v3H2z"/><path d="M4 12v9M20 12v9M8 12v9h8v-9"/><path d="M14 9V5a2 2 0 0 1 4 0"/>'),
  other: sv('<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>'),
"""
anchor = "  menu: sv('<path d=\"M4 7h16M4 12h16M4 17h16\"/>'),"
assert anchor in s
s = s.replace(anchor, anchor + icons, 1)
open(p, 'w').write(s)
print('ok')

import { useState, useRef, useEffect } from 'react';
import { IoColorPaletteOutline } from 'react-icons/io5';
import { useTheme, THEMES } from '../../context/ThemeContext';

const SWATCHES = {
  minimal: ['#ffffff', '#4f46e5'],
  corporate: ['#1e3a5f', '#2563eb'],
  modern: ['#0f172a', '#10b981'],
};

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // close when clicking outside
  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Change theme"
        className="flex items-center gap-1 px-2 py-1 rounded-md border border-gray-300 bg-white text-gray-700 text-sm cursor-pointer hover:bg-gray-50"
      >
        <IoColorPaletteOutline size={18} />
        <span className="hidden sm:inline">Theme</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-1">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTheme(t.id);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm text-left cursor-pointer hover:bg-gray-100 text-gray-800 ${
                theme === t.id ? 'bg-gray-100 font-semibold' : ''
              }`}
            >
              <span className="flex">
                {SWATCHES[t.id].map((c) => (
                  <span
                    key={c}
                    className="w-4 h-4 rounded-full border border-gray-300 -mr-1"
                    style={{ background: c }}
                  />
                ))}
              </span>
              <span className="ml-2 flex-1">{t.label}</span>
              {theme === t.id && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
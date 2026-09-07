'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { GRAPHICS, readGraphics, type GraphicsChoice, type GraphicsLevel } from '@/lib/graphics';
const GraphicsContext = createContext({
  choice: 'auto' as GraphicsChoice,
  setChoice: (_: GraphicsChoice) => {},
  level: 'balanced' as GraphicsLevel,
  setAutoLevel: (_: GraphicsLevel | ((v: GraphicsLevel) => GraphicsLevel)) => {},
  still: false,
  setStill: (_: boolean) => {},
});
export const useGraphics = () => useContext(GraphicsContext);
export function GraphicsProvider({ children }: { children: ReactNode }) {
  const [choice, setChoice] = useState<GraphicsChoice>('auto');
  const [autoLevel, setAutoLevel] = useState<GraphicsLevel>('balanced');
  const [still, setStill] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      setChoice(readGraphics(localStorage.getItem('dev-island-graphics')));
      setStill(localStorage.getItem('dev-island-still') === 'true');
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem('dev-island-graphics', choice);
      localStorage.setItem('dev-island-still', String(still));
    } catch {}
  }, [choice, still, loaded]);
  return (
    <GraphicsContext.Provider
      value={{
        choice,
        setChoice,
        level: choice === 'auto' ? autoLevel : choice,
        setAutoLevel,
        still,
        setStill,
      }}
    >
      {children}
    </GraphicsContext.Provider>
  );
}
export default function GraphicsSettings() {
  const [open, setOpen] = useState(false);
  const { choice, setChoice, level, still, setStill } = useGraphics();
  return (
    <div
      className="graphics-settings"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          e.stopPropagation();
          setOpen(false);
        }
      }}
    >
      <button
        className="lighting-icon"
        title="World settings"
        aria-label="World settings"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <SlidersHorizontal size={18} />
      </button>
      {open && (
        <section className="graphics-popover" aria-label="World settings">
          <div className="graphics-heading">
            <strong>Make it yours</strong>
            <button aria-label="Close world settings" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>
          <label htmlFor="graphics-quality">3D detail</label>
          <select
            id="graphics-quality"
            value={choice}
            onChange={(e) => setChoice(readGraphics(e.target.value))}
          >
            <option value="auto">Automatic</option>
            <option value="high">High detail</option>
            <option value="low">Battery saver</option>
          </select>
          <p>
            {choice === 'auto'
              ? `Adapting to your device · ${level} detail.`
              : choice === 'high'
                ? 'Sharper shadows and denser planting.'
                : 'Lighter shadows, planting and resolution.'}
          </p>
          <label className="motion-setting">
            <input type="checkbox" checked={still} onChange={(e) => setStill(e.target.checked)} />{' '}
            Still scenery
          </label>
          <p>You can keep walking. Your device’s reduced-motion preference is always respected.</p>
        </section>
      )}
    </div>
  );
}
export { GRAPHICS };

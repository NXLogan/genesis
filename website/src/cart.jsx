import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export const SHOP_ITEMS = [
  {
    id: 'pass-founder',
    name: 'Pass Fondateur',
    price: 24.99,
    blurb: 'Accès anticipé, rôle Discord exclusif et pack de démarrage.',
  },
  {
    id: 'pack-vehicule',
    name: 'Pack Véhicule Custom',
    price: 14.99,
    blurb: 'Un véhicule unique livré in-game + plaque personnalisée.',
  },
  {
    id: 'slot-perso',
    name: 'Slot Personnage Extra',
    price: 9.99,
    blurb: 'Un personnage supplémentaire pour élargir ton lore.',
  },
  {
    id: 'boost-xp',
    name: 'Boost XP ×2 (7 jours)',
    price: 7.99,
    blurb: 'Double l’expérience pendant une semaine de jeu.',
  },
];

export function CartProvider({ children }) {
  const [items, setItems] = useState({});

  const value = useMemo(() => {
    const lines = SHOP_ITEMS.filter((p) => items[p.id]).map((p) => ({
      ...p,
      qty: items[p.id],
      total: items[p.id] * p.price,
    }));

    return {
      items,
      count: Object.values(items).reduce((n, q) => n + q, 0),
      lines,
      total: lines.reduce((s, l) => s + l.total, 0),
      add(id) {
        setItems((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
      },
      remove(id) {
        setItems((prev) => {
          const next = { ...prev };
          if (!next[id]) return prev;
          if (next[id] <= 1) delete next[id];
          else next[id] -= 1;
          return next;
        });
      },
      clear() {
        setItems({});
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart hors CartProvider');
  return ctx;
}

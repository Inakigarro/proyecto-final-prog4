/**
 * Hooks tipados para usar el store de Redux.
 *
 * Reexporta useDispatch y useSelector con los tipos del store ya
 * inferidos, para no tener que importar RootState/AppDispatch en cada
 * componente que los use.
 *
 * Uso:
 *   const items = useAppSelector((s) => s.cart.items);
 *   const dispatch = useAppDispatch();
 */

import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
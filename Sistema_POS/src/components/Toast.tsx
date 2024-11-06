import toast from 'react-hot-toast';
import { COLORS } from '../constants/constants';

export function showToast(text: string, type: boolean) {
  toast(text, {
    duration: 1000,
    position: 'bottom-right',
    style: { backgroundColor: type ? COLORS.primary : COLORS.redprimary, color: 'white', fontWeight: '600' }
  });
}